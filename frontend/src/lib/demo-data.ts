/**
 * Demo data for the LoL Stonks RSS frontend.
 * Provides fallback articles when the API is unavailable.
 */

import type { Article } from '../types/article';

/**
 * Demo articles with realistic Riot Games content.
 * Includes various locales, categories, and sources.
 */
export const demoArticles: Article[] = [
  // Patch Notes
  {
    guid: 'demo-1',
    title: 'Patch 14.5 Notes: Champion Balances & System Updates',
    url: 'https://www.leagueoflegends.com/en-us/news/game-updates/patch-14-5-notes/',
    pub_date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    description: 'The latest balance changes arrive with Patch 14.5, featuring adjustments to 15 champions, item updates, and Ranked queue improvements.',
    content: null,
    author: 'Riot Games',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt1234567890abcdef/patch-14-5.jpg',
    categories: ['patch-notes', 'game-updates'],
    locale: 'en-us',
    source: 'riot',
    source_category: 'patch-notes',
  },
  {
    guid: 'demo-2',
    title: 'Notas del Parche 14.5: Ajustes de Campeones y Actualizaciones',
    url: 'https://www.leagueoflegends.com/es-mx/news/game-updates/notas-del-parche-14-5/',
    pub_date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    description: 'Los últimos cambios de equilibrio llegan con el Parche 14.5, con ajustes a 15 campeones, actualizaciones de objetos y mejoras en las colas clasificatorias.',
    content: null,
    author: 'Riot Games',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt1234567890abcdef/patch-14-5.jpg',
    categories: ['patch-notes', 'game-updates'],
    locale: 'es-mx',
    source: 'riot',
    source_category: 'patch-notes',
  },
  {
    guid: 'demo-3',
    title: 'Patch 14.4 メモ：チャンピオン調整とシステム更新',
    url: 'https://www.leagueoflegends.com/ja-jp/news/game-updates/patch-14-4-notes/',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    description: 'パッチ14.4で15人のチャンピオンの調整、アイテムの更新、ランクキューの改善が実施されました。',
    content: null,
    author: 'Riot Games',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt1234567890abcdef/patch-14-4.jpg',
    categories: ['patch-notes'],
    locale: 'ja-jp',
    source: 'riot',
    source_category: 'patch-notes',
  },
  {
    guid: 'demo-4',
    title: '14.4版本更新公告：英雄平衡与系统优化',
    url: 'https://www.leagueoflegends.com/zh-cn/news/game-updates/patch-14-4-notes/',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    description: '14.4版本带来了15位英雄的平衡性调整，装备更新以及排位队列改进。',
    content: null,
    author: 'Riot Games',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt1234567890abcdef/patch-14-4.jpg',
    categories: ['patch-notes'],
    locale: 'zh-cn',
    source: 'riot',
    source_category: 'patch-notes',
  },
  {
    guid: 'demo-5',
    title: 'Notes du patch 14.4 : Équilibrage des champions',
    url: 'https://www.leagueoflegends.com/fr-fr/news/game-updates/notes-du-patch-14-4/',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    description: 'Les derniers changements d\'équilibre arrivent avec le patch 14.4.',
    content: null,
    author: 'Riot Games',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt1234567890abcdef/patch-14-4.jpg',
    categories: ['patch-notes'],
    locale: 'fr-fr',
    source: 'riot',
    source_category: 'patch-notes',
  },

  // Esports
  {
    guid: 'demo-6',
    title: '2024 LCS Spring Playoffs: Team Liquid vs Cloud9 Preview',
    url: 'https://www.lolesports.com/en_us/news/lcs-spring-playoffs-preview',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    description: 'A deep dive into the LCS Spring Finals matchup. Can Team Liquid defend their title against the resurgent Cloud9 roster?',
    content: null,
    author: 'LoL Esports',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt9876543210fedcba/lcs-finals.jpg',
    categories: ['esports', 'lcs', 'playoffs'],
    locale: 'en-us',
    source: 'lolesports',
    source_category: 'esports',
  },
  {
    guid: 'demo-7',
    title: 'LCK Spring 2024: Gen.G Dominance Continues',
    url: 'https://www.lolesports.com/ko_kr/news/lck-spring-2024-gen-g',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    description: 'Gen.G extends their winning streak to 12 games. Chovy and Canyon in historic form this split.',
    content: null,
    author: 'LoL Esports',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt9876543210fedcba/lck-gen-g.jpg',
    categories: ['esports', 'lck'],
    locale: 'ko-kr',
    source: 'lolesports',
    source_category: 'esports',
  },
  {
    guid: 'demo-8',
    title: 'LEC Winter Finals: G2 Esports Crowned Champions',
    url: 'https://www.lolesports.com/en_gb/news/lec-winter-finals-g2',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    description: 'Caps leads G2 to their 10th LEC title in a thrilling 3-2 series against MAD Lions.',
    content: null,
    author: 'LoL Esports',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt9876543210fedcba/lec-g2.jpg',
    categories: ['esports', 'lec'],
    locale: 'en-gb',
    source: 'lolesports',
    source_category: 'esports',
  },
  {
    guid: 'demo-9',
    title: '世界賽2024：賽制變更揭曉',
    url: 'https://www.lolesports.com/zh_tw/news/worlds-2024-format',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    description: '2024世界大賽將採用全新賽制，增加更多隊伍參與。',
    content: null,
    author: 'LoL Esports',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt9876543210fedcba/worlds-2024.jpg',
    categories: ['esports', 'worlds'],
    locale: 'zh-tw',
    source: 'lolesports',
    source_category: 'esports',
  },
  {
    guid: 'demo-10',
    title: 'CBLOL Split 1: paiN Gaming Advances to Finals',
    url: 'https://www.lolesports.com/pt_br/news/cblol-split-1-pain',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    description: 'paiN Gaming dominates INTZ in the semifinals. Robo and route historic performances continue.',
    content: null,
    author: 'LoL Esports',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt9876543210fedcba/cblol-pain.jpg',
    categories: ['esports', 'cblol'],
    locale: 'pt-br',
    source: 'lolesports',
    source_category: 'esports',
  },

  // Dev Blogs
  {
    guid: 'demo-11',
    title: 'Dev Blog: Champion Roster Update for 2024',
    url: 'https://www.leagueoflegends.com/en-us/news/development/dev-blog-champion-roster-2024',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    description: 'Our designers share insights into the upcoming VGU for Shaco and the ASU reworks planned for this year.',
    content: null,
    author: 'Reav3',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt1111111111111111/dev-blog.jpg',
    categories: ['dev-blog', 'champion-updates'],
    locale: 'en-us',
    source: 'riot',
    source_category: 'dev',
  },
  {
    guid: 'demo-12',
    title: 'Ranked Queue Changes: Implementation Details',
    url: 'https://www.leagueoflegends.com/en-us/news/development/ranked-changes-2024',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    description: 'Detailed explanation of the new positional matchmaking system and protection mechanics for Series games.',
    content: null,
    author: 'Riot BrightMoon',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt1111111111111111/ranked.jpg',
    categories: ['dev-blog', 'ranked'],
    locale: 'en-us',
    source: 'riot',
    source_category: 'dev',
  },

  // Community Events
  {
    guid: 'demo-13',
    title: 'Arcane Season 2: First Look Images Released',
    url: 'https://www.leagueoflegends.com/en-us/news/entertainment/arcane-season-2-first-look',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    description: 'Fortiche and Riot Games reveal exclusive stills from the upcoming Arcane Season 2. Jinx and Vi\'s story continues.',
    content: null,
    author: 'Riot Games',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt2222222222222222/arcane-s2.jpg',
    categories: ['entertainment', 'arcane'],
    locale: 'en-us',
    source: 'riot',
    source_category: 'entertainment',
  },
  {
    guid: 'demo-14',
    title: 'Star Guardian Event: New Skins and Game Mode',
    url: 'https://www.leagueoflegends.com/en-us/news/game-updates/star-guardian-2024',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    description: 'The Star Guardians return with new skins for Ahri, Neeko, and Rell, plus the return of Star Guardian Invasion.',
    content: null,
    author: 'Riot Games',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt2222222222222222/star-guardian.jpg',
    categories: ['events', 'skins'],
    locale: 'en-us',
    source: 'riot',
    source_category: 'events',
  },

  // Teamfight Tactics
  {
    guid: 'demo-15',
    title: 'TFT Set 11: Inkborn Fables Revealed',
    url: 'https://www.leagueoflegends.com/en-us/news/game-updates/tft-set-11-reveal',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    description: 'Meet the new champions and traits of Set 11. Inkshadow, Umbral, and Dragon allies join the fight.',
    content: null,
    author: 'Riot Mort',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt3333333333333333/tft-s11.jpg',
    categories: ['tft', 'game-updates'],
    locale: 'en-us',
    source: 'riot',
    source_category: 'tft',
  },
  {
    guid: 'demo-16',
    title: 'TFT Set 11: 墨生傳奇揭曉',
    url: 'https://www.leagueoflegends.com/zh-tw/news/game-updates/tft-set-11-reveal',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    description: '迎接第11賽季的新英雄與特性。墨影、幽影與龍族盟友加入戰場。',
    content: null,
    author: 'Riot Mort',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt3333333333333333/tft-s11.jpg',
    categories: ['tft'],
    locale: 'zh-tw',
    source: 'riot',
    source_category: 'tft',
  },

  // Wild Rift
  {
    guid: 'demo-17',
    title: 'Wild Rift: Yasuo Rework Goes Live',
    url: 'https://www.wildrift.leagueoflegends.com/en-us/news/game-updates/yasuo-rework',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    description: 'The Unforgiven receives a comprehensive visual and gameplay update in Wild Rift. New effects, smoother combos.',
    content: null,
    author: 'Wild Rift Team',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt4444444444444444/wr-yasuo.jpg',
    categories: ['wild-rift', 'game-updates'],
    locale: 'en-us',
    source: 'wildrift',
    source_category: 'game-updates',
  },

  // Esports - LPL
  {
    guid: 'demo-18',
    title: 'LPL春季赛：JDG晋级决赛',
    url: 'https://www.lolesports.com/zh_cn/news/lpl-spring-jdg-finals',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    description: 'JDG在半决赛中横扫BLG，Ruler和Knight表现亮眼。',
    content: null,
    author: 'LoL Esports',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt9876543210fedcba/lpl-jdg.jpg',
    categories: ['esports', 'lpl'],
    locale: 'zh-cn',
    source: 'lolesports',
    source_category: 'esports',
  },

  // Korean patch notes
  {
    guid: 'demo-19',
    title: '패치 14.5 노트: 챔피언 밸런스',
    url: 'https://www.leagueoflegends.com/ko-kr/news/game-updates/patch-14-5-notes/',
    pub_date: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    description: '14.5 패치가 출시되었습니다. 15명의 챔피언 밸런스 조정이 포함되어 있습니다.',
    content: null,
    author: 'Riot Games',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt1234567890abcdef/patch-14-5.jpg',
    categories: ['patch-notes'],
    locale: 'ko-kr',
    source: 'riot',
    source_category: 'patch-notes',
  },

  // Vietnamese content
  {
    guid: 'demo-20',
    title: 'VCS Spring 2024: GAM Esports Vô Địch',
    url: 'https://www.lolesports.com/vi_vn/news/vcs-spring-gam-champions',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    description: 'GAM Esports đánh bại Vike trong chung kết, giành chức vô địch VCS Spring 2024.',
    content: null,
    author: 'LoL Esports',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt9876543210fedcba/vcs-gam.jpg',
    categories: ['esports', 'vcs'],
    locale: 'vi-vn',
    source: 'lolesports',
    source_category: 'esports',
  },

  // German content
  {
    guid: 'demo-21',
    title: 'Patch 14.3 Notizen: Balance-Anpassungen',
    url: 'https://www.leagueoflegends.com/de-de/news/game-updates/patch-14-3-notes/',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    description: 'Die neuesten Balance-Änderungen sind mit Patch 14.3 da.',
    content: null,
    author: 'Riot Games',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt1234567890abcdef/patch-14-3.jpg',
    categories: ['patch-notes'],
    locale: 'de-de',
    source: 'riot',
    source_category: 'patch-notes',
  },

  // Italian content
  {
    guid: 'demo-22',
    title: 'LEC Spring 2024: Il Trionfo di G2',
    url: 'https://www.lolesports.com/it-it/news/lec-spring-g2-triumph',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    description: 'G2 Esports conquista il titolo LEC Spring 2024 in una finale emozionante.',
    content: null,
    author: 'LoL Esports',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt9876543210fedcba/lec-g2.jpg',
    categories: ['esports', 'lec'],
    locale: 'it-it',
    source: 'lolesports',
    source_category: 'esports',
  },

  // Polish content
  {
    guid: 'demo-23',
    title: 'EC 2024: Akademia Drwena w Finale',
    url: 'https://www.lolesports.com/pl-pl/news/ec-2024-drwena-finals',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    description: 'Akademia Drwena awansowała do finału EMC, pokonując AGO Rogue.',
    content: null,
    author: 'LoL Esports',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt9876543210fedcba/ec-drwena.jpg',
    categories: ['esports', 'emc'],
    locale: 'pl-pl',
    source: 'lolesports',
    source_category: 'esports',
  },

  // Turkish content
  {
    guid: 'demo-24',
    title: 'TCL 2024 Bahar: Galatasaray Şampiyon',
    url: 'https://www.lolesports.com/tr-tr/news/tcl-spring-gs-champions',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    description: 'Galatasaray, büyük finalde FUT ESC\'yi yenerek TCL 2024 Bahar şampiyonluğunu kazandı.',
    content: null,
    author: 'LoL Esports',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt9876543210fedcba/tcl-gs.jpg',
    categories: ['esports', 'tcl'],
    locale: 'tr-tr',
    source: 'lolesports',
    source_category: 'esports',
  },

  // Russian content
  {
    guid: 'demo-25',
    title: 'LCL Spring 2024: Gambit Побеждает',
    url: 'https://www.lolesports.com/ru-ru/news/lcl-spring-gambit',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    description: 'Gambit Esports одерживает победу в LCL Spring 2024.',
    content: null,
    author: 'LoL Esports',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt9876543210fedcba/lcl-gambit.jpg',
    categories: ['esports', 'lcl'],
    locale: 'ru-ru',
    source: 'lolesports',
    source_category: 'esports',
  },

  // Thai content
  {
    guid: 'demo-26',
    title: 'THAI Spring 2024: Talon Esports แชมป์',
    url: 'https://www.lolesports.com/th-th/news/thai-spring-talon',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 19).toISOString(),
    description: 'Talon Esports คว้าแชมป์ THAI Spring 2024 เอาชนะ Buriram United',
    content: null,
    author: 'LoL Esports',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt9876543210fedcba/thai-talon.jpg',
    categories: ['esports', 'thai'],
    locale: 'th-th',
    source: 'lolesports',
    source_category: 'esports',
  },

  // Indonesian content
  {
    guid: 'demo-27',
    title: 'IDL Spring 2024: BOOM Esports Juara',
    url: 'https://www.lolesports.com/id-id/news/idl-spring-boom',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 21).toISOString(),
    description: 'BOOM Esports menjadi juara IDL Spring 2024 setelah mengalahkan Rex Regum.',
    content: null,
    author: 'LoL Esports',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt9876543210fedcba/idl-boom.jpg',
    categories: ['esports', 'idl'],
    locale: 'id-id',
    source: 'lolesports',
    source_category: 'esports',
  },

  // Spanish (Spain) content
  {
    guid: 'demo-28',
    title: 'LCV Spring 2024: Giants Campeón',
    url: 'https://www.lolesports.com/es-es/news/lcv-spring-giants',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
    description: 'Giants Gaming se corona campeón de la LCV Spring 2024.',
    content: null,
    author: 'LoL Esports',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt9876543210fedcba/lcv-giants.jpg',
    categories: ['esports', 'lcv'],
    locale: 'es-es',
    source: 'lolesports',
    source_category: 'esports',
  },

  // Philippines content
  {
    guid: 'demo-29',
    title: 'PS Spring 2024: ECHO Champions',
    url: 'https://www.lolesports.com/ph-ph/news/ps-spring-echo',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
    description: 'ECHO emerges victorious in PS Spring 2024, defeating ONIC Philippines.',
    content: null,
    author: 'LoL Esports',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt9876543210fedcba/ps-echo.jpg',
    categories: ['esports', 'ps'],
    locale: 'ph-ph',
    source: 'lolesports',
    source_category: 'esports',
  },

  // Arabic content
  {
    guid: 'demo-30',
    title: 'LEC Spring 2024: G2 يتوج بالبطولة',
    url: 'https://www.lolesports.com/ar-ae/news/lec-spring-g2-arabic',
    pub_date: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString(),
    description: 'يتوج فريق G2 Esports ببطولة LEC Spring 2024 بعد نهائي مثير.',
    content: null,
    author: 'LoL Esports',
    image_url: 'https://images.contentstack.io/v3/assets/blt731acb42bb227a68/blt9876543210fedcba/lec-g2.jpg',
    categories: ['esports', 'lec'],
    locale: 'ar-ae',
    source: 'lolesports',
    source_category: 'esports',
  },
];

