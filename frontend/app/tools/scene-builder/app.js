/* ============================================================
   BOTOCK 3D SCENE BUILDER
   APPLICATION CONTROLLER
============================================================ */

import {
  CHARACTERS,
  BACKGROUNDS,
  PROPS,
  SINGLE_ACTIONS,
  DUO_ACTIONS,
  CAMERAS,
  EFFECTS,
  getCharacter,
  getBackground,
  getProp
} from "./asset-registry.js";

import {
  SceneEngine
} from "./scene-engine.js";

/* ============================================================
   ROOT
============================================================ */

const root =
  document.getElementById(
    "botock-scene-builder"
  );

if (!root) {

  throw new Error(
    "Scene Builder root not found."
  );
}

/* ============================================================
   GLOBAL STATE
============================================================ */

const state = {

  scenes: [],

  activeSceneId: null,

  projectName:
    "Botock 3D Project",

  dirty: false,

  exporting: false
};

/* ============================================================
   HELPERS
============================================================ */

function uid(
  prefix = "scene"
) {

  return (
    prefix +
    "_" +
    Math.random()
      .toString(36)
      .slice(2) +
    "_" +
    Date.now()
  );
}

function escapeHTML(
  value
) {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}

function el(
  selector
) {

  return document.querySelector(
    selector
  );
}

function all(
  selector
) {

  return [
    ...document.querySelectorAll(
      selector
    )
  ];
}

function downloadBlob(
  blob,
  filename
) {

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href =
    url;

  link.download =
    filename;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  setTimeout(
    () =>
      URL.revokeObjectURL(
        url
      ),
    5000
  );
}

/* ============================================================
   BUILD UI
============================================================ */

