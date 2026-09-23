/* ============================================================
   BOTOCK 3D SCENE BUILDER
   ASSET REGISTRY
   ============================================================

   IMPORTANT:

   Initially model = null rakha gaya hai.

   Iska matlab:
   - application fallback 3D characters use karegi
   - app blank nahi hogi
   - tum baad mein GLB files add kar sakte ho

   Example:

   model: "/scene-builder/assets/characters/hero.glb"

   GLB character ke andar animations hon to:
   Idle
   Walk
   Run
   Jump
   Punch
   Kick
   Fall
   GetUp
   etc.

   Three.js GLTFLoader un animation clips ko read karega.
============================================================ */

export const ASSET_ROOT = "/scene-builder/assets";

/* ============================================================
   CHARACTERS
============================================================ */

export const CHARACTERS = [
  {
    id: "hero",
    name: "Hero",
    type: "character",
    color: "#7c3aed",

    // Replace with real model when available:
    // model: `${ASSET_ROOT}/characters/hero.glb`

    model: null,

    scale: 1,
    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      jump: "Jump",
      talk: "Talk",
      wave: "Wave",
      sit: "Sit",
      eat: "Eat",
      sleep: "Sleep",
      punch: "Punch",
      kick: "Kick",
      attack: "Attack",
      hit: "Hit",
      fall: "Fall",
      getup: "GetUp",
      block: "Block",
      push: "Push",
      counter: "Counter"
    }
  },

  {
    id: "soldier",
    name: "Soldier",
    type: "character",
    color: "#0ea5e9",

    model: null,

    scale: 1,

    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      jump: "Jump",
      talk: "Talk",
      wave: "Wave",
      sit: "Sit",
      eat: "Eat",
      sleep: "Sleep",
      punch: "Punch",
      kick: "Kick",
      attack: "Attack",
      hit: "Hit",
      fall: "Fall",
      getup: "GetUp",
      block: "Block",
      push: "Push",
      counter: "Counter"
    }
  },

  {
    id: "rival",
    name: "Rival",
    type: "character",
    color: "#ef4444",

    model: null,

    scale: 1,

    animations: {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      jump: "Jump",
      talk: "Talk",
      wave: "Wave",
      sit: "Sit",
      eat: "Eat",
      sleep: "Sleep",
      punch: "Punch",
      kick: "Kick",
      attack: "Attack",
      hit: "Hit",
      fall: "Fall",
      getup: "GetUp",
      block: "Block",
      push: "Push",
      counter: "Counter"
    }
  }
];

/* ============================================================
   BACKGROUNDS
============================================================ */

export const BACKGROUNDS = [
  {
    id: "studio",
    name: "Studio",
    color: "#101827",
    model: null
  },

  {
    id: "forest",
    name: "Forest",
    color: "#123524",
    model: null
  },

  {
    id: "city",
    name: "City",
    color: "#172033",
    model: null
  },

  {
    id: "room",
    name: "Room",
    color: "#3b2b20",
    model: null
  },

  {
    id: "desert",
    name: "Desert",
    color: "#a16207",
    model: null
  },

  {
    id: "night",
    name: "Night",
    color: "#020617",
    model: null
  }
];

/* ============================================================
   PROPS
============================================================ */

export const PROPS = [
  {
    id: "none",
    name: "None",
    model: null
  },

  {
    id: "chair",
    name: "Chair",
    model: null
  },

  {
    id: "table",
    name: "Table",
    model: null
  },

  {
    id: "crate",
    name: "Crate",
    model: null
  },

  {
    id: "barrel",
    name: "Barrel",
    model: null
  },

  {
    id: "car",
    name: "Car",
    model: null
  }
];

/* ============================================================
   BASIC ACTIONS
============================================================ */

export const SINGLE_ACTIONS = [
  {
    id: "idle",
    name: "Idle",
    duration: 3
  },

  {
    id: "walk",
    name: "Walk",
    duration: 4
  },

  {
    id: "run",
    name: "Run",
    duration: 4
  },

  {
    id: "jump",
    name: "Jump",
    duration: 2
  },

  {
    id: "talk",
    name: "Talk",
    duration: 4
  },

  {
    id: "wave",
    name: "Wave",
    duration: 2
  },

  {
    id: "sit",
    name: "Sit",
    duration: 4
  },

  {
    id: "eat",
    name: "Eat",
    duration: 4
  },

  {
    id: "sleep",
    name: "Sleep",
    duration: 5
  }
];

/* ============================================================
   PRE-AUTHORED TWO CHARACTER ACTIONS

   IMPORTANT:

   NO PHYSICS.

   These are deterministic animation timelines.

   Format:

   [
      actor,
      animation,
      start,
      end
   ]

   actor:
   a = Character A
   b = Character B

============================================================ */

