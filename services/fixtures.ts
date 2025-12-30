
import { IdentityProfile, SavedBoard, FeedItem, MediaType, Draft, AcquisitionTask, LibraryItem } from '../types';

// --- 1. Identity Graph ---

export const DEMO_IDENTITIES: Record<string, IdentityProfile> = {
  'runandplay2': {
    id: 'runandplay2',
    name: 'runandplay2',
    bio: 'Wife, mom, and WFH style enthusiast. Gym is my haven. 🍋 Top 1% Poster.',
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
    aliases: ['runandplay2', 'runandplay', '@runandplay2'],
    sources: [
      { platform: 'reddit', id: 'lululemon', label: 'Main Feed', hidden: false },
      { platform: 'reddit', id: 'LululemonBST', label: 'Marketplace', hidden: false }
    ],
    contextKeywords: ['lululemon', 'Fit Pics', 'Align', 'Scuba', 'Cotton Mock Neck Shrug', 'Herringbone', 'Sequoia'],
    imagePool: [],
    relationships: []
  },
  'laufey': {
    id: 'laufey',
    name: 'Laufey',
    bio: 'Bringing Jazz to the next generation. Bewitched.',
    avatarUrl: "https://images.unsplash.com/photo-1520110120835-c96a9efaf09d?auto=format&fit=crop&w=400&q=80",
    aliases: ['laufey', 'laufey lin', 'lauvers', '@laufey'],
    sources: [
      { platform: 'reddit', id: 'laufey', label: 'Main', hidden: false },
      { platform: 'instagram', id: 'laufey', label: 'Official', hidden: false }
    ],
    contextKeywords: ['Jazz', 'Cello', 'Christmas', 'Vintage', 'Holiday', 'Lauvers'],
    imagePool: [],
    relationships: [{ targetId: 'taylor-swift', type: 'Fan' }]
  },
  'marin-kitagawa': {
    id: 'marin-kitagawa',
    name: 'Marin Kitagawa',
    bio: 'Cosplay enthusiast. My Dress-Up Darling.',
    avatarUrl: "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&w=400&q=80",
    aliases: ['marin', 'kitagawa', 'marin kitagawa', 'rizu kyun', 'rizu-kyun'],
    sources: [
      { platform: 'reddit', id: 'SonoBisqueDoll', label: 'Main Community', hidden: false }
    ],
    contextKeywords: ['Cosplay', 'Anime', 'Dress-up', 'Marin', 'Rizu Kyun'],
    imagePool: [],
    relationships: []
  },
  'taylor-swift': {
    id: 'taylor-swift',
    name: 'Taylor Swift',
    bio: 'The music industry.',
    avatarUrl: "https://images.unsplash.com/photo-1514525253440-b393452e3383?auto=format&fit=crop&w=400&q=80",
    aliases: ['taylor swift', 'taylor', 'tswift', 'blondie', 'taylor_swift', '@taylorswift'],
    sources: [
      { platform: 'reddit', id: 'TaylorSwift', label: 'Main', hidden: false }
    ],
    contextKeywords: ['Eras Tour', 'Acoustic', 'Red Lip', 'Workout', 'Fitness', '1989', 'TTPD'],
    imagePool: [],
    relationships: [{ targetId: 'selena-gomez', type: 'Best Friend' }]
  }
};

// --- 2. Default Boards ---

export const DEMO_BOARDS: SavedBoard[] = [
  {
    id: 'demo-board-lulu',
    name: 'Lulu Obsession 🍋',
    filters: {
      persons: ['runandplay2'],
      sources: ['r/lululemon'],
      tags: ['#lululemon'],
      searchQuery: '',
      sortBy: 'latest'
    },
    createdAt: 1715000015000
  },
  {
    id: 'demo-board-cosplay',
    name: 'Cosplay Archive 🧵',
    filters: {
      persons: ['Marin Kitagawa'],
      sources: ['r/SonoBisqueDoll'],
      tags: [],
      searchQuery: '',
      sortBy: 'latest'
    },
    createdAt: 1715000000000
  }
];

// --- 3. Mock Feed Items ---

