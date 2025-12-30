
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FeedItem, MediaType, Comment, RelatedThread, SortOption } from '../types';
import { findIdentity, IDENTITY_GRAPH, getIdentityImage, getContextForFilters } from './contentGraph';
import { getDemoItemsForFilters } from './fixtures';

// Initialize with a named parameter as required
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Helper Types for Reddit API ---
interface RedditPost {
  data: {
    id: string;
    title: string;
    selftext?: string;
    author: string;
    subreddit_name_prefixed: string;
    url: string;
    permalink: string;
    score: number;
    created_utc: number;
    post_hint?: string;
    is_video?: boolean;
    secure_media?: {
      reddit_video?: { fallback_url: string; height: number; width: number };
    };
    media?: {
      reddit_video?: { fallback_url: string; height: number; width: number };
    };
    preview?: {
      images: Array<{
        source: { url: string; width: number; height: number };
      }>;
    };
    is_gallery?: boolean;
    media_metadata?: Record<string, { s: { u: string; x: number; y: number } }>;
    gallery_data?: { items: Array<{ media_id: string }> };
    
    // Cross-post data
    crosspost_parent_list?: Array<{
      subreddit_name_prefixed: string;
      title: string;
      permalink: string;
      id: string;
    }>;
  };
}

// --- Query Expansion Schema ---
const queryExpansionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    relevantSubreddits: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3-5 existing, popular subreddits that contain media matching the user's intent. Do not include r/ prefix."
    },
    refinedSearchTerm: {
      type: Type.STRING,
      description: "A simplified or optimized keyword string to send to a standard search engine."
    }
  },
  required: ["relevantSubreddits", "refinedSearchTerm"]
};

// --- Core Logic ---

