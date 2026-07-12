
export const work = [
  { name: 'drop',   tag: 'encrypted, no-account file transfer for any device', meta: '2025 · Workers · D1 · R2',        href: 'https://drop.zachy.cc',
    desc: [
      'a dead-simple file transfer tool with zero accounts, zero tracking, and end-to-end encryption. upload a file, get a link, share it — that\'s it.',
      'built on Cloudflare Workers with D1 for metadata and R2 for storage. files self-destruct after download or expiry.',
    ],
    tech: [
      { n: 'Workers', logo: 'cloudflareworkers', c: 'F38020' },
      { n: 'D1', logo: 'cloudflare', c: 'F38020' },
      { n: 'R2', logo: 'cloudflare', c: 'F38020' },
      { n: 'Wrangler', logo: 'cloudflare', c: 'F38020' },
    ],
    links: [
      { label: 'visit', href: 'https://drop.zachy.cc' },
    ],
  },
  { name: 'b3am',   tag: 'end-to-end encrypted messenger PWA',                 meta: '2025 · Durable Objects · AES-GCM', href: '',
    desc: [
      'a real-time encrypted messenger PWA. no phone number, no account, no server storing your messages. just open the link and chat.',
      'powered by Cloudflare Durable Objects for WebSocket coordination and AES-GCM for end-to-end encryption. keys never leave the client.',
    ],
    tech: [
      { n: 'Durable Objects', logo: 'cloudflare', c: 'F38020' },
      { n: 'Workers', logo: 'cloudflareworkers', c: 'F38020' },
      { n: 'WebSockets', logo: 'javascript', c: 'F7DF1E' },
    ],
    links: [],
  },
  { name: 'Pulse',  tag: 'a health app that respects you',                     meta: '2026 · Android · Kotlin',          href: 'https://github.com/zoop-dev/pulse',
    desc: [
      'a health tracking app that respects your privacy. your data stays on your device — no cloud sync, no ads, no selling your habits.',
      'built natively for Android with Kotlin, Room, and Material 3.',
    ],
    tech: [
      { n: 'Kotlin', logo: 'kotlin', c: '7F52FF' },
      { n: 'Android', logo: 'android', c: '3DDC84' },
    ],
    links: [
      { label: 'github', href: 'https://github.com/zoop-dev/pulse' },
    ],
  },
  { name: 'Foyer',  tag: 'config-driven framework running a family of sites',  meta: '2026 · Node · Cloudflare',         href: '',
    desc: [
      'a config-driven framework that runs a family of sites from a single codebase. each site gets its own content, theme, and domain — all from one deploy.',
      'powers this very site, plus a few others. built on Node with Cloudflare Pages for hosting.',
    ],
    tech: [
      { n: 'Node', logo: 'nodedotjs', c: '5FA04E' },
      { n: 'Pages', logo: 'cloudflarepages', c: 'F38020' },
      { n: 'KV', logo: 'cloudflare', c: 'F38020' },
    ],
    links: [],
  },
  { name: 'Taskly', tag: 'tasks, done nicely',                                 meta: '2025 · Vite · Pages',              href: '',
    desc: [
      'a minimal task manager that gets out of your way. no labels, no projects, no overkill — just tasks, done nicely.',
      'built with Vite, vanilla JS, and deployed on Cloudflare Pages. offline-first with localStorage.',
    ],
    tech: [
      { n: 'Vite', logo: 'vite', c: '646CFF' },
      { n: 'Pages', logo: 'cloudflarepages', c: 'F38020' },
      { n: 'vanilla JS', logo: 'javascript', c: 'F7DF1E' },
    ],
    links: [],
  },
];

export const socials = [
  { icon: 'signal', label: 'Signal', href: 'https://signal.me/#eu/eL1c4KuBK_cDlAsJaPxEpg1tXwr1RQUW8BNGstxGpVKsyEYUssFJX4q7L1VVuPD7' },
  { icon: 'spotify', label: 'Spotify', href: 'https://open.spotify.com/user/31sozlvjlwf3do464hnstucbhx4e?si=MaPj403oS2yXaFBXN9KUdA' },
  { icon: 'github', label: 'GitHub', href: 'https://github.com/zoop-dev' },
  { icon: 'mail', label: 'hi@zachy.cc', href: 'mailto:hi@zachy.cc' },
];

export const source = 'https://github.com/zoop-dev/website-v2';

export const news = [
  { date: '2026-07-11', tag: 'release', title: 'b3am v2 is here',
    body: [
      'the encrypted messenger got a ground-up rewrite. faster, tougher crypto, and a UI that finally feels right.',
      'still no accounts, no phone number, no server holding your messages — just open the link and talk.',
    ],
    links: [
      { label: 'try it', href: 'https://b3am.zo0p.dev' },
    ],
  },
];

export const stack = [
  { group: 'Languages', items: [
    { n: 'JavaScript', logo: 'javascript', c: 'F7DF1E' },
    { n: 'TypeScript', logo: 'typescript', c: '3178C6' },
    { n: 'Rust',       logo: 'rust',       c: 'FFFFFF' },
    { n: 'Kotlin',     logo: 'kotlin',     c: '7F52FF' },
    { n: 'Python',     logo: 'python',     c: 'FFD43B' },
    { n: 'GLSL',       logo: 'opengl',     c: '5586A4' },
    { n: 'SQL',        logo: 'sqlite',     c: '4479A1' },
  ] },
  { group: 'Frontend', items: [
    { n: 'Three.js',       logo: 'threedotjs', c: 'FFFFFF' },
    { n: 'WebGL',          logo: 'webgl',      c: 'FFFFFF' },
    { n: 'GSAP',           logo: 'greensock',  c: '88CE02' },
    { n: 'Vite',           logo: 'vite',       c: '646CFF' },
    { n: 'vanilla JS',     logo: 'javascript', c: 'F7DF1E' },
    { n: 'Web Components', logo: 'webcomponentsdotorg', c: '29ABE2' },
  ] },
  { group: 'Cloudflare', items: [
    { n: 'Workers',         logo: 'cloudflareworkers', c: 'F38020' },
    { n: 'Pages',           logo: 'cloudflarepages',   c: 'F38020' },
    { n: 'D1',              logo: 'cloudflare',        c: 'F38020' },
    { n: 'R2',              logo: 'cloudflare',        c: 'F38020' },
    { n: 'KV',              logo: 'cloudflare',        c: 'F38020' },
    { n: 'Durable Objects', logo: 'cloudflare',        c: 'F38020' },
    { n: 'Wrangler',        logo: 'cloudflare',        c: 'F38020' },
  ] },
  { group: 'Tools', items: [
    { n: 'VSCodium',     logo: 'vscodium' },
    { n: 'Git',          logo: 'git',              c: 'F05032' },
    { n: 'Figma',        logo: 'figma',            c: 'F24E1E' },
    { n: 'Blender',      logo: 'blender',          c: 'F5792A' },
    { n: 'the terminal', logo: 'gnubash',          c: '4EAA25' },
  ] },
];

export const about = [
  "hi — i'm zoop. i build weird, fast, interactive things for the web: real-time WebGL, shaders, tools, and apps that (mostly) don't suck.",
  "i like edges: making the browser do stuff it wasn't supposed to, shipping small, and sweating the details until it feels <em>right</em>.",
  "currently: building on Cloudflare, breaking things, fixing them, repeat.",
];