export const DEMO_FEED_ITEMS: FeedItem[] = [
  // LULULEMON FIT PIC (The Pink Shrug)
  {
    id: 'lulu-shrug-1',
    type: MediaType.IMAGE,
    caption: 'Cotton Mock Neck Shrug (Blissful Pink) fit pic! 🌸✨ Something I never thought I’d buy.',
    author: { name: 'runandplay2', handle: 'u/runandplay2' },
    source: 'r/lululemon',
    timestamp: new Date().toISOString(),
    // Aesthetics: Pink knit over brown check pattern
    mediaUrl: 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=800&q=80',
    likes: 103,
    tags: ['lululemon', 'Fit Pics', 'Blissful Pink', 'Shrug', 'Align'],
    aspectRatio: 'aspect-[3/4]',
    width: 800,
    height: 1066
  },
  // LULULEMON DISCUSSION AMA
  {
    id: 'lulu-discussion-1',
    type: MediaType.TEXT,
    caption: 'What is something you bought in 2025 bc of this sub?',
    bodyText: 'The cotton mock neck shrug is definitely a sub influence. Also the Herringbone coal define and all the Aurora purple haze! What are your dangerous 2025 purchases?',
    author: { name: 'runandplay2', handle: 'u/runandplay2' },
    source: 'r/lululemon',
    permalink: '/r/lululemon/comments/1pzku9c/what_is_something_you_bought_in_2025_bc_of_this/',
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    likes: 450,
    tags: ['lululemon', 'Discussion', '2025', 'Community'],
    aspectRatio: 'aspect-square',
    width: 800,
    height: 800
  },
  {
    id: 'laufey-christmas-1',
    type: MediaType.IMAGE,
    caption: 'Merry Christmas Lauvers! 🎄✨ Happy holidays to everyone. Stay cozy with some jazz.',
    author: { name: 'Laufey', handle: '@laufey' },
    source: 'r/laufey',
    timestamp: new Date().toISOString(),
    mediaUrl: 'https://images.unsplash.com/photo-1543589077-47d816067f70?auto=format&fit=crop&w=800&q=80',
    likes: 89000,
    tags: ['Laufey', 'Christmas', 'Holiday', 'Lauvers'],
    aspectRatio: 'aspect-[3/4]',
    width: 800,
    height: 1066
  }
];

// --- 4. Knowledge OS Mock Data ---

export const DEMO_DRAFTS: Draft[] = [
    {
        id: 'draft-lulu-wishlist',
        title: 'Lululemon 2025 Wishlist',
        content: '# Lululemon Curation\n\n- [ ] Herringbone coal cropped define\n- [ ] Wundermost Nulu wrap front LS (Ivory)\n- [ ] Aurora purple haze Aligns\n\nInfluenced by runandplay2 posts.',
        lastModified: Date.now(),
        status: 'drafting',
        type: 'resource',
        tags: ['lululemon', 'wishlist']
    }
];

export const DEMO_TASKS: AcquisitionTask[] = [
    {
        id: 'task-lulu-1',
        resourceName: 'Herringbone Coal Cropped Define Jacket',
        author: 'Lululemon',
        type: 'tool',
        status: 'searching',
        priority: 'high',
        estPrice: 118
    }
];

export const DEMO_LIBRARY: LibraryItem[] = [
    {
        id: 'lib-lulu-1',
        title: 'Nulu Fabric Care Guide',
        author: 'Technical Team',
        type: 'article',
        status: 'reading',
        addedAt: Date.now(),
        tags: ['lululemon', 'care'],
        highlights: [{ id: 'h1', text: 'Never use fabric softener on Nulu.', timestamp: Date.now() }]
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
    const sourceMatch = sources.length === 0 || sources.some(s => {
      return item.source.toLowerCase().includes(s.toLowerCase().replace('r/', ''));
    });
    
    const personMatch = persons.length === 0 || persons.some(p => {
      const pLow = p.toLowerCase();
      return item.author.name.toLowerCase().includes(pLow) || 
             item.caption.toLowerCase().includes(pLow) ||
             item.tags?.some(t => t.toLowerCase().includes(pLow));
    });

    const tagMatch = tags.length === 0 || tags.some(t => {
        const tagClean = t.toLowerCase().replace('#', '');
        return item.tags?.some(it => it.toLowerCase().includes(tagClean)) ||
               item.caption.toLowerCase().includes(tagClean);
    });

    const searchMatch = queryLower === '' || 
                        item.caption.toLowerCase().includes(queryLower) ||
                        item.source.toLowerCase().includes(queryLower) ||
                        (item.tags && item.tags.some(t => t.toLowerCase().includes(queryLower)));

    return sourceMatch && personMatch && searchMatch && tagMatch;
  });
};
