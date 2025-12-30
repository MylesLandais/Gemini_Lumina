
import { IdentityProfile, SavedBoard, FeedItem, MediaType } from './types';

// --- 1. Test Entities (The "Golden" Dataset) ---

export const DEMO_IDENTITIES: Record<string, IdentityProfile> = {
  'taylor-swift': {
    id: 'taylor-swift',
    name: 'Taylor Swift',
    bio: 'The music industry.',
    avatarUrl: "https://images.unsplash.com/photo-1514525253440-b393452e3383?auto=format&fit=crop&w=400&q=80",
    aliases: ['taylor swift', 'taylor', 'tswift', 'blondie'],
    sources: [
      { platform: 'reddit', id: 'TaylorSwift', label: 'Main', hidden: false },
      { platform: 'instagram', id: 'taylorswift', label: 'Official', hidden: false },
      { platform: 'twitter', id: 'taylorswift13', label: 'News', hidden: false }
    ],
    contextKeywords: ['Eras Tour', 'Acoustic', 'Red Lip', '1989'],
    imagePool: [
       "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80",
       "https://images.unsplash.com/photo-1604537466158-719b1972feb8?auto=format&fit=crop&w=800&q=80"
    ],
    relationships: [{ targetId: 'selena-gomez', type: 'Best Friend' }]
  },
  'selena-gomez': {
    id: 'selena-gomez',
    name: 'Selena Gomez',
    bio: 'Mogul. Rare Beauty.',
    avatarUrl: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=400&q=80",
    aliases: ['selena', 'selena gomez'],
    sources: [
      { platform: 'instagram', id: 'selenagomez', label: 'Official', hidden: false },
      { platform: 'tiktok', id: 'selenagomez', label: 'Personal', hidden: false }
    ],
    contextKeywords: ['Rare Beauty', 'Cooking', 'OOTD'],
    imagePool: [
      "https://images.unsplash.com/photo-1512310604669-443f26c35f52?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80"
    ],
    relationships: [{ targetId: 'taylor-swift', type: 'Best Friend' }]
  },
  'wendell': {
    id: 'wendell',
    name: 'Wendell',
    bio: 'Level1Techs. Enterprise gear, Linux, and weird hardware.',
    avatarUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80",
    aliases: ['wendell', 'tekwendell', 'level1'],
    sources: [
      { platform: 'forum', id: 'level1techs.com/u/wendell', label: 'L1 Forum', hidden: false },
      { platform: 'youtube', id: 'Level1Techs', label: 'Main Channel', hidden: false }
    ],
    contextKeywords: ['EPYC', 'ZFS', 'Linux', 'Workstation', 'Threadripper'],
    imagePool: [
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80", // Server rack
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"  // Chip
    ],
    relationships: []
  }
};

// --- 2. Test Boards (Use Case Scenarios) ---

export const DEMO_BOARDS: SavedBoard[] = [
  {
    id: 'demo-board-linux',
    name: 'Linux Rice 🐧',
    filters: {
      persons: [],
      sources: ['r/unixporn', 'r/hyprland', 'r/kde', 'r/gnome', 'r/UsabilityPorn', 'r/battlestations'],
      tags: [],
      searchQuery: '',
      sortBy: 'random'
    },
    createdAt: 1715000000000
  },
  {
    id: 'demo-board-pop',
    name: 'Queens of Pop ✨',
    filters: {
      persons: ['Taylor Swift', 'Selena Gomez'],
      sources: [],
      tags: [],
      searchQuery: '',
      sortBy: 'random'
    },
    createdAt: 1715000005000
  },
  {
    id: 'demo-board-archives',
    name: 'Visual Archives 📦',
    filters: {
      persons: [],
      sources: ['Kemono', 'Coomer', 'SimpCity', 'Pixiv'],
      tags: [],
      searchQuery: '',
      sortBy: 'random'
    },
    createdAt: 1715000008000
  },
  {
    id: 'demo-board-homelab',
    name: 'Homelab & Tech 🖥️',
    filters: {
      persons: ['Wendell'],
      sources: ['Level1Techs', 'r/homelab'],
      tags: [],
      searchQuery: '',
      sortBy: 'random'
    },
    createdAt: 1715000010000
  }
];

// --- 3. Mock Feed Items (Offline/Demo Content) ---