/**
 * Get demo articles by locale.
 */
export function getDemoArticlesByLocale(locale: string): Article[] {
  return demoArticles.filter((article) => article.locale === locale);
}

/**
 * Get demo articles by category.
 */
export function getDemoArticlesByCategory(category: string): Article[] {
  return demoArticles.filter((article) =>
    article.categories.includes(category)
  );
}

/**
 * Get demo articles by source.
 */
export function getDemoArticlesBySource(source: string): Article[] {
  return demoArticles.filter((article) => article.source === source);
}

/**
 * Filter demo articles based on filter criteria.
 */
export function filterDemoArticles(
  articles: Article[],
  filters: {
    locale?: string;
    category?: string;
    source?: string;
    search?: string;
    limit?: number;
  }
): Article[] {
  let filtered = [...articles];

  if (filters.locale) {
    filtered = filtered.filter((a) => a.locale === filters.locale);
  }

  if (filters.category) {
    filtered = filtered.filter((a) => a.categories.includes(filters.category!));
  }

  if (filters.source) {
    filtered = filtered.filter((a) => a.source === filters.source);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(searchLower) ||
        a.description?.toLowerCase().includes(searchLower)
    );
  }

  if (filters.limit) {
    filtered = filtered.slice(0, filters.limit);
  }

  return filtered;
}

/**
 * Get all unique categories from demo articles.
 */
export function getDemoCategories(): string[] {
  const categories = new Set<string>();
  demoArticles.forEach((article) => {
    article.categories.forEach((cat) => categories.add(cat));
  });
  return Array.from(categories).sort();
}

/**
 * Get all unique sources from demo articles.
 */
export function getDemoSources(): string[] {
  const sources = new Set<string>();
  demoArticles.forEach((article) => sources.add(article.source));
  return Array.from(sources).sort();
}

/**
 * Get all unique locales from demo articles.
 */
export function getDemoLocales(): string[] {
  const locales = new Set<string>();
  demoArticles.forEach((article) => locales.add(article.locale));
  return Array.from(locales).sort();
}