export const DUO_ACTIONS = [

  /* ----------------------------------------------------------
     FIGHT COMBO
  ---------------------------------------------------------- */

  {
    id: "fight",
    name: "Fight Combo",
    duration: 6,

    choreography: [

      ["a", "idle", 0.0, 0.4],

      ["a", "punch", 0.4, 1.1],

      ["b", "hit", 0.9, 1.6],

      ["a", "kick", 1.4, 2.2],

      ["b", "hit", 2.0, 2.6],

      ["b", "fall", 2.5, 3.5],

      ["a", "idle", 3.4, 4.4],

      ["b", "getup", 3.5, 5.5],

      ["a", "idle", 5.0, 6.0],

      ["b", "idle", 5.5, 6.0]
    ]
  },

  /* ----------------------------------------------------------
     DUEL
  ---------------------------------------------------------- */

  {
    id: "duel",
    name: "Duel Counter",
    duration: 6,

    choreography: [

      ["a", "attack", 0.0, 0.8],

      ["b", "block", 0.5, 1.2],

      ["b", "counter", 1.0, 1.8],

      ["a", "hit", 1.7, 2.4],

      ["a", "attack", 2.3, 3.0],

      ["b", "block", 2.8, 3.5],

      ["b", "counter", 3.4, 4.1],

      ["a", "fall", 4.0, 5.0],

      ["b", "idle", 4.8, 6.0]
    ]
  },

  /* ----------------------------------------------------------
     PUSH
  ---------------------------------------------------------- */

  {
    id: "push",
    name: "Push & Fall",
    duration: 4,

    choreography: [

      ["a", "push", 0.0, 1.0],

      ["b", "hit", 0.7, 1.2],

      ["b", "fall", 1.1, 2.2],

      ["a", "idle", 2.0, 4.0]
    ]
  },

  /* ----------------------------------------------------------
     RACE
  ---------------------------------------------------------- */

  {
    id: "race",
    name: "Race",
    duration: 6,

    choreography: [

      ["a", "run", 0, 6],

      ["b", "run", 0, 6]
    ]
  },

  /* ----------------------------------------------------------
     CONVERSATION
  ---------------------------------------------------------- */

  {
    id: "conversation",
    name: "Conversation",
    duration: 6,

    choreography: [

      ["a", "talk", 0, 6],

      ["b", "talk", 0, 6]
    ]
  },

  /* ----------------------------------------------------------
     FRIENDLY WAVE
  ---------------------------------------------------------- */

  {
    id: "greeting",
    name: "Greeting",
    duration: 4,

    choreography: [

      ["a", "wave", 0, 2],

      ["b", "wave", 1, 3],

      ["a", "idle", 3, 4],

      ["b", "idle", 3, 4]
    ]
  }
];

/* ============================================================
   CAMERA PRESETS
============================================================ */

export const CAMERAS = [

  {
    id: "wide",
    name: "Wide Shot",
    position: [0, 5, 14]
  },

  {
    id: "medium",
    name: "Medium Shot",
    position: [5, 3.5, 9]
  },

  {
    id: "close",
    name: "Close Up",
    position: [4, 2.8, 5]
  },

  {
    id: "extreme",
    name: "Extreme Close",
    position: [2.5, 2.3, 3]
  },

  {
    id: "low",
    name: "Low Angle",
    position: [5, 1.2, 8]
  },

  {
    id: "high",
    name: "High Angle",
    position: [4, 7, 7]
  },

  {
    id: "side",
    name: "Side",
    position: [10, 3, 0]
  },

  {
    id: "top",
    name: "Top",
    position: [0, 12, 0.1]
  },

  {
    id: "over",
    name: "Over Shoulder",
    position: [-4, 3, 6]
  },

  {
    id: "action",
    name: "Action Tracking",
    position: [7, 3.5, 9]
  }
];

/* ============================================================
   EFFECTS
============================================================ */

export const EFFECTS = [

  {
    id: "none",
    name: "None"
  },

  {
    id: "impact",
    name: "Impact Flash"
  },

  {
    id: "shake",
    name: "Camera Shake"
  },

  {
    id: "slow",
    name: "Slow Motion"
  },

  {
    id: "flash",
    name: "White Flash"
  }
];

/* ============================================================
   HELPER FUNCTIONS
============================================================ */

export function getCharacter(id) {
  return CHARACTERS.find(character => character.id === id);
}

export function getBackground(id) {
  return BACKGROUNDS.find(background => background.id === id);
}

export function getProp(id) {
  return PROPS.find(prop => prop.id === id);
}

export function getCamera(id) {
  return CAMERAS.find(camera => camera.id === id);
}

export function getEffect(id) {
  return EFFECTS.find(effect => effect.id === id);
}

export function getAction(id) {

  return (
    SINGLE_ACTIONS.find(action => action.id === id) ||
    DUO_ACTIONS.find(action => action.id === id)
  );
}

/* ============================================================
   ASSET PATH HELPER
============================================================ */

export function getAssetPath(type, filename) {

  if (!filename) {
    return null;
  }

  return `${ASSET_ROOT}/${type}/${filename}`;
}