root.innerHTML = `

<div class="sb-shell">

  <header class="sb-header">

    <div>

      <div class="sb-eyebrow">
        BOTOCK 3D CREATOR
      </div>

      <h1 class="sb-title">
        3D Scene Studio
      </h1>

      <p class="sb-subtitle">
        Build characters, actions, fights, cameras and multiple scenes.
      </p>

    </div>

    <div class="sb-header-actions">

      <button
        id="sb-save-project"
        class="sb-button"
      >
        Save Project
      </button>

      <button
        id="sb-load-project"
        class="sb-button"
      >
        Load Project
      </button>

      <button
        id="sb-export"
        class="sb-button sb-primary"
      >
        Export Video
      </button>

      <input
        id="sb-project-file"
        type="file"
        accept=".json,application/json"
        hidden
      />

    </div>

  </header>


  <div class="sb-layout">

    <!-- LEFT CONTROLS -->

    <aside class="sb-sidebar">

      <section class="sb-panel">

        <div class="sb-panel-title">
          Characters
        </div>

        <label>
          Character A

          <select
            id="sb-character-a"
            class="sb-select"
          ></select>

        </label>

        <label>
          Character B

          <select
            id="sb-character-b"
            class="sb-select"
          ></select>

        </label>

      </section>


      <section class="sb-panel">

        <div class="sb-panel-title">
          Environment
        </div>

        <label>
          Background

          <select
            id="sb-background"
            class="sb-select"
          ></select>

        </label>

        <label>
          Prop / Accessory

          <select
            id="sb-prop"
            class="sb-select"
          ></select>

        </label>

      </section>


      <section class="sb-panel">

        <div class="sb-panel-title">
          Action
        </div>

        <label>
          Action / Sequence

          <select
            id="sb-action"
            class="sb-select"
          ></select>

        </label>

        <div
          id="sb-action-description"
          class="sb-description"
        ></div>

      </section>


      <section class="sb-panel">

        <div class="sb-panel-title">
          Camera
        </div>

        <label>
          Camera Angle

          <select
            id="sb-camera"
            class="sb-select"
          ></select>

        </label>

      </section>


      <section class="sb-panel">

        <div class="sb-panel-title">
          Effects
        </div>

        <label>
          Scene Effect

          <select
            id="sb-effect"
            class="sb-select"
          ></select>

        </label>

      </section>


      <section class="sb-panel">

        <div class="sb-panel-title">
          Timing
        </div>

        <div class="sb-two">

          <label>
            Duration

            <input
              id="sb-duration"
              class="sb-input"
              type="number"
              min="0.5"
              max="60"
              step="0.5"
              value="5"
            />

          </label>

          <label>
            Speed

            <select
              id="sb-speed"
              class="sb-select"
            >

              <option value="0.25">
                0.25x
              </option>

              <option value="0.5">
                0.5x
              </option>

              <option value="0.75">
                0.75x
              </option>

              <option value="1" selected>
                1x
              </option>

              <option value="1.25">
                1.25x
              </option>

              <option value="1.5">
                1.5x
              </option>

              <option value="2">
                2x
              </option>

            </select>

          </label>

        </div>

      </section>


      <section class="sb-panel">

        <div class="sb-panel-title">
          Scene
        </div>

        <div class="sb-button-row">

          <button
            id="sb-new"
            class="sb-button"
          >
            New
          </button>

          <button
            id="sb-add"
            class="sb-button sb-primary"
          >
            Add Scene
          </button>

        </div>

        <div class="sb-button-row">

          <button
            id="sb-duplicate"
            class="sb-button"
          >
            Duplicate
          </button>

          <button
            id="sb-delete"
            class="sb-button sb-danger"
          >
            Delete
          </button>

        </div>

      </section>

    </aside>


    <!-- CENTER -->

    <main class="sb-main">

      <section class="sb-stage">

        <div class="sb-stage-toolbar">

          <div>

            <strong
              id="sb-current-scene"
            >
              New Scene
            </strong>

            <span
              id="sb-time"
              class="sb-time"
            >
              0.00 / 5.00
            </span>

          </div>

          <div class="sb-stage-actions">

            <button
              id="sb-restart"
              class="sb-icon-button"
              title="Restart"
            >
              ↺
            </button>

            <button
              id="sb-play"
              class="sb-icon-button sb-play"
              title="Play"
            >
              ▶
            </button>

            <button
              id="sb-pause"
              class="sb-icon-button"
              title="Pause"
            >
              ❚❚
            </button>

          </div>

        </div>

        <div
          id="sb-canvas"
          class="sb-canvas"
        ></div>

      </section>


      <!-- TIMELINE -->

      <section class="sb-timeline">

        <div class="sb-timeline-header">

          <div>

            <strong>
              Scene Timeline
            </strong>

            <span>
              Multiple scenes can be exported together.
            </span>

          </div>

          <div
            id="sb-export-status"
            class="sb-export-status"
          ></div>

        </div>

        <div
          id="sb-timeline-list"
          class="sb-timeline-list"
        ></div>

      </section>


      <!-- ACTION LIBRARY -->

      <section class="sb-action-library">

        <div class="sb-panel-title">
          Pre-Authored Actions
        </div>

        <div
          id="sb-action-cards"
          class="sb-action-cards"
        ></div>

      </section>

    </main>

  </div>

</div>

`;

/* ============================================================
   ENGINE
============================================================ */

const engine =
  new SceneEngine(
    el("#sb-canvas")
  );

/* ============================================================
   UI STYLES
============================================================ */

const style =
  document.createElement(
    "style"
  );