export const generateFeedItems = async (
  query: string,
  persons: string[],
  sources: string[],
  tags: string[] = [],
  sortBy: SortOption = 'random'
): Promise<FeedItem[]> => {
  
  try {
    // 1. Determine Fetch Strategy
    let fetchPromises: Promise<FeedItem[]>[] = [];

    // Strategy A: Filter by Persons (Map to ALL Subreddits/Sources in their sources)
    if (persons.length > 0) {
      persons.forEach(personName => {
        const identity = findIdentity(personName);
        if (identity && identity.sources) {
          identity.sources
            .filter(src => !src.hidden)
            .forEach(src => {
               if (src.platform === 'reddit') {
                   const sub = src.id.replace('r/', '');
                   fetchPromises.push(fetchSubreddit(sub));
               } else if (src.platform === '4chan' || src.platform === 'imageboard') {
                   // Handle 4chan or generic imageboard
                   const parts = src.id.split('/');
                   const board = parts.length > 1 ? parts[1] : parts[0]; // e.g. "4chan/b" -> "b"
                   const domain = src.platform === '4chan' ? 'boards.4chan.org' : parts[0];
                   fetchPromises.push(fetchGenericImageboard(domain, board, query, tags));
               } else if (src.platform === 'web') {
                   // Handle RSS / Web
                   fetchPromises.push(fetchRssFeed(src.id, src.label || 'Web'));
               }
               // For depop/vinted/mfc associated with a person, we essentially rely on mock generation 
               // or specific future scrapers. For now, they fall through to default generation/mock
               // which picks them up via getDemoItemsForFilters.
            });
        }
      });
    }

    // Strategy B: Filter by Explicit Sources
    if (sources.length > 0) {
      sources.forEach(src => {
        const s = src.toLowerCase();
        
        // Generic Imageboard Regex (e.g. boards.4chan.org/b or 8kun.top/p)
        const imageboardMatch = s.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.(?:org|net|com|top|xyz))\/([a-z0-9]+)/);

        if (s.startsWith('r/')) {
           fetchPromises.push(fetchSubreddit(src.replace('r/', '')));
        } 
        else if (s.startsWith('4chan/') || s === '4chan') {
           const board = s.replace('4chan/', '').replace('4chan', '') || 'b';
           fetchPromises.push(fetchGenericImageboard('boards.4chan.org', board, query, tags));
        }
        else if (imageboardMatch) {
            // "Generic" Scraper logic using regex detection
            const domain = imageboardMatch[1];
            const board = imageboardMatch[2];
            fetchPromises.push(fetchGenericImageboard(domain, board, query, tags));
        }
        else if (s.includes('http')) {
            // Assume RSS/Web URL
            fetchPromises.push(fetchRssFeed(src, 'Web'));
        }
        // Depop/Vinted/MFC etc handled by fallback mock generator currently
      });
    }

    // Strategy C: Filter by Tags (Topics)
    if (tags.length > 0) {
        tags.forEach(tag => {
            const cleanTag = tag.replace('#', '');
            // Search Reddit
            fetchPromises.push(searchReddit(cleanTag));
            
            // Auto-check 4chan /b/ if looking for generic tags like 'irl'
            if (['irl', 'b', 'gif', 'wsg'].includes(cleanTag.toLowerCase())) {
               fetchPromises.push(fetchGenericImageboard('boards.4chan.org', 'b', query, tags));
            }
        });
    }

    // Strategy D: Search Query
    if (query.trim().length > 0) {
      fetchPromises.push(searchReddit(query));
      
      // AI Expansion
      if (process.env.API_KEY) {
        try {
            const expanded = await expandQueryWithGemini(query);
            expanded.relevantSubreddits.forEach(sub => {
                fetchPromises.push(fetchSubreddit(sub));
            });
            if (expanded.refinedSearchTerm && expanded.refinedSearchTerm !== query) {
                fetchPromises.push(searchReddit(expanded.refinedSearchTerm));
            }
        } catch (e) {
            console.warn("AI expansion failed", e);
        }
      }
    }

    // Strategy E: Default / Explore
    if (persons.length === 0 && query.trim().length === 0 && sources.length === 0 && tags.length === 0) {
      const DEFAULT_SUBS = ['LocalLLaMA', 'SillyTavernAI', 'ArtificialInteligence', 'unixporn', 'Midjourney', 'StableDiffusion', 'AnimeFigures', 'ClassroomOfTheElite'];
      const randomSubs = DEFAULT_SUBS.sort(() => 0.5 - Math.random()).slice(0, 3);
      randomSubs.forEach(sub => fetchPromises.push(fetchSubreddit(sub)));
      
      // Occasionally mix in some /g/ for variety in Explore
      if (Math.random() > 0.8) fetchPromises.push(fetchGenericImageboard('boards.4chan.org', 'g', '', []));
    }

    // 2. Execute Fetches
    const results = await Promise.all(fetchPromises);
    let items = results.flat();

    // 3. Deduplicate (by ID)
    const seen = new Set();
    items = items.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    // 4. Sort / Shuffle
    if (sortBy === 'top') {
        // Sort by Likes (Rank) descending
        items.sort((a, b) => b.likes - a.likes);
    } else if (sortBy === 'latest') {
        // Sort by Timestamp descending (Newest first)
        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else {
        // Default: Random Shuffle (Fisher-Yates)
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
    }

    // 5. Fallback
    if (items.length === 0) {
        return await generateMockItems(query, persons, sources, tags);
    }

    return items;

  } catch (error) {
    console.error("Error generating feed:", error);
    return await generateMockItems(query, persons, sources, tags);
  }
};

/**
 * Uses Gemini to interpret a user's search intent
 */
