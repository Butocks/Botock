/* ============================================================
   BOTOCK 3D SCENE ENGINE
   ============================================================

   Responsibilities:

   - Three.js renderer
   - Camera
   - Lighting
   - GLB / GLTF loading
   - Character loading
   - AnimationMixer
   - Animation clip selection
   - Pre-authored choreography
   - Camera presets
   - Effects
   - Timeline
   - Recording
   - Fallback procedural characters

   IMPORTANT:

   Fight physics nahi hai.

   Fight = deterministic choreography.
============================================================ */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/* ============================================================
   ENGINE
============================================================ */

export class SceneEngine {

  constructor(container) {

    this.container = container;

    this.clock = new THREE.Clock();

    this.loader = new GLTFLoader();

    this.scene = new THREE.Scene();

    this.scene.background = new THREE.Color("#0b1020");

    /* --------------------------------------------------------
       CAMERA
    -------------------------------------------------------- */

    this.camera = new THREE.PerspectiveCamera(
      45,
      1,
      0.1,
      1000
    );

    this.camera.position.set(
      6,
      4,
      10
    );

    /* --------------------------------------------------------
       RENDERER
    -------------------------------------------------------- */

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      alpha: false
    });

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );

    this.renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    this.renderer.shadowMap.enabled = true;

    this.renderer.shadowMap.type =
      THREE.PCFSoftShadowMap;

    container.appendChild(
      this.renderer.domElement
    );

    /* --------------------------------------------------------
       CONTROLS
    -------------------------------------------------------- */

    this.controls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );

    this.controls.enableDamping = true;

    this.controls.dampingFactor = 0.08;

    this.controls.target.set(
      0,
      1.3,
      0
    );

    /* --------------------------------------------------------
       LIGHTING
    -------------------------------------------------------- */

    const hemisphere =
      new THREE.HemisphereLight(
        0xffffff,
        0x263248,
        2.5
      );

    this.scene.add(hemisphere);

    const key =
      new THREE.DirectionalLight(
        0xffffff,
        4
      );

    key.position.set(
      6,
      12,
      8
    );

    key.castShadow = true;

    key.shadow.mapSize.set(
      2048,
      2048
    );

    this.scene.add(key);

    const fill =
      new THREE.DirectionalLight(
        0x8bb8ff,
        1.5
      );

    fill.position.set(
      -8,
      5,
      3
    );

    this.scene.add(fill);

    /* --------------------------------------------------------
       FLOOR
    -------------------------------------------------------- */

    this.floor =
      new THREE.Mesh(
        new THREE.PlaneGeometry(
          80,
          80
        ),
        new THREE.MeshStandardMaterial({
          color: 0x1f2937,
          roughness: 0.95,
          metalness: 0.05
        })
      );

    this.floor.rotation.x =
      -Math.PI / 2;

    this.floor.receiveShadow = true;

    this.scene.add(this.floor);

    /* --------------------------------------------------------
       GRID
    -------------------------------------------------------- */

    this.grid =
      new THREE.GridHelper(
        40,
        40,
        0x334155,
        0x1e293b
      );

    this.grid.position.y =
      0.005;

    this.scene.add(this.grid);

    /* --------------------------------------------------------
       ENGINE STATE
    -------------------------------------------------------- */

    this.actors = {
      a: null,
      b: null
    };

    this.prop = null;

    this.backgroundModel = null;

    this.playing = false;

    this.time = 0;

    this.duration = 5;

    this.speed = 1;

    this.cameraMode = "medium";

    this.effect = "none";

    this.choreography = [];

    this.currentAction = "idle";

    this.recording = false;

    this.recordStopTimer = null;

    this.lastError = null;

    /* --------------------------------------------------------
       FALLBACK ACTORS
    -------------------------------------------------------- */

    this.actors.a =
      this.createFallbackCharacter(
        0x7c3aed,
        "A"
      );

    this.actors.b =
      this.createFallbackCharacter(
        0xef4444,
        "B"
      );

    this.actors.a.root.position.x =
      -1.8;

    this.actors.b.root.position.x =
      1.8;

    this.scene.add(
      this.actors.a.root
    );

    this.scene.add(
      this.actors.b.root
    );

    /* --------------------------------------------------------
       RESIZE
    -------------------------------------------------------- */

    this.resize();

    window.addEventListener(
      "resize",
      () => this.resize()
    );

    /* --------------------------------------------------------
       START LOOP
    -------------------------------------------------------- */

    this.animate();
  }

  /* ==========================================================
     FALLBACK CHARACTER
  ========================================================== */

  createFallbackCharacter(
    color,
    label
  ) {

    const root =
      new THREE.Group();

    const material =
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.55,
        metalness: 0.05
      });

    /* BODY */

    const body =
      new THREE.Mesh(
        new THREE.CapsuleGeometry(
          0.42,
          1.05,
          8,
          16
        ),
        material
      );

    body.position.y =
      1.25;

    body.castShadow = true;

    root.add(body);

    /* HEAD */

    const head =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.36,
          24,
          24
        ),
        material
      );

    head.position.y =
      2.18;

    head.castShadow = true;

    root.add(head);

    /* ARMS */

    const armGeometry =
      new THREE.CapsuleGeometry(
        0.12,
        0.72,
        6,
        10
      );

    const armL =
      new THREE.Mesh(
        armGeometry,
        material
      );

    const armR =
      new THREE.Mesh(
        armGeometry,
        material
      );

    armL.position.set(
      -0.56,
      1.45,
      0
    );

    armR.position.set(
      0.56,
      1.45,
      0
    );

    armL.castShadow = true;
    armR.castShadow = true;

    root.add(
      armL,
      armR
    );

    /* LEGS */

    const legGeometry =
      new THREE.CapsuleGeometry(
        0.14,
        0.85,
        6,
        10
      );

    const legL =
      new THREE.Mesh(
        legGeometry,
        material
      );

    const legR =
      new THREE.Mesh(
        legGeometry,
        material
      );

    legL.position.set(
      -0.22,
      0.48,
      0
    );

    legR.position.set(
      0.22,
      0.48,
      0
    );

    legL.castShadow = true;
    legR.castShadow = true;

    root.add(
      legL,
      legR
    );

    return {

      root,

      fallback: true,

      mixer: null,

      model: root,

      clips: [],

      actions: {},

      parts: {
        body,
        head,
        armL,
        armR,
        legL,
        legR
      },

      label
    };
  }

  /* ==========================================================
     LOAD GLTF / GLB
  ========================================================== */

  async loadGLTF(
    url
  ) {

    if (!url) {
      throw new Error(
        "No model URL provided."
      );
    }

    try {

      const gltf =
        await this.loader.loadAsync(
          url
        );

      return gltf;

    } catch (error) {

      console.error(
        "GLTF loading error:",
        error
      );

      throw error;
    }
  }

  /* ==========================================================
     LOAD CHARACTER
  ========================================================== */

  async loadCharacter(
    actorKey,
    character
  ) {

    const previous =
      this.actors[actorKey];

    if (
      !character ||
      !character.model
    ) {

      if (
        previous &&
        previous.fallback
      ) {

        previous.root.visible =
          true;

        return previous;
      }

      return previous;
    }

    try {

      const gltf =
        await this.loadGLTF(
          character.model
        );

      const model =
        gltf.scene;

      model.scale.setScalar(
        character.scale || 1
      );

      model.traverse(
        object => {

          if (
            object.isMesh
          ) {

            object.castShadow =
              true;

            object.receiveShadow =
              true;
          }
        }
      );

      const mixer =
        new THREE.AnimationMixer(
          model
        );

      const actions = {};

      for (
        const clip
        of gltf.animations
      ) {

        const name =
          clip.name.toLowerCase();

        actions[name] =
          mixer.clipAction(
            clip
          );
      }

      const actor = {

        root: model,

        model,

        fallback: false,

        mixer,

        clips:
          gltf.animations || [],

        actions,

        parts: {},

        label:
          actorKey.toUpperCase()
      };

      if (previous) {

        this.scene.remove(
          previous.root
        );

        if (
          previous.mixer
        ) {

          previous.mixer.stopAllAction();
        }
      }

      this.actors[
        actorKey
      ] = actor;

      this.scene.add(
        model
      );

      return actor;

    } catch (error) {

      console.warn(
        "Real character failed. Keeping fallback.",
        error
      );

      return previous;
    }
  }

  /* ==========================================================
     FIND ANIMATION CLIP
  ========================================================== */

  findClip(
    actor,
    requestedName
  ) {

    if (
      !actor ||
      !actor.clips
    ) {

      return null;
    }

    const target =
      String(
        requestedName || ""
      ).toLowerCase();

    return (
      actor.clips.find(
        clip =>
          clip.name
            .toLowerCase() ===
          target
      ) ||

      actor.clips.find(
        clip =>
          clip.name
            .toLowerCase()
            .includes(target)
      ) ||

      null
    );
  }

  /* ==========================================================
     PLAY REAL MODEL ANIMATION
  ========================================================== */

  playRealAnimation(
    actor,
    animationName,
    loop = true
  ) {

    if (
      !actor ||
      actor.fallback ||
      !actor.mixer
    ) {

      return false;
    }

    const clip =
      this.findClip(
        actor,
        animationName
      );

    if (!clip) {

      return false;
    }

    actor.mixer
      .stopAllAction();

    const action =
      actor.mixer
        .clipAction(
          clip
        );

    action.reset();

    action.enabled =
      true;

    action.clampWhenFinished =
      !loop;

    action.setLoop(
      loop
        ? THREE.LoopRepeat
        : THREE.LoopOnce,
      loop
        ? Infinity
        : 1
    );

    action.fadeIn(
      0.12
    );

    action.play();

    actor.currentClip =
      clip.name;

    return true;
  }

  /* ==========================================================
     BACKGROUND
  ========================================================== */

  async setBackground(
    background
  ) {

    if (
      this.backgroundModel
    ) {

      this.scene.remove(
        this.backgroundModel
      );

      this.backgroundModel =
        null;
    }

    if (!background) {
      return;
    }

    this.scene.background =
      new THREE.Color(
        background.color ||
        "#0b1020"
      );

    if (
      !background.model
    ) {

      return;
    }

    try {

      const gltf =
        await this.loadGLTF(
          background.model
        );

      this.backgroundModel =
        gltf.scene;

      this.backgroundModel
        .traverse(
          object => {

            if (
              object.isMesh
            ) {

              object.castShadow =
                true;

              object.receiveShadow =
                true;
            }
          }
        );

      this.scene.add(
        this.backgroundModel
      );

    } catch (error) {

      console.warn(
        "Background model could not load:",
        error
      );
    }
  }

  /* ==========================================================
     PROP
  ========================================================== */

  async setProp(
    prop
  ) {

    if (this.prop) {

      this.scene.remove(
        this.prop
      );

      this.prop =
        null;
    }

    if (
      !prop ||
      prop.id === "none"
    ) {

      return;
    }

    /* --------------------------------------------------------
       REAL GLB PROP
    -------------------------------------------------------- */

    if (prop.model) {

      try {

        const gltf =
          await this.loadGLTF(
            prop.model
          );

        this.prop =
          gltf.scene;

        this.prop.position.set(
          0,
          0,
          -1.4
        );

        this.scene.add(
          this.prop
        );

        return;

      } catch (error) {

        console.warn(
          "Prop GLB failed:",
          error
        );
      }
    }

    /* --------------------------------------------------------
       FALLBACK PROPS
    -------------------------------------------------------- */

    const group =
      new THREE.Group();

    const material =
      new THREE.MeshStandardMaterial({
        color: 0x92400e,
        roughness: 0.8
      });

    if (
      prop.id === "chair"
    ) {

      const seat =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            1.2,
            0.16,
            1.1
          ),
          material
        );

      seat.position.y =
        1;

      group.add(
        seat
      );

      const back =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            1.2,
            1.4,
            0.15
          ),
          material
        );

      back.position.set(
        0,
        1.65,
        -0.48
      );

      group.add(
        back
      );

      for (
        const x
        of [-0.45, 0.45]
      ) {

        for (
          const z
          of [-0.4, 0.4]
        ) {

          const leg =
            new THREE.Mesh(
              new THREE.BoxGeometry(
                0.12,
                1,
                0.12
              ),
              material
            );

          leg.position.set(
            x,
            0.5,
            z
          );

          group.add(
            leg
          );
        }
      }
    }

    else if (
      prop.id === "table"
    ) {

      const top =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            2.2,
            0.2,
            1.2
          ),
          material
        );

      top.position.y =
        1.25;

      group.add(
        top
      );

      for (
        const x
        of [-0.85, 0.85]
      ) {

        for (
          const z
          of [-0.4, 0.4]
        ) {

          const leg =
            new THREE.Mesh(
              new THREE.BoxGeometry(
                0.15,
                1.25,
                0.15
              ),
              material
            );

          leg.position.set(
            x,
            0.62,
            z
          );

          group.add(
            leg
          );
        }
      }
    }

    else if (
      prop.id === "crate"
    ) {

      const crate =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            1.2,
            1.2,
            1.2
          ),
          material
        );

      crate.position.y =
        0.6;

      group.add(
        crate
      );
    }

    else if (
      prop.id === "barrel"
    ) {

      const barrel =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.65,
            0.65,
            1.2,
            24
          ),
          material
        );

      barrel.position.y =
        0.6;

      group.add(
        barrel
      );
    }

    else if (
      prop.id === "car"
    ) {

      const carMaterial =
        new THREE.MeshStandardMaterial({
          color: 0x2563eb,
          roughness: 0.4
        });

      const body =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            3.5,
            0.7,
            1.7
          ),
          carMaterial
        );

      body.position.y =
        0.7;

      group.add(
        body
      );

      const top =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            1.8,
            0.6,
            1.5
          ),
          carMaterial
        );

      top.position.set(
        0,
        1.3,
        0
      );

      group.add(
        top
      );

      for (
        const x
        of [-1.25, 1.25]
      ) {

        for (
          const z
          of [-0.75, 0.75]
        ) {

          const wheel =
            new THREE.Mesh(
              new THREE.CylinderGeometry(
                0.32,
                0.32,
                0.22,
                20
              ),
              new THREE.MeshStandardMaterial({
                color: 0x111111
              })
            );

          wheel.rotation.x =
            Math.PI / 2;

          wheel.position.set(
            x,
            0.38,
            z
          );

          group.add(
            wheel
          );
        }
      }
    }

    group.position.set(
      0,
      0,
      -1.5
    );

    group.traverse(
      object => {

        if (
          object.isMesh
        ) {

          object.castShadow =
            true;

          object.receiveShadow =
            true;
        }
      }
    );

    this.prop =
      group;

    this.scene.add(
      group
    );
  }

  /* ==========================================================
     LOAD CHARACTERS FROM REGISTRY
  ========================================================== */

  async configureCharacters(
    characterA,
    characterB
  ) {

    await Promise.all([
      this.loadCharacter(
        "a",
        characterA
      ),

      this.loadCharacter(
        "b",
        characterB
      )
    ]);

    this.resetActors();
  }

  /* ==========================================================
     RESET
  ========================================================== */

  resetActors() {

    const actorA =
      this.actors.a;

    const actorB =
      this.actors.b;

    if (actorA) {

      actorA.root.visible =
        true;

      actorA.root.position.set(
        -1.8,
        0,
        0
      );

      actorA.root.rotation.set(
        0,
        0,
        0
      );

      actorA.root.scale.set(
        1,
        1,
        1
      );

      if (
        actorA.fallback
      ) {

        Object.values(
          actorA.parts
        ).forEach(
          part =>
            part.rotation.set(
              0,
              0,
              0
            )
        );
      }
    }

    if (actorB) {

      actorB.root.visible =
        true;

      actorB.root.position.set(
        1.8,
        0,
        0
      );

      actorB.root.rotation.set(
        0,
        0,
        0
      );

      actorB.root.scale.set(
        1,
        1,
        1
      );

      if (
        actorB.fallback
      ) {

        Object.values(
          actorB.parts
        ).forEach(
          part =>
            part.rotation.set(
              0,
              0,
              0
            )
        );
      }
    }
  }

  /* ==========================================================
     SET ACTION
  ========================================================== */

  setAction(
    action,
    choreography,
    duration
  ) {

    this.currentAction =
      action || "idle";

    this.choreography =
      choreography || [];

    this.duration =
      Number(duration) || 5;

    this.time =
      0;

    this.resetActors();

    /* Stop previous real animations */

    for (
      const key
      of ["a", "b"]
    ) {

      const actor =
        this.actors[key];

      if (
        actor &&
        actor.mixer
      ) {

        actor.mixer
          .stopAllAction();
      }
    }
  }

  /* ==========================================================
     FALLBACK ANIMATION SYSTEM
  ========================================================== */

  applyFallbackMotion(
    actor,
    motion,
    elapsed
  ) {

    if (
      !actor ||
      !actor.fallback
    ) {

      return;
    }

    const root =
      actor.root;

    const p =
      actor.parts;

    const duration =
      Math.max(
        0.001,
        this.duration
      );

    const normalized =
      Math.max(
        0,
        Math.min(
          1,
          elapsed / duration
        )
      );

    /* --------------------------------------------------------
       IDLE
    -------------------------------------------------------- */

    if (
      motion === "idle"
    ) {

      root.position.y =
        0;

      root.rotation.z =
        0;

      p.armL.rotation.x =
        Math.sin(elapsed * 2) *
        0.03;

      p.armR.rotation.x =
        -Math.sin(elapsed * 2) *
        0.03;

      return;
    }

    /* --------------------------------------------------------
       WALK
    -------------------------------------------------------- */

    if (
      motion === "walk"
    ) {

      const swing =
        Math.sin(
          elapsed * 7
        );

      p.armL.rotation.x =
        swing * 0.7;

      p.armR.rotation.x =
        -swing * 0.7;

      p.legL.rotation.x =
        -swing * 0.8;

      p.legR.rotation.x =
        swing * 0.8;

      root.position.z =
        -elapsed * 0.7;

      return;
    }

    /* --------------------------------------------------------
       RUN
    -------------------------------------------------------- */

    if (
      motion === "run"
    ) {

      const swing =
        Math.sin(
          elapsed * 11
        );

      p.armL.rotation.x =
        swing * 1.0;

      p.armR.rotation.x =
        -swing * 1.0;

      p.legL.rotation.x =
        -swing * 1.15;

      p.legR.rotation.x =
        swing * 1.15;

      root.position.z =
        -elapsed * 1.7;

      return;
    }

    /* --------------------------------------------------------
       JUMP
    -------------------------------------------------------- */

    if (
      motion === "jump"
    ) {

      const jump =
        Math.sin(
          Math.min(
            1,
            normalized
          ) * Math.PI
        );

      root.position.y =
        jump * 2.0;

      p.armL.rotation.z =
        -0.5;

      p.armR.rotation.z =
        0.5;

      return;
    }

    /* --------------------------------------------------------
       TALK
    -------------------------------------------------------- */

    if (
      motion === "talk"
    ) {

      p.armL.rotation.z =
        Math.sin(
          elapsed * 6
        ) * 0.2;

      p.armR.rotation.z =
        Math.sin(
          elapsed * 7
        ) * -0.2;

      root.rotation.y =
        Math.sin(
          elapsed * 2
        ) * 0.08;

      return;
    }

    /* --------------------------------------------------------
       WAVE
    -------------------------------------------------------- */

    if (
      motion === "wave"
    ) {

      p.armR.rotation.z =
        -0.8 +
        Math.sin(
          elapsed * 8
        ) * 0.45;

      return;
    }

    /* --------------------------------------------------------
       SIT
    -------------------------------------------------------- */

    if (
      motion === "sit"
    ) {

      root.position.y =
        0;

      p.legL.rotation.x =
        -1.0;

      p.legR.rotation.x =
        -1.0;

      return;
    }

    /* --------------------------------------------------------
       EAT
    -------------------------------------------------------- */

    if (
      motion === "eat"
    ) {

      root.rotation.x =
        Math.sin(
          elapsed * 3
        ) * 0.15;

      return;
    }

    /* --------------------------------------------------------
       SLEEP
    -------------------------------------------------------- */

    if (
      motion === "sleep"
    ) {

      root.rotation.z =
        Math.PI / 2;

      return;
    }

    /* --------------------------------------------------------
       PUNCH
    -------------------------------------------------------- */

    if (
      motion === "punch"
    ) {

      const attack =
        Math.sin(
          normalized * Math.PI
        );

      p.armR.rotation.x =
        -attack * 1.5;

      p.armR.rotation.z =
        -attack * 0.45;

      return;
    }

    /* --------------------------------------------------------
       KICK
    -------------------------------------------------------- */

    if (
      motion === "kick"
    ) {

      const kick =
        Math.sin(
          normalized * Math.PI
        );

      p.legR.rotation.x =
        -kick * 1.5;

      return;
    }

    /* --------------------------------------------------------
       ATTACK
    -------------------------------------------------------- */

    if (
      motion === "attack"
    ) {

      const attack =
        Math.sin(
          normalized * Math.PI
        );

      p.armR.rotation.x =
        -attack * 1.2;

      root.position.z =
        -attack * 0.3;

      return;
    }

    /* --------------------------------------------------------
       BLOCK
    -------------------------------------------------------- */

    if (
      motion === "block"
    ) {

      p.armL.rotation.x =
        -1.2;

      p.armR.rotation.x =
        -1.2;

      return;
    }

    /* --------------------------------------------------------
       HIT
    -------------------------------------------------------- */

    if (
      motion === "hit"
    ) {

      const impact =
        Math.sin(
          normalized * Math.PI
        );

      root.rotation.z =
        impact * 0.65;

      root.position.x +=
        impact * 0.3;

      root.position.z +=
        impact * 0.3;

      return;
    }

    /* --------------------------------------------------------
       COUNTER
    -------------------------------------------------------- */

    if (
      motion === "counter"
    ) {

      const attack =
        Math.sin(
          normalized * Math.PI
        );

      p.armL.rotation.x =
        -attack * 1.2;

      root.rotation.y =
        attack * 0.35;

      return;
    }

    /* --------------------------------------------------------
       FALL
    -------------------------------------------------------- */

    if (
      motion === "fall"
    ) {

      root.rotation.z =
        -normalized *
        Math.PI /
        2;

      root.position.y =
        Math.sin(
          normalized * Math.PI
        ) * 0.15;

      return;
    }

    /* --------------------------------------------------------
       GET UP
    -------------------------------------------------------- */

    if (
      motion === "getup"
    ) {

      root.rotation.z =
        -(1 - normalized) *
        Math.PI /
        2;

      return;
    }

    /* --------------------------------------------------------
       PUSH
    -------------------------------------------------------- */

    if (
      motion === "push"
    ) {

      p.armR.rotation.x =
        -0.9;

      root.rotation.y =
        -0.15;

      return;
    }
  }

  /* ==========================================================
     PLAY MOTION
  ========================================================== */

  playMotion(
    actorKey,
    motion,
    elapsed
  ) {

    const actor =
      this.actors[actorKey];

    if (!actor) {
      return;
    }

    /* Real GLB */

    if (
      !actor.fallback
    ) {

      const animationName =
        motion;

      if (
        actor.currentMotion !==
        animationName
      ) {

        this.playRealAnimation(
          actor,
          animationName,
          true
        );

        actor.currentMotion =
          animationName;
      }

      return;
    }

    /* Fallback */

    this.applyFallbackMotion(
      actor,
      motion,
      elapsed
    );
  }

  /* ==========================================================
     CHOREOGRAPHY UPDATE
  ========================================================== */

  updateChoreography() {

    if (
      !this.choreography ||
      !this.choreography.length
    ) {

      this.playMotion(
        "a",
        this.currentAction,
        this.time
      );

      return;
    }

    for (
      const item
      of this.choreography
    ) {

      const actorKey =
        item[0];

      const motion =
        item[1];

      const start =
        Number(item[2]);

      const end =
        Number(item[3]);

      if (
        this.time >= start &&
        this.time <= end
      ) {

        this.playMotion(
          actorKey,
          motion,
          this.time - start
        );
      }
    }
  }

  /* ==========================================================
     CAMERA
  ========================================================== */

  updateCamera() {

    const a =
      this.actors.a
        ?.root
        ?.position ||
      new THREE.Vector3(
        -1.8,
        0,
        0
      );

    const b =
      this.actors.b
        ?.root
        ?.position ||
      new THREE.Vector3(
        1.8,
        0,
        0
      );

    const midpoint =
      new THREE.Vector3()
        .addVectors(
          a,
          b
        )
        .multiplyScalar(
          0.5
        );

    midpoint.y =
      1.3;

    const presets = {

      wide: [
        0,
        5,
        14
      ],

      medium: [
        5,
        3.5,
        9
      ],

      close: [
        4,
        2.8,
        5
      ],

      extreme: [
        2.5,
        2.3,
        3
      ],

      low: [
        5,
        1.2,
        8
      ],

      high: [
        4,
        7,
        7
      ],

      side: [
        10,
        3,
        0
      ],

      top: [
        0,
        12,
        0.1
      ],

      over: [
        -4,
        3,
        6
      ],

      action: [
        7,
        3.5,
        9
      ]
    };

    const preset =
      presets[
        this.cameraMode
      ] ||
      presets.medium;

    const desired =
      new THREE.Vector3(
        preset[0],
        preset[1],
        preset[2]
      );

    desired.add(
      midpoint
    );

    this.camera.position.lerp(
      desired,
      0.08
    );

    this.controls.target.lerp(
      midpoint,
      0.08
    );
  }

  /* ==========================================================
     EFFECTS
  ========================================================== */

  updateEffects() {

    const canvas =
      this.renderer.domElement;

    canvas.style.filter =
      "";

    if (
      this.effect ===
      "impact"
    ) {

      const impactWindow =
        this.time < 1.2;

      if (impactWindow) {

        canvas.style.filter =
          "brightness(1.7) contrast(1.25)";
      }
    }

    if (
      this.effect ===
      "flash"
    ) {

      if (
        this.time < 0.25
      ) {

        canvas.style.filter =
          "brightness(3)";
      }
    }

    if (
      this.effect ===
      "shake"
    ) {

      if (
        this.playing
      ) {

        this.camera.position.x +=
          (Math.random() - 0.5) *
          0.08;

        this.camera.position.y +=
          (Math.random() - 0.5) *
          0.08;
      }
    }
  }

  /* ==========================================================
     UPDATE
  ========================================================== */

  update(
    delta
  ) {

    if (
      this.playing
    ) {

      this.time +=
        delta *
        this.speed;

      if (
        this.time >=
        this.duration
      ) {

        this.time =
          this.duration;

        this.playing =
          false;
      }
    }

    this.updateChoreography();

    /* Update real model mixers */

    for (
      const key
      of ["a", "b"]
    ) {

      const actor =
        this.actors[key];

      if (
        actor &&
        actor.mixer
      ) {

        actor.mixer.update(
          delta *
          this.speed
        );
      }
    }

    this.updateCamera();

    this.updateEffects();

    if (
      this.onTimeChange
    ) {

      this.onTimeChange(
        this.time,
        this.duration
      );
    }
  }

  /* ==========================================================
     CONTROLS
  ========================================================== */

  play() {

    this.playing =
      true;
  }

  pause() {

    this.playing =
      false;
  }

  restart() {

    this.time =
      0;

    this.resetActors();

    this.playing =
      true;
  }

  seek(
    time
  ) {

    this.time =
      Math.max(
        0,
        Math.min(
          this.duration,
          Number(time) || 0
        )
      );
  }

  setSpeed(
    speed
  ) {

    this.speed =
      Number(speed) || 1;
  }

  /* ==========================================================
     RESIZE
  ========================================================== */

  resize() {

    const width =
      this.container
        .clientWidth ||
      800;

    const height =
      this.container
        .clientHeight ||
      500;

    this.camera.aspect =
      width /
      height;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(
      width,
      height,
      false
    );
  }

  /* ==========================================================
     RECORD CURRENT SCENE
  ========================================================== */

  async record(
    duration = this.duration,
    fps = 30
  ) {

    if (
      !this.renderer
        .domElement
        .captureStream
    ) {

      throw new Error(
        "This browser does not support canvas recording."
      );
    }

    const canvas =
      this.renderer.domElement;

    const stream =
      canvas.captureStream(
        fps
      );

    let mimeType =
      "video/webm";

    if (
      MediaRecorder.isTypeSupported(
        "video/webm;codecs=vp9"
      )
    ) {

      mimeType =
        "video/webm;codecs=vp9";
    }

    else if (
      MediaRecorder.isTypeSupported(
        "video/webm;codecs=vp8"
      )
    ) {

      mimeType =
        "video/webm;codecs=vp8";
    }

    const recorder =
      new MediaRecorder(
        stream,
        {
          mimeType
        }
      );

    const chunks =
      [];

    recorder.ondataavailable =
      event => {

        if (
          event.data &&
          event.data.size
        ) {

          chunks.push(
            event.data
          );
        }
      };

    const result =
      new Promise(
        resolve => {

          recorder.onstop =
            () => {

              resolve(
                new Blob(
                  chunks,
                  {
                    type:
                      mimeType
                  }
                )
              );
            };
        }
      );

    this.restart();

    recorder.start(
      200
    );

    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          duration *
          1000
        )
    );

    this.pause();

    recorder.stop();

    return result;
  }

  /* ==========================================================
     DISPOSE
  ========================================================== */

  dispose() {

    this.playing =
      false;

    if (
      this.controls
    ) {

      this.controls.dispose();
    }

    if (
      this.renderer
    ) {

      this.renderer.dispose();
    }

    this.container.innerHTML =
      "";
  }

  /* ==========================================================
     RENDER LOOP
  ========================================================== */

  animate() {

    requestAnimationFrame(
      () =>
        this.animate()
    );

    const delta =
      Math.min(
        0.05,
        this.clock.getDelta()
      );

    this.update(
      delta
    );

    this.controls.update();

    this.renderer.render(
      this.scene,
      this.camera
    );
  }
}