export const DEMO_FEED_ITEMS: FeedItem[] = [
  // Scenario: Linux Rice / Unixporn
  {
    id: 'mock-linux-1',
    type: MediaType.IMAGE,
    caption: '[Hyprland] My first rice! Catppuccin theme + Waybar',
    author: { name: 'linux_wizard', handle: 'u/linux_wizard' },
    source: 'r/unixporn',
    timestamp: new Date().toISOString(),
    aspectRatio: 'aspect-video',
    width: 1920,
    height: 1080,
    likes: 4520,
    mediaUrl: 'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=1200&q=80', // Matrix/Code aesthetic
    tags: ['os:linux', 'de:hyprland', 'theme:catppuccin', 'res:1920x1080']
  },
  {
    id: 'mock-linux-2',
    type: MediaType.IMAGE,
    caption: 'KDE Plasma 6 is looking buttery smooth on Arch',
    author: { name: 'arch_user_btw', handle: 'u/arch_user_btw' },
    source: 'r/kde',
    timestamp: new Date().toISOString(),
    aspectRatio: 'aspect-video',
    width: 1920,
    height: 1080,
    likes: 1200,
    mediaUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=1200&q=80', // Clean dark desktop setup
    tags: ['os:arch', 'de:kde', 'res:1920x1080']
  },
  
  // Scenario: Taylor Swift
  {
    id: 'mock-ts-1',
    type: MediaType.IMAGE,
    caption: 'Surprise song from last night in Tokyo! 🎸',
    author: { name: 'TaylorSwift', handle: 'u/TaylorSwift' },
    source: 'r/TaylorSwift',
    timestamp: new Date().toISOString(),
    aspectRatio: 'aspect-[3/4]',
    width: 800,
    height: 1200,
    likes: 15000,
    mediaUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=800&q=80' // Concert vibe
  },
  {
    id: 'mock-ts-2',
    type: MediaType.SHORT,
    caption: 'Backstage clips #ErasTour',
    author: { name: 'taylorswift', handle: '@taylorswift' },
    source: 'Instagram',
    timestamp: new Date().toISOString(),
    aspectRatio: 'aspect-[3/4]',
    width: 1080,
    height: 1920,
    likes: 250000,
    mediaUrl: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?auto=format&fit=crop&w=800&q=80' // Sparkly outfit
  },

  // Scenario: Selena Gomez
  {
    id: 'mock-sg-1',
    type: MediaType.IMAGE,
    caption: 'New Rare Beauty blush launch event 🌸',
    author: { name: 'selenagomez', handle: '@selenagomez' },
    source: 'Instagram',
    timestamp: new Date().toISOString(),
    aspectRatio: 'aspect-square',
    width: 1080,
    height: 1080,
    likes: 980000,
    mediaUrl: 'https://images.unsplash.com/photo-1512310604669-443f26c35f52?auto=format&fit=crop&w=800&q=80' // Makeup/Fashion
  },

  // Scenario: Archives & Art (Kemono, Coomer, SimpCity, Pixiv)
  {
    id: 'mock-art-1',
    type: MediaType.IMAGE,
    caption: 'Rem (Re:Zero) - Morning Light Study',
    author: { name: 'ArtGod', handle: 'pixiv/987654' },
    source: 'Pixiv',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    aspectRatio: 'aspect-[3/4]',
    width: 1200,
    height: 1600,
    likes: 4500,
    mediaUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    tags: ['char:rem', 'series:re_zero', 'width:1200', 'height:1600', 'style:painting']
  },
  {
    id: 'mock-arch-1',
    type: MediaType.IMAGE,
    caption: '2024-05-15 Set Backup [High Res]',
    author: { name: 'CosplayQueen', handle: 'fanbox/user123' },
    source: 'Kemono',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    aspectRatio: 'aspect-[3/4]',
    width: 2000,
    height: 3000,
    likes: 890,
    mediaUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
    tags: ['importer:auto', 'width:2000', 'src:fanbox']
  },
  {
    id: 'mock-thread-1',
    type: MediaType.IMAGE,
    caption: 'New set leaked in main thread (Page 45)',
    author: { name: 'LeakFinder', handle: 'simpcity/user_88' },
    source: 'SimpCity',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    aspectRatio: 'aspect-square',
    width: 1080,
    height: 1080,
    likes: 230,
    mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    tags: ['thread:watched', 'status:new', 'model:unknown']
  },

  // Scenario: Tech Forums (Level1Techs / Discourse)
  {
    id: 'mock-l1-1',
    type: MediaType.IMAGE,
    caption: 'The 4x AMD Radeon AI PRO W7900 128GB Giveaway!',
    author: { name: 'wendell', handle: 'level1techs.com/u/wendell' },
    source: 'Level1Techs',
    timestamp: new Date().toISOString(), // Bumped to top
    aspectRatio: 'aspect-video',
    width: 1920,
    height: 1080,
    likes: 1250,
    mediaUrl: 'https://images.unsplash.com/photo-1555618568-6361a9b2f9ef?auto=format&fit=crop&w=1200&q=80', // GPU/Tech look
    tags: ['forum:level1', 'hardware:amd', 'thread:active', 'bumped:true']
  },
  {
    id: 'mock-l1-2',
    type: MediaType.IMAGE,
    caption: 'Thread: EPYC 9004 Motherboard options & VRM analysis',
    author: { name: 'wendell', handle: 'level1techs.com/u/wendell' },
    source: 'Level1Techs',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    aspectRatio: 'aspect-video',
    width: 1920,
    height: 1080,
    likes: 340,
    mediaUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80', // Server Motherboard
    tags: ['forum:level1', 'hardware:epyc', 'category:server']
  }
];

export const getDemoItemsForFilters = (
  searchQuery: string,
  persons: string[],
  sources: string[],
  tags: string[] = []
): FeedItem[] => {
  const queryLower = searchQuery.toLowerCase();
  
  return DEMO_FEED_ITEMS.filter(item => {
    // 1. Check Source match
    const sourceMatch = sources.length === 0 || sources.some(s => {
      // Very loose matching for demo purposes, handling platform names
      return item.source.toLowerCase().includes(s.toLowerCase().replace('r/', ''));
    });
    
    // 2. Check Person match (via author or caption)
    const personMatch = persons.length === 0 || persons.some(p => {
      return item.author.name.toLowerCase().includes(p.toLowerCase().replace(' ', '')) || 
             item.caption.toLowerCase().includes(p.toLowerCase());
    });

    // 3. Check Tag match
    const tagMatch = tags.length === 0 || tags.some(t => {
        // Match against item tags or caption/body
        const tagClean = t.toLowerCase().replace('#', '');
        return item.tags?.some(it => it.toLowerCase().includes(tagClean)) ||
               item.caption.toLowerCase().includes(tagClean);
    });

    // 4. Check Search query (Including Tags)
    const searchMatch = queryLower === '' || 
                        item.caption.toLowerCase().includes(queryLower) ||
                        item.source.toLowerCase().includes(queryLower) ||
                        (item.tags && item.tags.some(t => t.toLowerCase().includes(queryLower)));

    return sourceMatch && personMatch && searchMatch && tagMatch;
  });
};
    