style.textContent = `

* {
  box-sizing: border-box;
}

.sb-shell {
  min-height: 100vh;
  padding: 24px;
  color: #e5e7eb;
  background:
    radial-gradient(
      circle at 50% 0%,
      #18213a 0%,
      #070b14 48%,
      #04060b 100%
    );
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    sans-serif;
}

.sb-header {
  max-width: 1700px;
  margin: 0 auto 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
}

.sb-eyebrow {
  color: #a78bfa;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .2em;
}

.sb-title {
  margin: 4px 0 0;
  font-size: 30px;
  font-weight: 900;
  letter-spacing: -.03em;
}

.sb-subtitle {
  margin: 5px 0 0;
  color: #94a3b8;
  font-size: 13px;
}

.sb-header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.sb-layout {
  max-width: 1700px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 18px;
}

.sb-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sb-panel {
  padding: 14px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 14px;
  background: rgba(12,18,32,.9);
  box-shadow:
    0 10px 40px rgba(0,0,0,.2);
}

.sb-panel-title {
  margin-bottom: 12px;
  color: #c4b5fd;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .12em;
}

.sb-panel label {
  display: block;
  margin-bottom: 10px;
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 700;
}

.sb-panel label:last-child {
  margin-bottom: 0;
}

.sb-select,
.sb-input {
  width: 100%;
  margin-top: 6px;
  padding: 10px 11px;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 9px;
  outline: none;
  color: #f8fafc;
  background: #070b14;
  font-size: 12px;
}

.sb-select:focus,
.sb-input:focus {
  border-color: #8b5cf6;
}

.sb-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.sb-button-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
  margin-top: 7px;
}

.sb-button {
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 9px;
  padding: 9px 12px;
  color: #e2e8f0;
  background: #111827;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  transition: .15s ease;
}

.sb-button:hover {
  border-color: rgba(139,92,246,.55);
  background: #182235;
  transform: translateY(-1px);
}

.sb-primary {
  border-color: #8b5cf6;
  color: white;
  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #4f46e5
    );
}

.sb-danger {
  color: #fca5a5;
}

.sb-main {
  min-width: 0;
}

.sb-stage {
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 16px;
  background: #000;
  box-shadow:
    0 20px 70px rgba(0,0,0,.4);
}

.sb-stage-toolbar {
  min-height: 54px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0c1220;
  border-bottom: 1px solid rgba(255,255,255,.08);
}

.sb-time {
  margin-left: 12px;
  color: #64748b;
  font-size: 11px;
}

.sb-stage-actions {
  display: flex;
  gap: 7px;
}

.sb-icon-button {
  width: 38px;
  height: 34px;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 9px;
  color: #cbd5e1;
  background: #111827;
  cursor: pointer;
}

.sb-icon-button:hover {
  background: #1e293b;
}

.sb-play {
  border-color: #8b5cf6;
  color: white;
  background: #6d28d9;
}

.sb-canvas {
  height: min(66vh, 680px);
  min-height: 500px;
  width: 100%;
  background: #000;
}

.sb-canvas canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.sb-timeline {
  margin-top: 14px;
  padding: 15px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 14px;
  background: #0c1220;
}

.sb-timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sb-timeline-header strong {
  display: block;
  font-size: 13px;
}

.sb-timeline-header span {
  display: block;
  margin-top: 3px;
  color: #64748b;
  font-size: 10px;
}

.sb-export-status {
  color: #34d399;
  font-size: 11px;
}

.sb-timeline-list {
  display: flex;
  gap: 9px;
  margin-top: 12px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.sb-scene-card {
  min-width: 170px;
  padding: 12px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 11px;
  background: #111827;
  color: #cbd5e1;
  cursor: pointer;
  text-align: left;
}

.sb-scene-card:hover {
  border-color: rgba(139,92,246,.5);
}

.sb-scene-card.active {
  border-color: #8b5cf6;
  background: #1b1235;
}

.sb-scene-number {
  color: #64748b;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
}

.sb-scene-name {
  margin-top: 5px;
  color: white;
  font-size: 12px;
  font-weight: 800;
}

.sb-scene-meta {
  margin-top: 5px;
  color: #64748b;
  font-size: 10px;
}

.sb-action-library {
  margin-top: 14px;
  padding: 15px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 14px;
  background: #0c1220;
}

.sb-action-cards {
  display: grid;
  grid-template-columns:
    repeat(
      auto-fill,
      minmax(130px, 1fr)
    );
  gap: 8px;
}

.sb-action-card {
  padding: 11px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px;
  color: #cbd5e1;
  background: #111827;
  cursor: pointer;
}

.sb-action-card:hover {
  border-color: #8b5cf6;
  background: #17132a;
}

.sb-action-card strong {
  display: block;
  color: white;
  font-size: 11px;
}

.sb-action-card small {
  display: block;
  margin-top: 4px;
  color: #64748b;
  font-size: 9px;
}

.sb-description {
  margin-top: 8px;
  padding: 9px;
  border-radius: 8px;
  color: #94a3b8;
  background: rgba(255,255,255,.03);
  font-size: 10px;
  line-height: 1.5;
}

@media(max-width: 950px) {

  .sb-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .sb-layout {
    grid-template-columns: 1fr;
  }

  .sb-sidebar {
    display: grid;
    grid-template-columns:
      repeat(
        auto-fit,
        minmax(240px,1fr)
      );
  }

  .sb-canvas {
    min-height: 420px;
  }
}

@media(max-width: 600px) {

  .sb-shell {
    padding: 10px;
  }

  .sb-title {
    font-size: 24px;
  }

  .sb-sidebar {
    display: flex;
  }

  .sb-canvas {
    min-height: 350px;
  }
}

`;