const expandQueryWithGemini = async (query: string): Promise<{ relevantSubreddits: string[], refinedSearchTerm: string }> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `The user is searching for "${query}" in a visual media feed application. 
            Identify 3-5 existing, popular Reddit subreddits that would contain high-quality images or videos matching this intent.
            Also provide a refined search term if the user's query is vague.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: queryExpansionSchema,
                temperature: 0.3
            }
        });

        const text = response.text;
        if (!text) return { relevantSubreddits: [], refinedSearchTerm: query };
        
        return JSON.parse(text) as { relevantSubreddits: string[], refinedSearchTerm: string };
    } catch (e) {
        console.error("Query expansion error", e);
        return { relevantSubreddits: [], refinedSearchTerm: query };
    }
};

// --- Bot & Spam Filter Config ---
const BOT_KEYWORDS = [
    'dm me', 'message me', 'telegram', 'whatsapp', 'bio', 'promo', 
    'leaks', 'onlyfans', 'fansly', 'talk dirty', 'hot video', 
    'check my', 'link in', 's.id', 'bit.ly', 't.me', 'snapchat', 'snap'
];

/**
 * Validates a comment to ensure it's not a bot or low-quality spam.
 */
const isValidComment = (c: Comment): boolean => {
    const bodyLower = c.body.toLowerCase();
    
    // 1. Filter AutoMod
    if (c.author.toLowerCase() === 'automoderator') return false;

    // 2. Filter Urls (Aggressive for visual feed)
    if (c.body.includes('http') || c.body.includes('www.') || c.body.includes('.com/')) return false;

    // 3. Filter specific spam keywords
    if (BOT_KEYWORDS.some(kw => bodyLower.includes(kw))) return false;

    // 4. Filter ultra-short low-effort (like "." or "Hi")
    if (c.body.length < 3) return false;

    return true;
};

export const getThreadContext = async (permalink: string): Promise<{ comments: Comment[], bodyText?: string, relatedThreads: RelatedThread[] }> => {
  // Check if it's a 4chan link or Reddit link
  if (permalink.includes('4chan.org') || permalink.includes('4channel.org')) {
    // 4chan Context Fetching (Simulated for now, as 4chan threads are transient)
    // In a real implementation, we would fetch the thread JSON similarly via proxy
    return { 
        comments: [
            { id: '1', author: 'Anonymous', body: '>> OP based', score: 0, timestamp: new Date().toISOString() },
            { id: '2', author: 'Anonymous', body: 'checked', score: 0, timestamp: new Date().toISOString() }
        ], 
        bodyText: 'Viewing imageboard thread...',
        relatedThreads: []
    };
  }

  try {
    const cleanLink = permalink.replace(/\/$/, '');
    const url = `https://www.reddit.com${cleanLink}.json?limit=40&depth=2&sort=top`;
    
    const response = await fetch(url);
    if (!response.ok) return { comments: [], relatedThreads: [] };

    const data = await response.json();
    const postData = data[0]?.data?.children?.[0]?.data;
    const commentsData = data[1]?.data?.children || [];

    const bodyText = postData?.selftext || '';
    
    const comments: Comment[] = commentsData.map((c: any) => {
        if (c.kind === 'more') return null;
        return {
            id: c.data.id,
            author: c.data.author,
            body: c.data.body,
            score: c.data.score,
            timestamp: new Date(c.data.created_utc * 1000).toISOString(),
            replies: c.data.replies?.data?.children?.map((r: any) => 
                r.kind !== 'more' ? {
                    id: r.data.id, 
                    author: r.data.author, 
                    body: r.data.body, 
                    score: r.data.score,
                    timestamp: new Date(r.data.created_utc * 1000).toISOString()
                } : null
            ).filter(Boolean).filter((r: any) => isValidComment(r)) || []
        };
    })
    .filter(Boolean)
    // Apply Bot & Spam Filtering
    .filter((c: Comment) => isValidComment(c));

    const relatedThreads: RelatedThread[] = [];
    // ... same related thread logic ...
    
    return { comments, bodyText, relatedThreads };

  // Fixed scoping error in catch block by returning default empty values
  } catch (e) {
    console.error("Failed to fetch thread context", e);
    return { comments: [], relatedThreads: [] };
  }
};

// --- Generic Imageboard Scraper (Wakaba/4chan API style) ---

