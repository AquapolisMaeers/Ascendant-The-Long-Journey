'use strict';
// Newest updates first. Add player-facing changes here before rebuilding DIST.
RPG.data.patches = [
  {date:'2026-10-17',title:'Materials together and complete artwork',changes:[
    'Crafting > Smithing > Materials combines bars, leather and cloth at every material level. All three use matching cards with aligned ingredient sections, quantity controls and full-width crafting buttons; phones show one card per row.',
    'Auras and mounts now use individually measured picture boundaries, keeping neighbouring artwork out of equipped views and collections. Class armour, refined textiles and advanced gems use the same proportional fitting so full paintings, including robe hems, remain visible.'
  ]},
  {date:'2026-10-17',title:'Farming follows the road',changes:[
    'Removed the Farming Grove and its direct-harvest shortcuts. Discover fibre crop patches with Advance, then Harvest them with Pruning Shears, like other gathering encounters. Existing crops, Farming XP and tools are preserved.',
    'Gathering always uses your chosen primary and secondary skills. Primary keeps 25% per Advance and secondary keeps 12.5%; the remaining three skills split 12.5% equally, about 4.17% each. Total gathering remains 50%, and Farming can be primary or secondary.'
  ]},
  {date:'2026-10-17',title:'Farming and Pruning Shears',changes:[
    'Farming is the eighth skill, with its own level, XP and Pruning Shears. Every character receives free bound Common shears. Existing skills, tools and stored fibres are preserved.',
    'Harvest Flax Fibre from Farming level 1, Nettle Fibre from level 5, and later crops at their material levels. Visit World > Farming Grove for repeatable harvesting, or discover crop patches through Advance. Woodcutting now produces lumber without a fibre bonus.',
    'Farming supports tool drops and Ascension, all five tool prefixes, offline XP training, gathering preferences, AFK harvesting, regional quests, achievements and skill leaderboards. Balanced gathering divides its unchanged 50% encounter pool evenly among five skills.',
    'Pruning Shears receive a painted illustration matching the original tools. Skills, crafting guidance, fibre descriptions and gathering controls now identify Farming as the textile source.'
  ]},
  {date:'2026-10-17',title:'Painted equipment and clearer class paths',changes:[
    'Mage and ranger armour now uses painted item illustrations for all five slots, all twelve regular tiers and all five dungeon sets. Textile materials, advanced gems, mounts and auras follow the original painted style; outfit collections use their matching painted portraits.',
    'Reaver opens with Leeching cuts: every third successful attack deals 4% extra damage and restores 0.3% maximum health per rank. Berserker keeps Heavy blows for steady damage. Existing invested ranks carry over.',
    'Talent paths share aligned rows and buttons, with shorter requirement text and a compact layout. Phones show one path at a time in a vertical list.',
    'World adds a repeatable Fibre Grove: gather two fibres per Woodcutting action, with five charges per visit. Nettle Fibre is available at Woodcutting level 5 in the Crossroads. Normal Woodcutting still collects fibres alongside lumber. Crafting and Skills link to the grove.',
    'Material tier selectors now use simple Level 1, Level 5 and subsequent level labels. Actual material names remain visible on recipes and items.'
  ]},
  {date:'2026-10-17',title:'Disciplines, renewal and the depths',changes:[
    'Removed the extra talent path shortcut buttons. Reaver gains stronger damage, health, penetration and double attacks; Blood Siphon always grants lifesteal and doubles it below 60% HP. Feast now heals 4% maximum health every fourth successful attack and empowers the next hit by 30%.',
    'Smithing > Armor adds a class selector for all five Warrior, Ranger and Mage pieces. Rangers use cured leather and wooden fittings; mages use cloth and fibres. Cure hides and weave cloth under Leather & cloth. Woodcutting gathers same-tier fibres, also sold by regional suppliers. Enhancement and Ascension use each armour class’s materials.',
    'Shop > Utility offers the illustrated Tome of Renewal for 1 Gold and Crystal of Recollection for 50 Silver. Consume one to reset perks or talents respectively; the other system stays allocated. Reset from Character or the inventory item, with confirmation and no item spent on cancellation. Talent resets now require the crystal.',
    'Gathering, Smithing and Cooking gain 10% more base XP. Faceting falls from 1,000 to 660 XP per effective level, including the corresponding lower offline base. Skill levels and previously earned XP are preserved.',
    'All five dungeon bosses have their own formidable portraits. Each dungeon gains a unique painted backdrop, darker room panels, a suspenseful room summary and torchlight accents. Dungeon particles replace outdoor weather, and mobile healing remains above navigation.'
  ]},
  {date:'2026-10-17',title:'Class paths and a more dangerous journey',changes:[
    'Character > Talents adds three paths per class: Berserker, Guardian and Reaver; Marksman, Skirmisher and Venom Hunter; Pyromancer, Frostbinder and Arcanist. Earn one point per combat level after Level 1, including past levels. Climb connected nodes and reset talents free between dungeon runs. Existing milestone perks are unchanged.',
    'Crossroads creatures retain their original stats. Health, damage, defence, penetration and critical resistance grow more strongly in later regions. Dungeon elites roll entry level +5–9 and bosses +7–9, including level 105–109 endgame foes.',
    'Gear and tool rarity rolls now use 0.1% Ascendant for normal creatures, 0.2% for elites and 0.5% for bosses. Other high rarities are reduced too. These are rarity chances after a gear or tool drop succeeds.',
    'Every helmet, body, legs, gloves and boots drop rolls equally between Warrior, Archer and Mage armour after the existing slot roll. Warriors gain sturdy plate, archers gain nimble leather and mages gain offensive robes. Smithing offers your class variants. Existing armour becomes its owner’s class and retains upgrades, gems, rarity and locks.',
    'Auto-Eat 25% is sold under Shop > Character from level 10 for 25 Silver. The old free 25% unlock is removed; paid 50% and 75% upgrades remain. Tutorial meals are assigned for manual eating.',
    'Phone Provisions opens above the encounter. Combat Eat controls sit outside the World painting layers so they remain tappable above navigation. Sidebar navigation is slightly larger.'
  ]},
  {date:'2026-10-16',title:'A steadier fight on the phone',changes:[
    'Faceting groups all 17 gem types. The ten advanced types now fuse three matching gems into the next rank, II–V. Their starting gems still come from mystery boxes.',
    'Phones keep Eat, food counts and cooldowns above navigation, with larger health bars and an expandable combat log. Food setup moves beside the encounter.',
    'Desktop tabs have slightly larger labels and icons. Faceting tool Ascension no longer needs an uncut Attack gem.'
  ]},
  {date:'2026-10-16',title:'The trade quarter, mounts and a new face',changes:[
    'General shop and Ascendant Emporium now share the Shop page with separate selectors. The coin wallet opens the Emporium there. The sidebar has fewer, shorter rows, and clicking the Ascendant name returns to World.',
    'A 75 AC Mount Mystery Box offers 19 mounts mirroring outfit and aura bonuses. Focused rewards total 90%, build rewards 9.5%, and Eclipse Sovereign 0.5%. Duplicates return 15 AC. Collect several, equip one under Character > Mounts.',
    'The Special Pet Mystery Box now costs 100 AC. Its rewards and duplicate refund stay the same.',
    'All 19 outfits have a matching character portrait. Equip an outfit, click your avatar and choose its portrait. Citizen portraits remain available. Changing or removing the outfit restores a selected outfit portrait to your citizen choice.',
    'New characters start AFK with normal creatures, gathering and chests enabled; elites and dungeons stay off. Existing filter preferences are preserved. The 8-second interval now matches the surrounding Settings controls.',
    'Mute all audio silences music, effects and ambience while preserving every volume slider. The mute switch and saved volumes persist when you return.'
  ]},
  {date:'2026-10-16',title:'Learn the route, choose your pace',changes:[
    'Tutorial lessons explain where to click and why each task matters. Follow the navigation yourself; completing a practical lesson keeps you on the current page.',
    'Crafting quantities now select a batch without starting it. Press Cook, Smith, Cut or Fuse when ready. Health perks immediately add their gained maximum HP to current health.',
    'Skills adds Balanced gathering for equal odds across all four gathering skills. Preferred skills retains primary and secondary choices. Both keep the same combined gathering chance.',
    'AFK advancing always uses an 8-second interval. Type your own minimum estimated victory chance and low-health stop percentage in Settings.',
    'Upgrade windows show one clear currency total. Exchange quantities respect available unlocked inventory and include a Max button.',
    'Choose from three humble citizen portraits per class during creation or by clicking your avatar. Six new portraits match the existing plain medieval style.'
  ]},
  {date:'2026-10-15',title:'Humble beginnings, a fuller stable and the barter counter',changes:[
    'Class portraits now show ordinary medieval citizens in plain clothing. The 3D character and rarity frame are removed. The seven special companions have new painted portraits matching the regular companion art style.',
    'Every special companion gains a second level-scaled stat. Collect multiple regular and special companions, then equip one for its bonuses. Active, Stable and Adopt views keep the collection organized. Returning any companion to the stable preserves its progress.',
    'Shop materials now use location and tier dropdowns. Supplies from other regions unlock when you reach their region level. Starter materials remain 10 Bronze; higher tiers use increasingly expensive premium prices so gathering stays valuable.',
    'Shop > Exchange trades 10 unlocked raw materials for 1 different raw material of the same tier. Ore, lumber, raw fish and hides are supported. Review the exact quantities before confirmation; full bags and locked materials are handled safely.'
  ]},
  {date:'2026-10-15',title:'New bonds, stronger gems and a living model',changes:[
    'All ten exclusive gem types now give twice their previous bonuses at every rank, including gems already owned or socketed. Regular gems, compatible slots and mystery-box odds keep their existing rules.',
    'The seven mystery-box companions become Vesperglass Kirin, Mossbell Terrapin, Cindercoil Wyrmling, Prismveil Moth, Gilded Jackalope, Starwhisker Koi and Velvet Oracle. Each has an original portrait and story. Existing ownership, levels, ascensions and care are preserved.',
    'Your equipped portrait is now a real 3D character with separately fitted equipment meshes, depth and lighting. Click the portrait to rotate the preview by dragging, arrow keys or buttons. Materials follow equipped gear tiers; rarity shine respects Reduced Motion.',
    'Pet mystery-box outcome lists show each creature portrait. The 3D model works locally without external downloads and retains a rotatable fallback for devices without WebGL.'
  ]},
  {date:'2026-10-15',title:'A clearer view of your journey',changes:[
    'The activity tracker is shorter, reserving less screen space while keeping progress, timers and Stop controls. Advancing on World uses inline progress again; the tracker follows you when you visit another page.',
    'The equipped portrait now uses one shaded character model with fitted armor, paired gloves and boots, and correctly held swords, bows and staves. Gear materials and rarity accents update with equipment; Reduced Motion still disables shine.',
    'Mystery boxes have a more compact layout. Outfit and aura boxes now have a 90% focused pool, 9.5% build pool and exactly 0.5% Eclipse Sovereign chance. Gem reward filters retain the real per-opening odds.',
    'A Gem guide explains every gem bonus, rank and compatible slot. Exclusive gem slots now follow their matching prefix rules. Older saves safely return newly incompatible socketed gems to inventory or Pending Loot.'
  ]},
  {date:'2026-10-15',title:'Fortune, gems and the gear you wear',changes:[
    'The Emporium now offers mystery boxes only. Direct outfit, aura and special-pet sales are removed; existing collections, equipment and companion progression are preserved. Pet descriptions show their actual bonuses without counterpart comparison text.',
    'The 25 AC Gem Mystery Box contains all 17 types at ranks I to V: 90% regular gems and 10% exclusive stat gems. Rank chances are 60%, 25%, 10%, 4.5% and 0.5%. Every possible reward and its odds appear before confirmation.',
    'Ten box-exclusive gem types add damage, defence and health percentages, attack speed, penetration, double attack, dodge, damage reduction, critical resistance and lifesteal. Their bonuses obey existing caps and compatible-slot rules. Existing gems keep their normal loot and Faceting sources.',
    'Outfits & Auras stays available when viewing Perks. The top player icon now composes the exact equipped item artwork, with individual rarity glow and a gentle shine for rarer equipment. Click it for a larger preview and equipment access; Reduced Motion disables the shine.'
  ]},
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