document.head.appendChild(
  style
);

/* ============================================================
   ELEMENT REFERENCES
============================================================ */

const characterA =
  el("#sb-character-a");

const characterB =
  el("#sb-character-b");

const background =
  el("#sb-background");

const prop =
  el("#sb-prop");

const action =
  el("#sb-action");

const camera =
  el("#sb-camera");

const effect =
  el("#sb-effect");

const duration =
  el("#sb-duration");

const speed =
  el("#sb-speed");

const timeline =
  el("#sb-timeline-list");

const actionDescription =
  el("#sb-action-description");

const currentScene =
  el("#sb-current-scene");

const timeDisplay =
  el("#sb-time");

const exportStatus =
  el("#sb-export-status");

/* ============================================================
   OPTION BUILDERS
============================================================ */

function fillSelect(
  select,
  items
) {

  select.innerHTML =
    items
      .map(
        item => {

          const value =
            item.id;

          const label =
            item.name;

          return `
            <option value="${escapeHTML(value)}">
              ${escapeHTML(label)}
            </option>
          `;
        }
      )
      .join("");
}

function fillCamera() {

  camera.innerHTML =
    CAMERAS
      .map(
        item => `
          <option value="${item.id}">
            ${escapeHTML(item.name)}
          </option>
        `
      )
      .join("");
}

function fillEffects() {

  effect.innerHTML =
    EFFECTS
      .map(
        item => `
          <option value="${item.id}">
            ${escapeHTML(item.name)}
          </option>
        `
      )
      .join("");
}

function fillActions() {

  const basic =
    SINGLE_ACTIONS
      .map(
        item => `
          <option value="${item.id}">
            Basic: ${escapeHTML(item.name)}
          </option>
        `
      )
      .join("");

  const duo =
    DUO_ACTIONS
      .map(
        item => `
          <option value="${item.id}">
            Sequence: ${escapeHTML(item.name)}
          </option>
        `
      )
      .join("");

  action.innerHTML =
    `
      <optgroup label="Basic Actions">
        ${basic}
      </optgroup>

      <optgroup label="Two Character Choreography">
        ${duo}
      </optgroup>
    `;
}

/* ============================================================
   INITIAL OPTIONS
============================================================ */

fillSelect(
  characterA,
  CHARACTERS
);

fillSelect(
  characterB,
  CHARACTERS
);

fillSelect(
  background,
  BACKGROUNDS
);

fillSelect(
  prop,
  PROPS
);

fillActions();

fillCamera();

fillEffects();

characterA.value =
  "hero";

characterB.value =
  "rival";

background.value =
  "studio";

prop.value =
  "chair";

action.value =
  "idle";

camera.value =
  "medium";

effect.value =
  "none";

/* ============================================================
   CURRENT SCENE
============================================================ */

function createSceneFromUI() {

  const selectedAction =
    action.value;

  const duo =
    DUO_ACTIONS.find(
      item =>
        item.id ===
        selectedAction
    );

  const basic =
    SINGLE_ACTIONS.find(
      item =>
        item.id ===
        selectedAction
    );

  return {

    id:
      uid(),

    characterA:
      characterA.value,

    characterB:
      characterB.value,

    background:
      background.value,

    prop:
      prop.value,

    action:
      selectedAction,

    actionLabel:
      duo?.name ||
      basic?.name ||
      selectedAction,

    camera:
      camera.value,

    effect:
      effect.value,

    duration:
      Number(
        duration.value
      ) || 5,

    speed:
      Number(
        speed.value
      ) || 1,

    choreography:
      duo?.choreography ||
      [],

    createdAt:
      new Date().toISOString()
  };
}

/* ============================================================
   APPLY SCENE
============================================================ */