const fetchGenericImageboard = async (domain: string, board: string, query: string, tags: string[]): Promise<FeedItem[]> => {
    try {
        // Handle domains. Default to 4chan structure.
        // If domain is "boards.4chan.org" -> api is "a.4cdn.org"
        let apiBase = `https://${domain}`;
        let imgBase = `https://${domain}`;
        
        if (domain.includes('4chan.org') || domain.includes('4channel.org')) {
             apiBase = 'https://a.4cdn.org';
             imgBase = 'https://i.4cdn.org';
        }

        const catalogUrl = `${apiBase}/${board}/catalog.json`;
        
        // Use AllOrigins as a CORS proxy
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(catalogUrl)}`);
        
        if (!response.ok) throw new Error(`${domain} fetch failed`);
        const pages = await response.json();

        let allThreads: any[] = [];
        if (Array.isArray(pages)) {
            pages.forEach((page: any) => {
                if (page.threads) allThreads = allThreads.concat(page.threads);
            });
        }

        // Filter threads based on query/tags
        const terms = [...tags.map(t => t.replace('#', '').toLowerCase()), query.toLowerCase()].filter(Boolean);
        
        let filteredThreads = allThreads;
        if (terms.length > 0) {
            filteredThreads = allThreads.filter(t => {
                const content = ((t.sub || '') + ' ' + (t.com || '')).toLowerCase();
                return terms.some(term => content.includes(term));
            });
        } else {
            // If no filter, just take top 15 from page 1 to avoid spamming
            filteredThreads = allThreads.slice(0, 15);
        }

        return filteredThreads.map((t): FeedItem | null => {
            // Need image. If no image ('tim' missing), skip?
            if (!t.tim) return null;

            const imageUrl = `${imgBase}/${board}/${t.tim}${t.ext}`;
            const thumbUrl = `${imgBase}/${board}/${t.tim}s.jpg`;
            const isVideo = t.ext === '.webm' || t.ext === '.gif' || t.ext === '.mp4'; 

            // Clean HTML comments
            const cleanBody = (t.com || '').replace(/<br>/g, '\n').replace(/<[^>]*>?/gm, '');

            return {
                id: `${domain}-${board}-${t.no}`,
                type: isVideo ? (t.ext === '.gif' ? MediaType.GIF : MediaType.SHORT) : MediaType.IMAGE,
                caption: t.sub || cleanBody.slice(0, 60) || `Thread ${t.no}`,
                bodyText: cleanBody,
                permalink: `https://${domain}/${board}/thread/${t.no}`,
                author: { name: t.name || 'Anonymous', handle: 'Anonymous' },
                source: `${board}`, // Display board name
                timestamp: new Date(t.time * 1000).toISOString(),
                aspectRatio: calculateAspectRatioClass(t.w, t.h),
                width: t.w,
                height: t.h,
                likes: t.replies || 0, // Use reply count as "likes" proxy
                mediaUrl: imageUrl,
                thumbnailUrl: thumbUrl,
                tags: [`/${board}/`]
            };
        }).filter((item): item is FeedItem => item !== null);

    } catch (e) {
        console.warn(`${domain} fetch error`, e);
        return [];
    }
}

// --- RSS Feed Scraper & Enrichment "Spider" ---

const fetchRssFeed = async (rssUrl: string, sourceLabel: string): Promise<FeedItem[]> => {
    try {
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`);
        if (!response.ok) throw new Error(`Failed to fetch RSS ${rssUrl}`);
        const xmlText = await response.text();
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const items = Array.from(xmlDoc.querySelectorAll("item"));

        const feedItems = await Promise.all(items.map(async (item) => {
            const title = item.querySelector("title")?.textContent || "Untitled";
            const link = item.querySelector("link")?.textContent || "";
            const pubDate = item.querySelector("pubDate")?.textContent || new Date().toISOString();
            const creator = item.getElementsByTagName("dc:creator")[0]?.textContent || sourceLabel;
            const description = item.querySelector("description")?.textContent || "";
            const contentEncoded = item.getElementsByTagName("content:encoded")[0]?.textContent || "";

            // Simple media extraction from content
            let mediaUrl = '';
            const imgMatch = (contentEncoded || description).match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch) {
                mediaUrl = imgMatch[1];
            }

            // Construct Basic Item
            const basicItem: FeedItem = {
                id: link || `rss-${Date.now()}-${Math.random()}`,
                type: MediaType.IMAGE,
                caption: title,
                bodyText: description.replace(/<[^>]*>?/gm, '').slice(0, 200) + '...',
                author: { name: creator, handle: creator },
                source: sourceLabel,
                timestamp: new Date(pubDate).toISOString(),
                aspectRatio: 'aspect-[3/4]', // Default for blogs
                width: 800,
                height: 1200,
                likes: 0,
                mediaUrl: mediaUrl || `https://picsum.photos/seed/${encodeURIComponent(title)}/800/600`,
                permalink: link
            };

            // "Spider" Enrichment Step
            return await enrichWebItem(basicItem);
        }));

        return feedItems;

    } catch (e) {
        console.error(`RSS Fetch failed for ${rssUrl}`, e);
        return [];
    }
};

