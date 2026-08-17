/**
 * Level 1: Whispering Caverns (Chapter 1)
 * A continuous 175-tile epic linear level with 5 narrative zones:
 * 1. Whispering Entrance (Tiles 0–35)
 * 2. Magisteel Mines (Tiles 36–75)
 * 3. Hazard Grotto & Spore Cavern (Tiles 76–120)
 * 4. Ancient Monolith Sanctuary (Tiles 121–145)
 * 5. Tempest Serpent Arena (Tiles 146–175)
 */

export const Level1_WhisperingCaverns = {
  id: 'chapter1',
  name: 'Floor 1: Whispering Caverns',
  width: 175,
  height: 18,
  tileSize: 32,
  next: 'chapter2', // Unlocks next chapter upon boss defeat

  // 18 Rows x 175 Columns Layout Grid
  // '#' = Solid Rock / Scaffold / Ground
  // '.' = Walkable Air / Cave Interior
  // '>' = Grand Victory Rift (at far right of boss arena)
  layout: [
    // Row 0: Ceiling
    "###############################################################################################################################################################################",
    // Row 1: High Vaults
    "#.............................................................................................................................................................................#",
    // Row 2: Ceiling Stalactite Mounts
    "#.............................................................................................................................................................................#",
    // Row 3: High Upper Caverns
    "#.............................................................................................................................................................................#",
    // Row 4: Upper Scaffolds & Secret Ledges
    "#.............................................######......................................######.......................................................######................#",
    "#.............................................................................................................................................................................#",
    // Row 6: High Vantage Platforms (Archers / Chests)
    "#.......................................#####........#####..........................#####........#####...........................................######........######.........#",
    "#.............................................................................................................................................................................#",
    // Row 8: Mid-Tier Mining Scaffolding & Arena Dodge Platforms
    "#.................................#####....................#####..............#####....................#####...............................#####....................#####...#",
    "#.............................................................................................................................................................................#",
    // Row 10: Step Ledges & Jump Nodes
    "#...........................####..................................####..####..................................####...................######.................................#",
    "#.............................................................................................................................................................................#",
    // Row 12: Low Jump Stepping Stones
    "#..................#####.......................................................................................................#####...........................................#",
    "#.............................................................................................................................................................................#",
    // Row 14: Near-Floor Props / Air Space
    "#............................................................................................................................................................................>#",
    // Row 15: Primary Cavern Floor (with hazard pit at tiles 86-90 and 106-110)
    "######################################################################################....#####################################################################################",
    // Row 16: Deep Bedrock Layer 1
    "######################################################################################....#####################################################################################",
    // Row 17: Deep Bedrock Layer 2
    "###############################################################################################################################################################################"
  ],

  // Comprehensive Entity & Prop Spawns across the 175-tile level (x and y in pixel coordinates, tile = 32px)
  spawns: [
    // === ZONE 1: WHISPERING ENTRANCE (Tiles 0–35) ===
    // Safe onboarding, breakable urns, torchlight, low-threat scout
    { type: 'torch',       x: 6 * 32,   y: 12 * 32 },
    { type: 'urn',         x: 8 * 32,   y: 14 * 32 },
    { type: 'hipokute',    x: 12 * 32,  y: 14 * 32 },
    { type: 'torch',       x: 18 * 32,  y: 10 * 32 },
    { type: 'urn',         x: 20 * 32,  y: 14 * 32 },
    { type: 'goblin',      x: 24 * 32,  y: 14 * 32 }, // Goblin Scout 1
    { type: 'torch',       x: 30 * 32,  y: 12 * 32 },

    // === ZONE 2: MAGISTEEL MINES (Tiles 36–75) ===
    // Mining scaffolds, ore veins, goblin brawlers, Campfire Checkpoint 1
    { type: 'campfire',    x: 37 * 32,  y: 14 * 32 }, // Rest Checkpoint 1 (Heals HP)
    { type: 'magisteel',   x: 41 * 32,  y: 14 * 32 }, // Ore Deposit 1
    { type: 'torch',       x: 44 * 32,  y: 5 * 32 },
    { type: 'goblin',      x: 47 * 32,  y: 5 * 32 },  // Goblin on scaffold
    { type: 'magisteel',   x: 52 * 32,  y: 14 * 32 }, // Ore Deposit 2
    { type: 'goblin',      x: 56 * 32,  y: 14 * 32 }, // Goblin Scout 2
    { type: 'torch',       x: 60 * 32,  y: 5 * 32 },
    { type: 'urn',         x: 63 * 32,  y: 14 * 32 },
    { type: 'magisteel',   x: 68 * 32,  y: 14 * 32 }, // Ore Deposit 3
    { type: 'goblin',      x: 72 * 32,  y: 14 * 32 }, // Goblin Brawler

    // === ZONE 3: HAZARD GROTTO & SPORE CAVERN (Tiles 76–120) ===
    // Stalactites, floor spikes, acid vents, archer snipers on vantage points, herb groves
    { type: 'torch',            x: 77 * 32,  y: 12 * 32 },
    { type: 'stalactite',       x: 82 * 32,  y: 2 * 32 },  // Ceiling Hazard
    { type: 'spikes',           x: 87 * 32,  y: 16 * 32 }, // Floor Spikes in Pit
    { type: 'goblin_archer',    x: 84 * 32,  y: 7 * 32 },  // Archer Sniper 1 (High vantage)
    { type: 'hipokute',         x: 93 * 32,  y: 14 * 32 }, // Herb Grove 1
    { type: 'spore_shroom',     x: 96 * 32,  y: 14 * 32 }, // Spore Shroom Hazard
    { type: 'torch',            x: 100 * 32, y: 7 * 32 },
    { type: 'stalactite',       x: 103 * 32, y: 2 * 32 },
    { type: 'acid_vent',        x: 107 * 32, y: 14 * 32 }, // Acid Vent
    { type: 'goblin_archer',    x: 112 * 32, y: 7 * 32 },  // Archer Sniper 2
    { type: 'goblin',           x: 115 * 32, y: 14 * 32 }, // Goblin Scout
    { type: 'chest',            x: 118 * 32, y: 14 * 32 }, // Hidden Treasure Chest 1

    // === ZONE 4: ANCIENT MONOLITH SANCTUARY (Tiles 121–145) ===
    // Pre-Boss calm sanctuary, lore monolith, full HP campfire restore
    { type: 'torch',       x: 123 * 32, y: 12 * 32 },
    { type: 'monolith',    x: 128 * 32, y: 14 * 32 }, // Ancient Runic Monolith
    { type: 'campfire',    x: 133 * 32, y: 14 * 32 }, // Rest Checkpoint 2 (Pre-Boss Save & Heal)
    { type: 'chest',       x: 138 * 32, y: 14 * 32 }, // Preparation Chest
    { type: 'hipokute',    x: 141 * 32, y: 14 * 32 }, // Emergency healing herb
    { type: 'torch',       x: 144 * 32, y: 10 * 32 },

    // === ZONE 5: TEMPEST SERPENT ARENA (Tiles 146–175) ===
    // Grand gladiator boss arena with 3 elevated dodge pillars, boss climax, victory rift
    { type: 'torch',       x: 148 * 32, y: 7 * 32 },
    { type: 'torch',       x: 170 * 32, y: 7 * 32 },
    { type: 'boss_serpent',x: 162 * 32, y: 12 * 32 }  // Boss: Tempest Serpent
  ]
};