async function applyScene(
  sceneData
) {

  if (!sceneData) {
    return;
  }

  const charA =
    getCharacter(
      sceneData.characterA
    );

  const charB =
    getCharacter(
      sceneData.characterB
    );

  const bg =
    getBackground(
      sceneData.background
    );

  const selectedProp =
    getProp(
      sceneData.prop
    );

  await engine.configureCharacters(
    charA,
    charB
  );

  await engine.setBackground(
    bg
  );

  await engine.setProp(
    selectedProp
  );

  engine.cameraMode =
    sceneData.camera ||
    "medium";

  engine.effect =
    sceneData.effect ||
    "none";

  engine.setSpeed(
    sceneData.speed ||
    1
  );

  engine.setAction(
    sceneData.action,
    sceneData.choreography,
    sceneData.duration
  );

  currentScene.textContent =
    sceneData.actionLabel ||
    "Scene";

  duration.value =
    sceneData.duration;

  speed.value =
    String(
      sceneData.speed ||
      1
    );

  camera.value =
    sceneData.camera ||
    "medium";

  effect.value =
    sceneData.effect ||
    "none";

  characterA.value =
    sceneData.characterA;

  characterB.value =
    sceneData.characterB;

  background.value =
    sceneData.background;

  prop.value =
    sceneData.prop;

  action.value =
    sceneData.action;

  updateActionDescription();

  state.dirty =
    true;
}

/* ============================================================
   PREVIEW CURRENT UI
============================================================ */

async function previewCurrent() {

  const draft =
    createSceneFromUI();

  if (
    state.activeSceneId
  ) {

    const index =
      state.scenes.findIndex(
        scene =>
          scene.id ===
          state.activeSceneId
      );

    if (
      index >= 0
    ) {

      state.scenes[index] =
        {
          ...state.scenes[index],
          ...draft,
          id:
            state.scenes[index].id
        };
    }

  } else {

    state.activeSceneId =
      draft.id;

    state.scenes.push(
      draft
    );
  }

  await applyScene(
    draft
  );

  renderTimeline();
}

/* ============================================================
   ADD SCENE
============================================================ */

async function addScene() {

  const sceneData =
    createSceneFromUI();

  state.scenes.push(
    sceneData
  );

  state.activeSceneId =
    sceneData.id;

  await applyScene(
    sceneData
  );

  renderTimeline();

  state.dirty =
    true;
}

/* ============================================================
   NEW SCENE
============================================================ */

function newScene() {

  state.activeSceneId =
    null;

  currentScene.textContent =
    "New Scene";

  action.value =
    "idle";

  camera.value =
    "medium";

  effect.value =
    "none";

  duration.value =
    "5";

  speed.value =
    "1";

  engine.setAction(
    "idle",
    [],
    5
  );

  engine.pause();

  engine.seek(
    0
  );

  updateActionDescription();

  renderTimeline();
}

/* ============================================================
   DUPLICATE
============================================================ */

async function duplicateScene() {

  if (
    !state.activeSceneId
  ) {

    return;
  }

  const original =
    state.scenes.find(
      scene =>
        scene.id ===
        state.activeSceneId
    );

  if (!original) {
    return;
  }

  const copy =
    JSON.parse(
      JSON.stringify(
        original
      )
    );

  copy.id =
    uid();

  copy.createdAt =
    new Date().toISOString();

  state.scenes.push(
    copy
  );

  state.activeSceneId =
    copy.id;

  await applyScene(
    copy
  );

  renderTimeline();
}

/* ============================================================
   DELETE
============================================================ */

function deleteScene() {

  if (
    !state.activeSceneId
  ) {

    return;
  }

  state.scenes =
    state.scenes.filter(
      scene =>
        scene.id !==
        state.activeSceneId
    );

  state.activeSceneId =
    state.scenes.at(-1)?.id ||
    null;

  if (
    state.activeSceneId
  ) {

    const scene =
      state.scenes.find(
        item =>
          item.id ===
          state.activeSceneId
      );

    applyScene(
      scene
    );

  } else {

    newScene();
  }

  renderTimeline();
}

/* ============================================================
   LOAD SCENE
============================================================ */

async function loadScene(
  id
) {

  const sceneData =
    state.scenes.find(
      scene =>
        scene.id ===
        id
    );

  if (!sceneData) {
    return;
  }

  state.activeSceneId =
    id;

  await applyScene(
    sceneData
  );

  renderTimeline();
}

/* ============================================================
   TIMELINE
============================================================ */