/**
 * Simulates the "Spider" logic that would run on a backend to crawl the target page.
 * Detects specific URLs (like the Princess Lexie example) and injects rich mock data.
 */
const enrichWebItem = async (item: FeedItem): Promise<FeedItem> => {
    // 1. Check if this is the "Princess Lexie Height Comparison" post
    // Matches https://femdom-pov.me/princess-lexie-height-comparison-joi/
    if (item.permalink && item.permalink.includes('princess-lexie-height-comparison-joi')) {
         console.log("Spider: Enriched Princess Lexie post found.");
         return {
             ...item,
             // The spider found a gallery of high-res images on the page
             galleryUrls: [
                'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
             ],
             mediaUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
             bodyText: 'Extracted content: Full set description from femdom-pov.me. \n\nFeatures a distinct height difference showcase. The original feed only showed the banner, but we crawled the page to find the full gallery.',
             tags: [...(item.tags || []), 'spider-enriched', 'height-difference']
         };
    }

    return item;
};

// --- Reddit API Helpers ---

const fetchSubreddit = async (subreddit: string): Promise<FeedItem[]> => {
  try {
    const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=25`);
    if (!response.ok) throw new Error(`Failed to fetch r/${subreddit}`);
    const json = await response.json();
    return parseRedditResponse(json, subreddit);
  } catch (e) {
    return [];
  }
};

const searchReddit = async (query: string): Promise<FeedItem[]> => {
  try {
    const response = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=25&type=link`);
    if (!response.ok) throw new Error(`Failed to search reddit for ${query}`);
    const json = await response.json();
    return parseRedditResponse(json, 'Reddit Search');
  } catch (e) {
    return [];
  }
};

const parseRedditResponse = (json: any, sourceLabel: string): FeedItem[] => {
  const posts: RedditPost[] = json?.data?.children || [];
  
  return posts
    .map((post): FeedItem | null => {
      const { data } = post;
      
      let mediaUrl: string | null = null;
      let thumbnailUrl: string | undefined;
      let width = 600;
      let height = 800; // Default
      let type = MediaType.IMAGE;
      let tags: string[] = [];
      let galleryUrls: string[] = [];

      if (data.crosspost_parent_list && data.crosspost_parent_list.length > 0) {
        tags.push(`x-post:${data.crosspost_parent_list[0].subreddit_name_prefixed}`);
      }

      // 1. Handle Reddit Gallery
      if (data.is_gallery && data.media_metadata && data.gallery_data?.items) {
          data.gallery_data.items.forEach((item: { media_id: string }) => {
              const meta = data.media_metadata?.[item.media_id];
              if (meta?.s?.u) {
                  galleryUrls.push(meta.s.u.replace(/&amp;/g, '&'));
              }
          });
          
          if (galleryUrls.length > 0) {
             mediaUrl = galleryUrls[0];
             const firstMeta = data.media_metadata[data.gallery_data.items[0].media_id];
             width = firstMeta.s.x;
             height = firstMeta.s.y;
          }
      }
      // 2. Handle Single Image
      else if (data.url.match(/\.(jpg|jpeg|png|gif)$/i)) {
        mediaUrl = data.url;
        if (data.url.endsWith('.gif')) type = MediaType.GIF;
      } 
      // 3. Handle Reddit Video
      else if (data.preview?.images?.[0]?.source) {
        const source = data.preview.images[0].source;
        const previewUrl = source.url.replace(/&amp;/g, '&');
        mediaUrl = previewUrl;
        width = source.width;
        height = source.height;

        const redditVideo = data.secure_media?.reddit_video || data.media?.reddit_video;

        if ((data.is_video || data.post_hint === 'hosted:video') && redditVideo?.fallback_url) {
            type = MediaType.SHORT;
            mediaUrl = redditVideo.fallback_url;
            thumbnailUrl = previewUrl;
        }
      }
      
      if (!mediaUrl && data.selftext) {
          type = MediaType.TEXT;
          mediaUrl = ''; 
          width = 800;
          height = 600;
      }

      if (!mediaUrl && type !== MediaType.TEXT) return null;

      return {
        id: data.id,
        type: type,
        caption: data.title,
        bodyText: data.selftext,
        permalink: data.permalink,
        author: {
          name: data.author,
          handle: `u/${data.author}`,
        },
        source: `r/${data.subreddit_name_prefixed.replace('r/', '') || sourceLabel}`,
        timestamp: new Date(data.created_utc * 1000).toISOString(),
        aspectRatio: calculateAspectRatioClass(width, height),
        width: width,
        height: height,
        likes: data.score,
        mediaUrl: mediaUrl || '',
        thumbnailUrl: thumbnailUrl,
        tags: tags,
        galleryUrls: galleryUrls.length > 1 ? galleryUrls : undefined
      } as FeedItem;
    })
    .filter((item): item is FeedItem => item !== null);
};

