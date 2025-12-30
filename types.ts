
export enum MediaType {
  IMAGE = 'image',
  SHORT = 'short',
  GIF = 'gif',
  TEXT = 'text' // New type for AMAs/Discussions
}

export interface Author {
  name: string;
  handle: string;
  avatarUrl?: string; // Placeholder ID
}

export interface Comment {
  id: string;
  author: string;
  body: string;
  score: number;
  replies?: Comment[];
  timestamp: string;
}

export interface RelatedThread {
  id: string;
  title: string;
  subreddit: string;
  url: string;
  type: 'crosspost' | 'mention';
}

export interface FeedItem {
  id: string;
  type: MediaType;
  caption: string; // Title
  bodyText?: string; // The actual AMA content / selftext
  author: Author;
  source: string; // e.g., "Instagram", "Reddit", "RSS"
  timestamp: string;
  aspectRatio: string; // Tailwind class e.g., "aspect-[3/4]"
  width: number; // For picsum
  height: number; // For picsum
  likes: number;
  mediaUrl?: string; // Optional override for the actual media content
  thumbnailUrl?: string; // Optional static preview for videos/shorts
  tags?: string[]; // Booru-style tags e.g. "char:rem", "width:1080"
  
  // New Rich Data Fields
  comments?: Comment[]; // Top level comments
  relatedThreads?: RelatedThread[]; // Cross-reference other subs
  permalink?: string; // Link to original reddit thread for fetching context
  galleryUrls?: string[]; // For multi-image posts (e.g. comparisons)

  // Marketplace / Commerce Fields
  price?: number;
  currency?: string; // '$', '£', '€', '¥'
  condition?: 'New' | 'Like New' | 'Used' | 'Fair' | 'Pre-order';
  isSold?: boolean;
}

export type SortOption = 'latest' | 'top' | 'random';

export interface FilterState {
  persons: string[];
  sources: string[];
  tags: string[]; // Topics/Hashtags to filter by
  searchQuery: string;
  sortBy: SortOption;
}

export interface SavedBoard {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: number;
}

export interface Relationship {
  targetId: string;
  type: string; // e.g. "Best Friend", "Dating", "Co-star"
}

export type PlatformType = 'reddit' | 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'web' | 'kemono' | 'coomer' | 'simpcity' | 'pixiv' | 'forum' | '4chan' | 'imageboard' | 'depop' | 'vinted' | 'grailed' | 'ebay' | 'myfigurecollection';

export interface SourceLink {
  platform: PlatformType;
  id: string; // handle, subreddit name, or url
  label?: string; // e.g. "Main", "Spam", "Fan Page"
  hidden?: boolean; // Toggles visibility in feed
}

export interface IdentityProfile {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
  aliases: string[];
  // Replaced fixed socials with dynamic sources array
  sources: SourceLink[];
  contextKeywords: string[]; // Helps AI generate relevant captions
  imagePool: string[]; // Mock images that vibe with this person
  relationships: Relationship[];
}

// --- Knowledge OS Types ---

export type DraftStatus = 'idea' | 'processing' | 'drafting' | 'published';
export type DraftType = 'wisdom' | 'resource' | 'hybrid';

export interface Draft {
  id: string;
  title: string;
  content: string; // Markdown
  lastModified: number;
  status: DraftStatus;
  type: DraftType;
  sourceUrl?: string; // e.g. YouTube link
  tags: string[];
}

export type AcquisitionStatus = 'wishlist' | 'searching' | 'ordered' | 'acquired';
export type AcquisitionPriority = 'high' | 'medium' | 'low';

export interface AcquisitionTask {
  id: string;
  resourceName: string;
  author?: string;
  type: 'book' | 'tool' | 'course';
  status: AcquisitionStatus;
  priority: AcquisitionPriority;
  draftId?: string; // Link back to the Draft where this was found
  estPrice?: number;
  foundLink?: string; // Where you eventually bought it
}

// --- Library / Reader Types ---

export interface Highlight {
    id: string;
    text: string;
    note?: string;
    timestamp: number;
    color?: 'yellow' | 'green' | 'blue' | 'red';
}

export interface LibraryItem {
    id: string;
    title: string;
    author: string;
    type: 'book' | 'article' | 'video' | 'paper';
    status: 'inbox' | 'reading' | 'completed' | 'archived';
    coverUrl?: string; // URL for book cover or video thumb
    sourceUrl?: string; // Canonical link
    summary?: string;
    content?: string; // Full text or transcript for AI context
    highlights: Highlight[];
    addedAt: number;
    tags: string[];
    relatedDraftId?: string;
}

export const INITIAL_FILTERS: FilterState = {
  persons: [],
  sources: [],
  tags: [],
  searchQuery: '',
  sortBy: 'random'
};

export type Theme = 'default' | 'kanagawa';

export type AppView = 'feed' | 'admin' | 'drafts' | 'sourcing' | 'library' | 'reader';