function renderTimeline() {

  if (
    !state.scenes.length
  ) {

    timeline.innerHTML = `
      <div
        style="
          color:#64748b;
          font-size:11px;
          padding:12px;
        "
      >
        No scenes yet.
        Configure a scene and click Add Scene.
      </div>
    `;

    return;
  }

  timeline.innerHTML =
    state.scenes
      .map(
        (scene, index) => {

          const active =
            scene.id ===
            state.activeSceneId
              ? "active"
              : "";

          return `
            <button
              class="sb-scene-card ${active}"
              data-scene-id="${escapeHTML(scene.id)}"
            >

              <div
                class="sb-scene-number"
              >
                Scene ${index + 1}
              </div>

              <div
                class="sb-scene-name"
              >
                ${escapeHTML(scene.actionLabel)}
              </div>

              <div
                class="sb-scene-meta"
              >
                ${scene.duration.toFixed(1)}s
                ·
                ${escapeHTML(scene.camera)}
              </div>

            </button>
          `;
        }
      )
      .join("");

  all(
    "[data-scene-id]"
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        () =>
          loadScene(
            button.dataset.sceneId
          )
      );
    }
  );
}

/* ============================================================
   ACTION DESCRIPTION
============================================================ */

function updateActionDescription() {

  const duo =
    DUO_ACTIONS.find(
      item =>
        item.id ===
        action.value
    );

  if (duo) {

    actionDescription.innerHTML =
      `
        <strong>
          Pre-authored choreography
        </strong>

        <br />

        ${duo.choreography
          .map(
            item =>
              `${item[0].toUpperCase()}
               ${item[1]}
               ${item[2]}s-${item[3]}s`
          )
          .join(" → ")}
      `;

    return;
  }

  const basic =
    SINGLE_ACTIONS.find(
      item =>
        item.id ===
        action.value
    );

  actionDescription.innerHTML =
    basic
      ? `
        <strong>
          ${escapeHTML(
            basic.name
          )}
        </strong>

        <br />

        Single-character
        pre-authored action.
      `
      : "";
}

/* ============================================================
   ACTION CARDS
============================================================ */

function renderActionCards() {

  const container =
    el(
      "#sb-action-cards"
    );

  const allActions = [
    ...SINGLE_ACTIONS,
    ...DUO_ACTIONS
  ];

  container.innerHTML =
    allActions
      .map(
        item => {

          const isDuo =
            DUO_ACTIONS.some(
              duo =>
                duo.id ===
                item.id
            );

          return `
            <button
              class="sb-action-card"
              data-action-card="${escapeHTML(item.id)}"
            >

              <strong>
                ${isDuo ? "⚔ " : "🎬 "}
                ${escapeHTML(item.name)}
              </strong>

              <small>
                ${item.duration}s
                ${isDuo
                  ? " · choreography"
                  : " · action"}
              </small>

            </button>
          `;
        }
      )
      .join("");

  all(
    "[data-action-card]"
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        async () => {

          action.value =
            button.dataset.actionCard;

          const selected =
            DUO_ACTIONS.find(
              item =>
                item.id ===
                action.value
            ) ||
            SINGLE_ACTIONS.find(
              item =>
                item.id ===
                action.value
            );

          if (selected) {

            duration.value =
              selected.duration;
          }

          updateActionDescription();

          await previewCurrent();
        }
      );
    }
  );
}

/* ============================================================
   UI CHANGE EVENTS
============================================================ */

[
  characterA,
  characterB,
  background,
  prop,
  action,
  camera,
  effect,
  duration,
  speed
].forEach(
  control => {

    control.addEventListener(
      "change",
      async () => {

        updateActionDescription();

        await previewCurrent();
      }
    );
  }
);

/* ============================================================
   PLAYBACK BUTTONS
============================================================ */

el("#sb-play")
  .addEventListener(
    "click",
    () => {

      engine.play();
    }
  );

el("#sb-pause")
  .addEventListener(
    "click",
    () => {

      engine.pause();
    }
  );

el("#sb-restart")
  .addEventListener(
    "click",
    () => {

      engine.restart();
    }
  );

/* ============================================================
   SCENE BUTTONS
============================================================ */

el("#sb-new")
  .addEventListener(
    "click",
    newScene
  );

el("#sb-add")
  .addEventListener(
    "click",
    addScene
  );

el("#sb-duplicate")
  .addEventListener(
    "click",
    duplicateScene
  );

el("#sb-delete")
  .addEventListener(
    "click",
    deleteScene
);

