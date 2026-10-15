'use strict';
// Newest updates first. Add player-facing changes here before rebuilding DIST.
RPG.data.patches = [
  {date:'2026-10-15',title:'The Ascendant collection opens',changes:[
    'Health bars now blend from green through amber to red as health falls. The low-health rectangle is removed. Inventory adds material and gem-type filters, and the current region appears above the Wayside inn.',
    'The activity card has a reserved bottom shelf. Pages scroll above it, keeping controls clear on desktop and phone. Shop cards use tighter desktop spacing.',
    'Collect 19 outfits and 19 auras: fifteen stat focuses, aggressive/tanky/utility builds, and Eclipse Sovereign. Equip one of each under Character > Outfits & Auras. Small bonuses obey existing combat caps; collections persist outside inventory.',
    'Seven special companions give exactly twice the matching regular pet bonus. A companion stable preserves levels and ascensions when switching; feeding, hunger and rarity rules remain the same.',
    'Outfit and aura boxes cost 75 AC with displayed per-item odds: focused 6%, build 3%, Sovereign 1%. Pet boxes cost 125 AC with seven equally likely pets. Duplicate collection rewards return a stated partial AC refund.',
    'Stone boxes cost 5 AC: 1% for one Ascendant Stone, or 33% each for 5, 10 or 15 Silver. Every box requires confirmation and lists all outcomes. Added 24 achievements for storage, companion milestones and collections.'
  ]},
  {date:'2026-10-15', title:'More room for the journey', changes:[
    'Smithing now separates recipes into Bars, Armor, Weapons and Accessories. All metal tiers keep their full recipe selection, and returning to a task restores its category and tier.',
    'One compact bottom-left tracker follows crafting, gathering, travelling and AFK sessions across every page. It shows percentages, completed actions, elapsed/total action time and estimated batch time, with Stop controls where available.',
    'Desktop spacing is tighter on shorter browser windows. Companion choices use a compact grid and achievements use eight-record pages, keeping every record accessible.',
    'Storage gains matching chest artwork with a plus badge. Crafting keeps a steady header across disciplines, and phone notifications clear the bottom navigation.'
  ]},
  {date:'2026-10-15', title:'A journey made for thumbs', changes:[
    'Phones now have a fixed bottom bar for World, Inventory, Crafting and Shop. More opens the full page menu, including character slots. AFK advancing keeps running while you browse.',
    'A compact sticky header keeps health, level progress and currency in view. Touch controls are larger, form inputs are easier to read, and dialogs open as bottom sheets.',
    'World groups the inn, region details and AFK controls into expandable sections. Material shopping uses two columns on suitable phones; Inventory keeps search accessible as you scroll.',
    'Task progress, level cards and toasts sit above the phone navigation. Inner tabs and tables scroll independently, and crafting keeps consistent control spacing. Desktop keeps its existing layout.'
  ]},
  {date:'2026-10-15', title:'Every level deserves a moment', changes:[
    'Character, skill and companion levels now have a dismissible milestone card showing old and new levels. Multiple gains group together. Ascension milestones and final level caps are called out.',
    'The offline welcome report includes previous/new levels, total levels gained and XP progress for every trained character. It appears after reopening the game or returning from a hidden tab, and waits for existing confirmations to close.',
    'Shop offers, purchase confirmations and sale dialogs now show matching artwork. Auto-Eat upgrades have dedicated 50% and 75% emblems; ownership, prices and level requirements are clearer.',
    'Angled shop ribbons, compact illustrated sale cards, colored navigation icons and distinct skill accents add teal, violet, sage and warm gold to the crimson theme. Reduced Motion remains supported.'
  ]},
  {date:'2026-10-15', title:'The price of the road & a sharper interface', changes:[
    'AFK advancing keeps 15 free active minutes, then charges the displayed regional rate: 10 Bronze at the Crossroads, rising to 15 Silver in the Ancient Dominion.',
    'Travelling costs the destination fare multiplied by regions crossed. Review and confirm the total before paying; returning uses the return destination rate.',
    'World weather follows location. Weather controls and the status strip are removed. Dust motes and wind are more pronounced; Reduced Motion and the ambient-effects setting remain available.',
    'The crimson interface gains sharper card accents, new locally hosted display and reading fonts, and a framed Ascendant Coins wallet.',
    'Smithing, Cooking and Faceting keep the same HUD, heading, tabs and toolbar spacing. Switching disciplines no longer animates the title or shifts the page width.'
  ]},
  {date:'2026-10-15', title:'Weather, clearer workspaces & companion ascension', changes:[
    'Dust motes drift across the interface. World has cosmetic rain and wind, an automatic six-minute weather cycle and manual previews. Settings can disable particles; Reduced Motion disables them automatically.',
    'Shop → Sell now filters Equipment, Tools, Materials, Gems, Food, Stones and Utility. Perks has a new milestone layout with distinct offensive, defensive and utility paths.',
    'Companions start Common. Level caps by rarity are 20, 40, 50, 60, 70, 80, 90 and 100. Ascend at each cap using 1–7 Ascendant Stones; success chances are 100%, 80%, 60%, 40%, 20%, 20% and 20%. Failure consumes stones but preserves level and rarity. Seven diamonds track ascensions.',
    'Achievements shows Completionist and overall completion percentages. The Completionist keeps its original launch requirements.',
    'Active work has a compact progress dock when browsing other pages. Click it to return to your task. AFK skilling moves to Skills → Offline training and Settings, with a World shortcut.',
    'Fluid typography and responsive cards adapt from small phones to wide displays. Laptop-height layouts use tighter spacing; manual UI scaling remains available.'
  ]},
  {date:'2026-10-15', title:'A living interface & a view of the road', changes:[
    'World now uses the current location painting as its full-page backdrop, with translucent panels and a compact location summary. The location tint follows your travels.',
    'Inner tabs use a clean gold underline without the red fill. The main navigation keeps its crimson selection.',
    'Dialogs settle into place, page titles slide in on navigation, and tabs and selectable cards respond smoothly. Routine gameplay updates do not restart these animations; Reduced Motion disables them.'
  ]},
  {date:'2026-10-15', title:'A bolder journey, clearer first steps', changes:[
    'New ink-and-crimson presentation, distinct framed menus and a labeled Gold/Silver/Bronze wallet. Screen updates preserve existing elements and no longer replay page fades or pulsing screen effects.',
    'Ascendant Stones sell for 1 Gold. Tool sale prices from Common to Ascendant: 50b, 1s, 2s 50b, 5s, 10s, 25s, 50s, 1g.',
    'Craft quantity buttons now open a confirmation. Full bags stop crafting before the next payment; stopping keeps all unused ingredients.',
    'Class selection includes character stories and practical build guidance. Every mode asks for confirmation.',
    'Tutorial training is clearly marked and explains gathering preferences, offline skilling, active AFK advancing, campfire, inn and tool prefixes.',
    'Primary and secondary gathering preferences split the existing 50% gathering chance at 4:2:1:1: 25%, 12.5%, 6.25%, 6.25%. Change preferences in Skills; saved per character.'
  ]},
  {
    "date": "2026-10-14",
    "title": "Meals with character",
    "changes": [
      "All twelve cooked foods have their own comic flavor text in item details and Cooking previews.",
      "Companion feeding keeps your selected meal after each feed and when returning to the page. Each character remembers its own choice during the session. An empty or locked choice stays selected, with feeding disabled until you restock, unlock it or choose another meal."
    ]
  },
  {
    "date": "2026-10-14",
    "title": "Compact crafting & new milestones",
    "changes": [
      "Smithing, Cooking and Faceting show illustrated, rarity-colored skill/tool cards. Click one to inspect your tool. Smithing recipes now use the same compact five-column desktop layout as Faceting.",
      "Offline Faceting XP is halved again to 1.875% of base active XP. Active Faceting XP is unchanged.",
      "The journey so far now shows elite creatures defeated and quests completed.",
      "New Quests achievements reward 1, 10, 100, 1,000 and 10,000 completions. Companions achievements reward first adoption and levels 5, 10, 15 and 20. Existing progress counts, with the usual five Ascendant Coins per milestone.",
      "Character and Skills spacing is trimmed slightly to remove the remaining desktop scrolling. The Completionist keeps its original launch requirements."
    ]
  },
  {
    "date": "2026-10-14",
    "title": "Mimic gems, new rankings & room to play",
    "changes": [
      "Defeated chest Mimics guarantee a gem. Their other loot rolls stay the same, and naturally rolled gems count toward the guarantee.",
      "Leaderboards adds Most Quests Completed and Highest Companion Level, with XP breaking companion-level ties.",
      "Character Equipment, Stats and Perks, all seven Skills, Settings and Faceting use compact desktop layouts for 1080p screens. Settings removes the large sound information panel; audio samples remain in a small expandable control.",
      "Faceting opens on Attack Gem and lists its five ranks. All gems is removed; individual gem types remain selectable.",
      "Start AFK gives 15 free active minutes, then continues at 10 Bronze per started minute in every location until stopped. Duration selection is removed. The timer counts upward from 00:00; hidden tabs pause time and billing."
    ]
  },
  {
    "date": "2026-10-14",
    "title": "Flexible tool prefixes & compact popups",
    "changes": [
      "Tool drops receive 0/1/2/3/4/5/6/7 prefix rolls from Common to Ascendant. Each roll adds a prefix or upgrades an existing one; five distinct prefixes become available at Mythical.",
      "An Epic drop can have three prefixes, two with one upgraded, or one upgraded twice. Ascendant spends seven rolls across up to five prefixes. Existing tools keep their progress.",
      "Click outside a dialog to close it. Upgrade confirmations cancel without spending anything; Escape and the close button still work.",
      "Item artwork sits beside the title, and desktop item details place gem sockets beside prefixes and upgrades. Popups use more available screen height and retain scrolling for longer content on smaller screens."
    ]
  },
  {
    "date": "2026-10-13",
    "title": "Corrected tool drop prefixes",
    "changes": [
      "Common tool drops have no prefixes; Uncommon gets one, Rare two, and Epic three distinct prefixes.",
      "Legendary and higher tool drops keep three prefixes and upgrade existing ones: one extra rank at Legendary, two at Mythical, three at Divine, four at Ascendant.",
      "This corrects new drops. Existing saved tools retain their prefixes and progress."
    ]
  },
  {
    "date": "2026-10-13",
    "title": "Regional quests & stronger drops",
    "changes": [
      "Gear now shares tool prefix limits: 3 at Common–Rare, 4 at Epic–Mythical, 5 at Divine–Ascendant. +25 gear can refine missing slots without raising Enhancement.",
      "Dropped tools arrive with rarity-based prefix rolls. A Rare Chisel has three total rolls: three prefixes, or two with one upgraded.",
      "Quests unlock after the tutorial: three slots with creature and gathering objectives in your highest unlocked region. Completion pays coins/materials and starts a 30-minute replacement timer that also runs offline.",
      "Gathering quests require usable regional skills. Unfinished quests switch when a harder region unlocks. Upgrade boxes and confirmations show larger success chances, coin costs and Bronze totals."
    ]
  },
  {
    "date": "2026-10-13",
    "title": "Stronger tools. Clearer choices.",
    "changes": [
      "Tools hold up to 3 prefixes at Common–Rare, 4 at Epic–Mythical, and 5 at Divine–Ascendant. Ascension previews show newly unlocked capacity.",
      "Offline Smithing and Cooking XP are halved. Active crafting stays unchanged.",
      "Companion food scales by its required level versus companion level: matching levels give 10 hunger, lower levels give less, higher levels more (up to 50).",
      "Crafting comparisons show your full build after replacing equipped gear, including existing prefixes, gems, perks and bonuses.",
      "Combat shows green healing numbers and log entries for food, Lifesteal, Second Wind, Relentless and level-up recovery."
    ]
  },
  {
    "date": "2026-10-13",
    "title": "Choose your journey. Grow your pack.",
    "changes": [
      "Compact Enhance and Ascend buttons open full confirmations with costs, chances, stat changes and eligible prefix ranges before spending.",
      "AFK filters now include normal creatures and dungeons. Gather only, or explore dungeon rooms with fresh odds checks. Eating and campfire healing keep AFK running.",
      "Each AFK session has 15 free minutes. Longer runs cost 10 Bronze per location number for each extra started minute, stopping if funds run out.",
      "Four new companions add Critical Chance, Critical Damage, Attack Speed and Lifesteal bonuses, with matching artwork and the same food upkeep.",
      "Companions and Leaderboards have new icons. The Emporium has seven Coming soon categories, including outfits, auras, special pets, mystery boxes and Ascendant Stone Boxes.",
      "Buying shortcuts now end at x100. Selling keeps All."
    ]
  },
  {
    "date": "2026-10-13",
    "title": "New pursuits for the long journey",
    "changes": [
      "Offline Faceting now earns 15% of its previous XP. Active Faceting is unchanged.",
      "Mobile combat focuses on the fight and Provisions, with level and health visible.",
      "Local leaderboards cover 16 pursuits. Companions gain levels and bonuses, with food upkeep and paid revival.",
      "Earn Ascendant Coins from achievements and combat milestones. The Emporium, outfits and auras are Coming soon. Enhance now confirms prefix ranges before spending."
    ]
  },
  {
    "date": "2026-10-13",
    "title": "Know your gear. Choose your look.",
    "changes": [
      "The Wayside inn has new artwork. Crafting previews show gear stats, food healing, gem effects and equipment requirements.",
      "Enhancement previews show stat changes and an organized list of possible prefixes. Armour hides now cost 3/6/9/12/15 across five-level bands.",
      "Lifesteal gains round up to 0.1 HP, based on actual damage and capped at missing health.",
      "Click your character portrait to freely choose one of five looks for your class. Your choice stays with your local save."
    ]
  },
  {
    "date": "2026-10-13",
    "title": "Training, supplies & the Wayside inn",
    "changes": [
      "Choose any of seven AFK training skills beside health and coins in the top bar. Offline training awards XP only.",
      "Buy starter ore, logs, raw Minnows and pelts for 10 Bronze each. Selling has 1, 10, 25, 50 and All shortcuts.",
      "The inn offers paid 25%, 50% or full healing with no cooldown. Tool rarities have no skill-level requirement.",
      "Gear crafting uses three times the hides/pelts. Enhancement wood and hide costs increase every five levels, now 3/6/9/12/15 units."
    ]
  },
  {
    "date": "2026-10-13",
    "title": "Character selection & crafting",
    "changes": [
      "Choose your saved adventurer each time the game opens. Gameplay waits until you select a character.",
      "Recent patch notes now appear on the launch screen.",
      "Crafting filters show fish for Cooking, metals for Smithing, and gems for Faceting."
    ]
  },
  {
    "date": "2026-10-13",
    "title": "A smoother, fiercer journey",
    "changes": [
      "Gear borders and glow show rarity at a glance; rare drops receive a prominent reveal.",
      "The required tutorial returns you to the next lesson after each completed task.",
      "Advance is higher on the World screen. Provisions, Campfire and AFK remain; journey records are in Achievements.",
      "Greaves now depict pants and platelegs. Cooking sizzles, and woodcutting sounds like an axe striking a log.",
      "Defeat costs 10% of coins (rounded up) and one inventory unit in the first land. Each later land adds 5% and one unit. Equipped items are protected."
    ]
  },
  {
    "date": "2026-10-13",
    "title": "Local saves & GitHub Pages",
    "changes": [
      "All saves stay in the player's browser on their own device. Export a JSON backup to keep a separate copy.",
      "The refreshed DIST build supports static hosting on GitHub Pages without accounts.",
      "Ingredient names and owned counts have aligned columns and clearer spacing."
    ]
  },
  {
    "date": "2026-10-12",
    "title": "The journey takes shape",
    "changes": [
      "Added guided lessons, AFK advancing, equipment and tool improvements, and detailed item artwork.",
      "Each discipline has its own quieter soundscape, with separate Music, Ambience and SFX controls."
    ]
  }
];