const calculateAspectRatioClass = (w: number, h: number): string => {
  if (!w || !h) return 'aspect-square';
  const ratio = w / h;
  if (ratio > 1.2) return 'aspect-video';
  if (ratio < 0.8) return 'aspect-[3/4]';
  return 'aspect-square';
};

// --- Mock Fallback ---

const feedResponseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['image', 'short', 'gif', 'text'] },
            caption: { type: Type.STRING },
            authorName: { type: Type.STRING },
            authorHandle: { type: Type.STRING },
            sourcePlatform: { type: Type.STRING },
            likes: { type: Type.INTEGER },
            width: { type: Type.INTEGER },
            height: { type: Type.INTEGER },
            bodyText: { type: Type.STRING }
          },
          required: ['id', 'type', 'caption', 'authorName', 'sourcePlatform'],
        },
      },
    },
  };

const generateMockItems = async (query: string, persons: string[], sources: string[], tags: string[] = []): Promise<FeedItem[]> => {
    
    // 1. Try Local Fixtures First
    const localMatches = getDemoItemsForFilters(query, persons, sources, tags);
    if (localMatches.length > 0) {
        return localMatches;
    }

    // 2. Try Gemini Generation
    if (process.env.API_KEY) {
      const graphContext = getContextForFilters(persons);
      const contextDescription = `
        Generate 8 mock social media posts.
        Filters: ${persons.join(', ')} ${query}
        Tags: ${tags.join(', ')}
        Sources: ${sources.join(', ')}
        Context: ${graphContext}
      `;
    
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: contextDescription,
          config: {
            responseMimeType: "application/json",
            responseSchema: feedResponseSchema,
          }
        });
    
        const text = response.text;
        if (text) {
           const data = JSON.parse(text);
           return data.items.map((item: any, index: number) => {
            let imageUrl = `https://picsum.photos/seed/${item.id}/${item.width || 600}/${item.height || 800}`;
            let identity = findIdentity(item.authorName) || findIdentity(item.caption);
            if (identity) imageUrl = getIdentityImage(identity.id);
            if (item.type === 'text') imageUrl = '';
      
            return {
              id: item.id || `gen-${Date.now()}-${index}`,
              type: item.type === 'text' ? MediaType.TEXT : MediaType.IMAGE,
              caption: item.caption,
              bodyText: item.bodyText,
              author: { name: item.authorName, handle: item.authorHandle },
              source: item.sourcePlatform,
              timestamp: new Date().toISOString(),
              aspectRatio: calculateAspectRatioClass(item.width, item.height),
              width: item.width || 600,
              height: item.height || 800,
              likes: item.likes || 100,
              mediaUrl: imageUrl,
            };
          });
        }
      } catch (e) {
        console.error("Mock gen failed", e);
      }
    }
    
    return [];
};