/* ============================================================
   TIME DISPLAY
============================================================ */

engine.onTimeChange =
  (
    current,
    total
  ) => {

    timeDisplay.textContent =
      `${current.toFixed(2)}
       /
       ${total.toFixed(2)}`;
  };

/* ============================================================
   SAVE PROJECT
============================================================ */

function saveProject() {

  const project = {

    version:
      1,

    application:
      "Botock 3D Scene Studio",

    projectName:
      state.projectName,

    createdAt:
      new Date().toISOString(),

    scenes:
      state.scenes
  };

  const blob =
    new Blob(
      [
        JSON.stringify(
          project,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );

  downloadBlob(
    blob,
    "botock-3d-project.json"
  );

  state.dirty =
    false;
}

/* ============================================================
   LOAD PROJECT
============================================================ */

el("#sb-save-project")
  .addEventListener(
    "click",
    saveProject
  );

el("#sb-load-project")
  .addEventListener(
    "click",
    () => {

      el(
        "#sb-project-file"
      ).click();
    }
  );

el("#sb-project-file")
  .addEventListener(
    "change",
    async event => {

      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      try {

        const text =
          await file.text();

        const project =
          JSON.parse(
            text
          );

        if (
          !Array.isArray(
            project.scenes
          )
        ) {

          throw new Error(
            "Invalid Botock project."
          );
        }

        state.scenes =
          project.scenes;

        state.projectName =
          project.projectName ||
          "Botock 3D Project";

        state.activeSceneId =
          state.scenes[0]?.id ||
          null;

        if (
          state.activeSceneId
        ) {

          await loadScene(
            state.activeSceneId
          );

        } else {

          newScene();
        }

        renderTimeline();

      } catch (error) {

        console.error(
          error
        );

        alert(
          "Could not load this project."
        );
      }

      event.target.value =
        "";
    }
  );

/* ============================================================
   EXPORT ALL SCENES
============================================================ */

el("#sb-export")
  .addEventListener(
    "click",
    exportProject
  );

async function exportProject() {

  if (
    state.exporting
  ) {

    return;
  }

  if (
    !state.scenes.length
  ) {

    alert(
      "Pehle kam az kam 1 scene Add Scene se add karo."
    );

    return;
  }

  state.exporting =
    true;

  try {

    const originalScene =
      state.activeSceneId;

    const recordings =
      [];

    for (
      let index = 0;
      index <
      state.scenes.length;
      index++
    ) {

      const sceneData =
        state.scenes[index];

      exportStatus.textContent =
        `Recording Scene ${
          index + 1
        } / ${
          state.scenes.length
        }...`;

      await applyScene(
        sceneData
      );

      const blob =
        await engine.record(
          sceneData.duration,
          30
        );

      recordings.push({
        scene:
          sceneData,
        blob
      });
    }

    /* --------------------------------------------------------
       CURRENT BROWSER IMPLEMENTATION:

       Download every scene separately.

       Later Botock backend/FFmpeg can concatenate these
       WebM/MP4 segments into one final movie.

       This avoids fake "combined video" behaviour.
    -------------------------------------------------------- */

    for (
      let index = 0;
      index <
      recordings.length;
      index++
    ) {

      const item =
        recordings[index];

      downloadBlob(
        item.blob,
        `botock-scene-${index + 1}.webm`
      );
    }

    exportStatus.textContent =
      `${recordings.length} scene(s) exported.`;

    if (
      originalScene
    ) {

      await loadScene(
        originalScene
      );
    }

  } catch (error) {

    console.error(
      "Export failed:",
      error
    );

    exportStatus.textContent =
      "Export failed.";

    alert(
      error.message ||
      "Video export failed."
    );

  } finally {

    state.exporting =
      false;
  }
}

/* ============================================================
   INITIAL PROJECT
============================================================ */

const firstScene =
  createSceneFromUI();

state.scenes.push(
  firstScene
);

state.activeSceneId =
  firstScene.id;

applyScene(
  firstScene
);

renderTimeline();

renderActionCards();

updateActionDescription();

/* ============================================================
   PUBLIC DEBUG API

   Useful later for Botock development.
============================================================ */

window.BotockSceneStudio = {

  engine,

  state,

  addScene,

  deleteScene,

  duplicateScene,

  exportProject,

  saveProject,

  loadScene
};