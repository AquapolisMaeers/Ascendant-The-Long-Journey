'use strict';
// Newest updates first. Add player-facing changes here before rebuilding DIST.
RPG.data.patches = [
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
