---
title: "The AI Video Prompt Engineering Master Handbook (2026 Edition)"
meta_title: "AI Video Prompt Engineering Handbook: 25-Chapter Production Guide"
meta_description: "Complete reference handbook for AI video generation. Master the 9 prompt blocks, camera kinematics, optics, anatomical gestures, dialogue, and multi-clip continuity for Botock, Sora, Kling, and Runway."
slug: "ai-video-prompt-engineering-master-handbook"
canonical_url: "https://botock.app/blog/ai-video-prompt-engineering-master-handbook"
author: "Botock AI Filmmaking Lab"
date_published: "2026-10-19"
category: "AI Filmmaking & Prompt Engineering"
reading_time: "35 min read"
word_count: "15,200 words"
og_image: "https://botock.app/images/blog/ai-video-prompt-handbook-hero.jpg"
og_type: "article"
twitter_card: "summary_large_image"
---

# The AI Video Prompt Engineering Master Handbook
> **The Platform-Neutral Production Reference for Generative AI Video**

![AI Video Prompt Engineering Master Blueprint](/images/blog/ai-video-prompt-handbook-hero.jpg)

THE COMPLETE GUIDE TO
PROMPT ENGINEERING
FOR AI VIDEO GENERATION
Image description  |  Motion  |  Camera shots, angles and movements  |  Body, hand and face actions  |  Dialogue and sound  |  Continuity  |  Templates and troubleshooting
A platform-neutral reference handbook for image-to-video and text-to-video tools.
Every technique has its own section, its own explanation, and a ready-to-use example prompt.
The nine blocks of a well-built video prompt

## How to use this handbook

This book is a reference, not a story. Every chapter covers one skill of video prompting. Each skill is split into small entries. An entry always answers four questions: what the thing is, how to write it in a prompt, what a good example prompt looks like, and what mistake to avoid.

### The reading order

Read Chapter 1 once, to understand how video models read a prompt.
Use Chapters 2 and 3 every time you start from a picture: describe the image, then build the subject map.
Use Chapter 4 to give the picture motion.
Use Chapters 5 to 8 to choose camera shot size, angle, movement and lens.
Use Chapters 9 to 14 for acting: head, eyes, hands, body, face, voice and sound.
Use Chapters 15 to 19 for scenes with several people, props, environments, action and continuity.
Use Chapters 20 to 23 when something goes wrong, when you need a ready template, or when you want full worked examples.
Important:  Do not paste this whole book into a generator. Pick the entries you need, copy their example prompt, and replace the words in [brackets] with your own details.

### Conventions used in this book


| Term | Meaning |
| --- | --- |
| Frame-left / frame-right | Left and right as the AUDIENCE sees the screen. |
| Character's left / right | The character's own body side. A character facing the camera has their right hand on frame-left. |
| Person A, Person B | Neutral labels. Replace them with your own character names or descriptions. |
| [BRACKETS] | A blank you must fill in. |
| Example prompt box | Shaded box with monospaced text. Copy, edit, and use. |
| Avoid: | The most common mistake for that entry. |


### A promise and a warning

Good prompting makes results far more controllable. It cannot make them perfect. Generative models guess, and every tool follows instructions differently. Treat each generation as a test: read the result, find the one thing that went wrong, change only that part of the prompt, and try again.

## Contents

1. How video models read your prompt
2. Describing the picture (image analysis)
3. The subject map and left/right rules
4. Giving motion to a picture
5. Shot sizes
6. Camera angles
7. Camera movements
8. Lens, focus and depth of field
9. Lighting, colour and visual style
10. Head, eyes and neck actions
11. Hand and arm actions (which hand, which finger)
12. Torso, legs and whole-body actions
13. Facial expression and emotion
14. Dialogue, voice, lip-sync and inner monologue
15. Sound design
16. One-person, two-person and group scenes
17. Props and object interaction
18. Environment, weather and background motion
19. Action, fights, magic and creatures
20. Continuity and multi-clip workflow
21. Genre recipes
22. Troubleshooting guide
23. Template library
24. Worked examples from image to final prompt
25. Glossary, checklists and quick-reference tables

## 1. How video models read your prompt

An AI video model does not understand a story the way a person does. It turns your words into a visual plan: what should be on screen, how it should look, and what should change over a few seconds. The clearer and more physical your words are, the closer the output gets to your idea.
The eight-step workflow used throughout this handbook

#### 1.1 A prompt is a production brief


**What it is: A video prompt is a small instruction sheet for a film crew made of one very literal machine. It should say what the camera sees, what moves, how it moves, and what must stay the same.**


**How to write it: Write as if you were briefing a cameraman, an actor and a sound person in one paragraph. Mention only what can be seen or heard.**


```text
EXAMPLE PROMPT
```

Medium shot of a woman in a green coat standing at a bus stop. She lifts her left hand to check her watch, then looks down the road. Static camera, soft overcast light, street ambience only.

> [!WARNING]
> **Avoid: Plot summaries such as 'she is late because her boss kept her in a meeting'. The model cannot film a reason.**


#### 1.2 Visible facts beat feelings and backstory


**What it is: Models respond to things they can draw: posture, light, gaze, objects. They respond poorly to invisible information: history, secrets, motives.**


**How to write it: Convert every thought into a visible behaviour. 'He is nervous' becomes 'his eyes flick toward the door and his fingers tighten on the cup'.**


```text
EXAMPLE PROMPT
```

The man grips the paper cup tighter with his right hand and glances once at the door, then back at the table.

> [!WARNING]
> **Avoid: Abstract labels with no visible sign, like 'he feels a deep sense of dread'.**


#### 1.3 One clip, one main event


**What it is: Short video clips (often 4 to 10 seconds) can hold one clear event. When you ask for three events, the model blends or skips them.**


**How to write it: Decide the single change that defines the clip. Put it in a sentence of its own. If you need a second event, plan a second clip.**


```text
EXAMPLE PROMPT
```


```text
ACTION: The girl turns her head from the window to the door and stops. Nothing else changes.
```


> [!WARNING]
> **Avoid: 'She stands, walks to the door, opens it, sees a stranger and screams' in one clip.**


#### 1.4 Text-to-video versus image-to-video


**What it is: Text-to-video builds everything from words. Image-to-video starts from a picture you supply and only adds motion.**


**How to write it: For text-to-video, describe subject, setting, light and style fully. For image-to-video, describe the picture briefly and spend most words on motion, camera and sound.**


```text
EXAMPLE PROMPT
```

Image-to-video: Keep the supplied image exactly. Only the curtain moves in a light breeze; the woman stays still. Static camera.

> [!WARNING]
> **Avoid: Re-describing every detail of an image you already supplied. That adds nothing and may confuse the model.**


#### 1.5 Order of importance inside a prompt


**What it is: Models tend to weigh early words more strongly than late words.**


**How to write it: Put the most important item first: identity, main action, camera, then sound and constraints. Place secondary style notes at the end.**


```text
EXAMPLE PROMPT
```

Same girl as the reference image. She smiles slightly. Static close-up. Soft window light. No dialogue.

> [!WARNING]
> **Avoid: Burying the main action in the last line behind five style adjectives.**


#### 1.6 Prompt length


**What it is: Too short leaves everything to chance. Too long causes ignored instructions and contradictions.**


**How to write it: Aim for roughly 60 to 150 words for one clip. Use short sentences. Remove any sentence that does not change the picture.**


```text
EXAMPLE PROMPT
```

(A 90-word prompt with: reference, one action, camera, gaze, sound and two constraints.)

> [!WARNING]
> **Avoid: Pasting a 500-word essay. The model will ignore the middle.**


#### 1.7 Positive wording and short negatives


**What it is: Models handle 'do X' better than 'do not do Y'. Negatives still help for a few critical issues.**


**How to write it: Say what you want first. Add at most three short exclusions at the end.**


```text
EXAMPLE PROMPT
```

The camera stays still. DO NOT: add music, add extra people, change the clothing.

> [!WARNING]
> **Avoid: A long list of twenty prohibitions. It confuses the generator.**


#### 1.8 Avoid contradictions


**What it is: If two instructions fight, the model picks one at random.**


**How to write it: Read your prompt aloud and look for pairs such as 'static camera' with 'camera circles', or 'silent' with 'says'.**


```text
EXAMPLE PROMPT
```

Camera: static, locked-off. (Remove any later mention of pans, zooms or orbits.)

> [!WARNING]
> **Avoid: 'Slow dolly in with a handheld shaky camera that is perfectly still'.**


#### 1.9 Words that are too vague


**What it is: Words such as 'cinematic', 'epic' or 'beautiful' are weak because they mean different things to different models.**


**How to write it: Replace each vague word with a measurable choice: lens, light direction, colour palette, camera speed.**


```text
EXAMPLE PROMPT
```

Low-key side lighting from frame-left, shallow depth of field, slow push-in.

> [!WARNING]
> **Avoid: 'Make it super cinematic and amazing'.**


#### 1.10 Iteration discipline


**What it is: Beginners rewrite the whole prompt after every failure. That hides what actually worked.**


**How to write it: Change one variable per generation: action, camera or audio. Keep a log of what you changed and what happened.**


```text
EXAMPLE PROMPT
```

Version 1: static camera. Version 2: same prompt, but slow push-in. Compare.

> [!WARNING]
> **Avoid: Changing five things at once and learning nothing.**

Golden rule:  Starting image + one clear change + camera plan + performance + sound rules + continuity limits.

## 2. Describing the picture (image analysis)

Before you write any motion, study the picture. Image description is the foundation of image-to-video prompting. It tells the model what already exists and gives you a precise vocabulary for the later steps. This chapter teaches you to inspect an image in a fixed order so that nothing is missed.
Use this grid to say WHERE things are in the frame

### 2.1 The inspection order

Count and label the people or creatures.
Describe each person: clothing, hair, visible features.
State frame position and depth for each.
State body pose and orientation.
State gaze: where each person looks.
List objects and which hand holds them.
Describe the environment.
Describe light, colour and time of day.
Note focus: what is sharp, what is blurred.
Note the mood and style.
Write what you do NOT know.

#### 2.2 Counting the visible subjects


**What it is: The first thing to settle is how many people, animals or creatures are really visible. Models often add or remove people if you do not anchor the number.**


**How to write it: Open with a count. Say 'two adults' or 'three people and one dog'. Mention partial figures such as an arm at the edge of the frame.**


```text
EXAMPLE PROMPT
```

Two adults and one child are visible. A fourth person is partly visible at the far edge of frame-right, only a shoulder.

> [!WARNING]
> **Avoid: Writing 'a crowd' when exactly four people are present.**


#### 2.3 Labelling people with neutral names


**What it is: Labels let you refer to the same person across many prompts without confusion.**


**How to write it: Use Person A, Person B, or a visible description such as 'the woman in the red scarf'. Never guess real identity or personal history.**


```text
EXAMPLE PROMPT
```

Person A is the tall man in the dark coat. Person B is the woman in the red scarf.

> [!WARNING]
> **Avoid: Guessing 'this is her brother' when the image does not show it.**


#### 2.4 Describing clothing


**What it is: Clothing is the quickest identity anchor, so changes in outfit are very noticeable.**


**How to write it: Describe colour, garment type and one distinctive detail: 'dark green wool coat with a high collar'.**


```text
EXAMPLE PROMPT
```

She wears a mustard yellow raincoat with the hood down, black trousers and white sneakers.

> [!WARNING]
> **Avoid: Listing fabric thread counts or ten tiny accessories.**


#### 2.5 Describing hair, face and visible features


**What it is: Hair and facial features help identity consistency, but over-describing a face invites distortion.**


**How to write it: Mention hairstyle, colour, glasses, beard or distinctive marks only if clearly visible. Do not describe emotional character from a still.**


```text
EXAMPLE PROMPT
```

Short black hair, round glasses, light stubble.

> [!WARNING]
> **Avoid: Describing eye colour from a distant shot where it cannot be seen.**


#### 2.6 Frame position


**What it is: Where a subject sits in the frame decides how camera moves read.**


**How to write it: Use the nine positions from the frame grid: top-left, frame-left, bottom-right and so on. Add depth: foreground, midground, background.**


```text
EXAMPLE PROMPT
```

Person A stands in the foreground on frame-right. Person B stands in the background on frame-left.

> [!WARNING]
> **Avoid: 'On the left' with no clarification about whose left.**


#### 2.7 Body pose and posture


**What it is: The starting pose is the first frame of your video. Any mismatch looks like a jump.**


**How to write it: Describe standing, sitting, leaning, crouching, plus arm and hand positions.**


```text
EXAMPLE PROMPT
```

Person A is seated, back straight, both hands resting flat on the table.

> [!WARNING]
> **Avoid: Skipping the hands. Hands are the part models most often change by accident.**


#### 2.8 Facing direction


**What it is: Facing direction tells the model which way a character can turn or walk without breaking anatomy.**


**How to write it: Choose from: facing camera, three-quarter left or right, profile, back to camera.**


```text
EXAMPLE PROMPT
```

Person B faces three-quarter left, body turned toward Person A.

> [!WARNING]
> **Avoid: Saying 'looking away' without naming a direction.**


#### 2.9 Gaze direction in the still


**What it is: Where the eyes look is the clearest clue to what a character cares about.**


**How to write it: Name the target: 'down at the letter in her hands', 'off-screen frame-right', 'directly into the lens'.**


```text
EXAMPLE PROMPT
```

He looks down at the phone in his right hand; his eyes are not on the camera.

> [!WARNING]
> **Avoid: Leaving gaze unspecified. The model may stare into the lens.**


#### 2.10 Objects and which hand holds them


**What it is: Props are the first things to melt or vanish in a generation.**


**How to write it: Name each important prop, its colour, shape and position. State left or right hand using one consistent system.**


```text
EXAMPLE PROMPT
```

A small brass key rests in the palm of Person A's right hand (frame-left side of the image).

> [!WARNING]
> **Avoid: Writing 'holding something' with no object named.**


#### 2.11 Environment: place and time


**What it is: The setting controls colour, background motion and sound.**


**How to write it: State interior or exterior, type of place, one or two landmark details and the time of day.**


```text
EXAMPLE PROMPT
```

A narrow wooden corridor in an old house, evening, a single lamp on a side table.

> [!WARNING]
> **Avoid: Calling it 'a nice room'.**


#### 2.12 Light and colour of the still


**What it is: The existing light must be protected during motion.**


**How to write it: Describe direction, softness and colour: 'soft warm light from frame-left, cool blue shadows on the right'.**


```text
EXAMPLE PROMPT
```

Warm tungsten lamp at frame-right, deep shadows on the wall behind.

> [!WARNING]
> **Avoid: Asking for 'bright sunny day' when the still is a dim night scene.**


#### 2.13 Focus and depth


**What it is: A sharp subject and blurred background is a design decision you want to keep.**


**How to write it: State which subject is in focus and which planes are blurred.**


```text
EXAMPLE PROMPT
```

Person A is sharp. The street behind is softly blurred.

> [!WARNING]
> **Avoid: Asking for 'everything sharp' when the image has creamy background blur.**


#### 2.14 Mood and style


**What it is: Style words anchor the look when the model interprets motion.**


**How to write it: Pick one realism level and two or three mood words: 'photorealistic, quiet, melancholic'.**


```text
EXAMPLE PROMPT
```

Photorealistic live-action look, muted colours, calm and quiet mood.

> [!WARNING]
> **Avoid: Mixing 'anime', 'oil painting' and 'documentary' in one line.**


#### 2.15 What you must not assume


**What it is: A still hides things: the back of the head, the hand behind the back, what is off-screen.**


**How to write it: List unknowns, and tell the model not to invent them unless you want that.**


```text
EXAMPLE PROMPT
```

Do not reveal the object behind Person B's back. Do not invent people off-screen.

> [!WARNING]
> **Avoid: Writing 'she is hiding a gun' when no gun is visible.**


### 2.16 A complete image inventory template

IMAGE INVENTORY TEMPLATE
IMAGE INVENTORY
Subjects: [number] visible - [labels]
Person A: [clothes, hair], [frame position, depth], [pose], [facing], [gaze]
Person B: [clothes, hair], [frame position, depth], [pose], [facing], [gaze]
Objects: [prop, colour, which hand / where]
Environment: [place], [time of day], [landmarks]
Light: [direction], [softness], [colour]
Focus: [sharp subject], [blurred planes]
Style: [realism level], [mood words]
Unknown / do not invent: [list]

### 2.17 Worked example: describing one still

Imagine a picture of a market street at dusk. A man in a grey jacket stands at frame-right holding a paper bag. A girl in a blue dress stands at frame-left looking at him. A fruit stall fills the background.
RESULT
IMAGE INVENTORY
Subjects: 2 visible - Person A (man), Person B (girl)
Person A: grey jacket, short dark hair, frame-right midground, standing straight, three-quarter left, looking down at the paper bag in both hands
Person B: blue dress, braided hair, frame-left midground, standing, three-quarter right, looking at Person A's face
Objects: brown paper bag in A's hands; fruit stall in background with oranges
Environment: outdoor market street at dusk, string lights overhead
Light: warm light from the stall, cool blue sky behind
Focus: both people sharp; stall slightly soft
Style: photorealistic, warm, gentle mood
Unknown: what is inside the bag, do not reveal it
Tip:  Spend two minutes on the inventory. It shortens every later prompt, because you can paste only the lines that matter.

## 3. The subject map and left/right rules

Once the image is described, convert it into a subject map: a short plan of who is where, who moves, who speaks and who stays still. Most video errors happen because the model does not know which person you mean or which side you mean.
A character facing the camera has their right hand on frame-left

#### 3.1 Frame-left versus the character's left


**What it is: The audience's left and the character's left are opposite when the character faces the camera.**


**How to write it: Pick one system for the whole project. Best practice: use 'frame-left / frame-right' for positions and 'the character's left / right hand' for body parts.**


```text
EXAMPLE PROMPT
```

Person A raises her LEFT hand (on frame-right of the image). Person B stands on frame-left.

> [!WARNING]
> **Avoid: Writing 'her left hand' when you mean the hand on the left of the screen.**


#### 3.2 Writing the subject map


**What it is: A subject map is a list that states role, position, action and speech for each subject.**


**How to write it: Make one line per subject and one line for objects and camera.**


```text
EXAMPLE PROMPT
```

SUBJECT A: frame-left, foreground, listens, silent.
SUBJECT B: frame-right, midground, speaks one line.
OBJECT: letter in B's left hand.
CAMERA: static medium two-shot.

> [!WARNING]
> **Avoid: Leaving silent characters undescribed. They then move or speak randomly.**


#### 3.3 Foreground, midground, background


**What it is: Depth planes decide focus and camera movement. Parallax makes close objects move faster than far ones.**


**How to write it: Name what is in each plane and which plane is sharp.**


```text
EXAMPLE PROMPT
```

Foreground: blurred leaves. Midground: Person A, sharp. Background: hills, soft.

> [!WARNING]
> **Avoid: Giving no depth information and expecting a convincing push-in.**


#### 3.4 Who speaks, who listens, who reacts


**What it is: Roles prevent chaos in group shots.**


**How to write it: State exactly one speaker. State the listener's expression. State that all others stay still.**


```text
EXAMPLE PROMPT
```

Person B is the only speaker. Person A listens silently with a guarded expression. Person C stays still.

> [!WARNING]
> **Avoid: 'Everyone talks'. The mouths will move randomly.**


#### 3.5 Viewpoint: external, OTS or true POV


**What it is: The viewpoint decides who is visible and whose eyes we share.**


**How to write it: Say 'external camera', 'over-the-shoulder from behind A', or 'true POV from A's eyes, A not visible'.**


```text
EXAMPLE PROMPT
```

True POV from Person A's eyes. Person B stands in the doorway ahead. Person A is not visible.

> [!WARNING]
> **Avoid: Writing 'POV' and then describing the POV character's face.**


#### 3.6 Distances between people


**What it is: Distance carries emotion: close means intimacy or conflict; far means separation.**


**How to write it: Give distances in steps, arm's lengths or metres.**


```text
EXAMPLE PROMPT
```

Person A and Person B stand two metres apart, facing each other.

> [!WARNING]
> **Avoid: 'Close together' with no measure.**


#### 3.7 The start state and the end state


**What it is: Every clip needs a clean beginning and ending pose.**


**How to write it: Write two lines: START STATE and END STATE.**


```text
EXAMPLE PROMPT
```

START STATE: A seated, B standing at the door.
END STATE: A seated, B seated across the table.

> [!WARNING]
> **Avoid: No end state. The clip drifts.**


### 3.8 Left/right cheat sheet


| You want | Write this |
| --- | --- |
| A subject on the screen's left | frame-left |
| The character's own right hand | the character's right hand |
| Movement toward screen's right | moves toward frame-right |
| Looking at the speaker off-screen on the left | looks toward an off-screen speaker on frame-left |
| Turning the head to the audience's left | turns head toward frame-left |


## 4. Giving motion to a picture

This is the core of image-to-video. A picture is frozen. Your prompt must tell the model what starts moving, how fast, how far, and where it stops. Motion falls into five families: subject motion, micro motion, environment motion, camera motion and effects motion.

#### 4.1 The motion formula


**What it is: Every motion instruction can be built from five parts: WHO moves, WHAT part, WHICH direction, HOW fast or how far, and WHERE it ends.**


**How to write it: Fill the five parts in order and keep it to one sentence.**


```text
EXAMPLE PROMPT
```

The woman (who) lifts her right hand (what part) up to chest height (direction/distance) slowly (speed) and holds it there (end).

> [!WARNING]
> **Avoid: Leaving out the end point. The movement continues forever.**


#### 4.2 Start state and end state


**What it is: The video must begin on the picture and end in a clear pose.**


**How to write it: State the opening pose in one sentence, the motion, then the final pose.**


```text
EXAMPLE PROMPT
```

At the start she is looking down. She raises her eyes to the door and stops, looking straight ahead.

> [!WARNING]
> **Avoid: Using only a verb like 'moves' with no endpoint.**


#### 4.3 Micro motion: breathing, blinking, tiny shifts


**What it is: Tiny motions make a still image feel alive without risk.**


**How to write it: Name one or two: soft breathing in the chest, natural blinking, slight hair movement.**


```text
EXAMPLE PROMPT
```

Very subtle natural motion only: gentle breathing and occasional blinking. Body and head otherwise still.

> [!WARNING]
> **Avoid: Asking for 'lots of subtle motion'. The model adds random shifts.**


#### 4.4 Environment motion


**What it is: Wind, water, smoke or crowds can move while the subject stays still. This is the safest way to add life.**


**How to write it: Name the element and its direction and strength.**


```text
EXAMPLE PROMPT
```

A light breeze moves the curtains toward frame-left. The man does not move.

> [!WARNING]
> **Avoid: 'Everything moves a bit'.**


#### 4.5 Motion speed words


**What it is: Speed words change how the model times the action.**


**How to write it: Use a small set: very slow, slow, natural, brisk, fast. Pair with duration where possible.**


```text
EXAMPLE PROMPT
```

She turns her head very slowly over about three seconds.

> [!WARNING]
> **Avoid: Using 'fast' for everything and getting blur.**


#### 4.6 Motion amplitude


**What it is: Amplitude is how far a movement goes.**


**How to write it: Use measurable words: a few centimetres, 20 degrees, one step, shoulder height.**


```text
EXAMPLE PROMPT
```

He tilts his head about 10 degrees to frame-right.

> [!WARNING]
> **Avoid: 'A little bit' without a unit.**


#### 4.7 Sequencing within one clip


**What it is: If two small actions are needed, order them clearly.**


**How to write it: Use 'first', 'then', and 'finally', with no more than two steps.**


```text
EXAMPLE PROMPT
```

First she glances at the clock, then she looks back at the door.

> [!WARNING]
> **Avoid: Chaining five steps in a single clip.**


#### 4.8 Which parts must stay still


**What it is: Freezing everything except one part gives the model a precise target.**


**How to write it: Say 'only the eyes move' or 'everything else is frozen'.**


```text
EXAMPLE PROMPT
```

Only the eyes move. Head, shoulders and hands stay completely still.

> [!WARNING]
> **Avoid: Forgetting to freeze the rest, which then drifts.**


#### 4.9 Motion that starts from rest


**What it is: Real movement has acceleration. Sudden starts look robotic.**


**How to write it: Add 'begins from stillness' and 'eases in'.**


```text
EXAMPLE PROMPT
```

He begins from stillness and slowly starts to walk toward the window, easing into a natural pace.

> [!WARNING]
> **Avoid: Asking for instant full-speed action.**


#### 4.10 Direction of motion


**What it is: Direction must be unambiguous.**


**How to write it: Use frame-left/right, toward camera, away from camera, up, down.**


```text
EXAMPLE PROMPT
```

The man walks away from the camera along the street toward the lights in the background.

> [!WARNING]
> **Avoid: 'Goes over there'.**


#### 4.11 Motion paths and distance


**What it is: A path tells the model where the subject travels.**


**How to write it: Give a start, a path shape and an end.**


```text
EXAMPLE PROMPT
```

She walks in a straight line from the doorway to the table, stops at the table edge.

> [!WARNING]
> **Avoid: 'Walks around the room'.**


#### 4.12 Cloth, hair and secondary motion


**What it is: Clothing and hair respond to movement. Describe it so it does not look stiff.**


**How to write it: Tie secondary motion to a cause: wind, turning, walking.**


```text
EXAMPLE PROMPT
```

Her scarf sways lightly as she turns.

> [!WARNING]
> **Avoid: Fluttering fabric with no wind source.**


#### 4.13 Keeping the picture's composition


**What it is: Image-to-video can drift from the reference.**


**How to write it: Add 'preserve the composition, positions and faces of the reference image'.**


```text
EXAMPLE PROMPT
```

Preserve the composition, faces and clothing of the reference image throughout.

> [!WARNING]
> **Avoid: Assuming the model will respect the image by default.**


#### 4.14 Timing and duration


**What it is: Most tools produce a few seconds. Plan actions to fit.**


**How to write it: Match action length to clip length: a head turn takes 1 to 3 seconds; a walk of three steps takes 3 to 4 seconds.**


```text
EXAMPLE PROMPT
```

Over the five-second clip, the man takes three slow steps and stops.

> [!WARNING]
> **Avoid: Planning a 20-second event for a 5-second clip.**


#### 4.15 Loopable or still-ending clips


**What it is: Some clips should end on a hold so editing can cut cleanly.**


**How to write it: Ask to hold the final pose for the last second.**


```text
EXAMPLE PROMPT
```

At the end the subject holds the pose, completely still, for the last second.

> [!WARNING]
> **Avoid: Ending mid-motion when you plan to cut.**


#### 4.16 Mixing subject and camera motion


**What it is: When both move, the model must solve two problems at once.**


**How to write it: Prefer one: either the subject moves with a still camera, or the camera moves with a still subject.**


```text
EXAMPLE PROMPT
```

Camera slowly pushes in. The subject does not move.

> [!WARNING]
> **Avoid: Walking subject plus orbit camera plus zoom.**

Safest motion order for beginners:  1) micro motion, 2) environment motion, 3) head or eye motion, 4) one hand action, 5) walking, 6) running and fighting.

## 5. Shot sizes

Shot size means how much of the subject fits inside the frame. It is the first camera decision you make, because it controls what the viewer notices: the place, the body, the face or a tiny detail.
Shot sizes on a standing figure (nested crops)

#### 5.1 Extreme wide / establishing shot


**What it is: A very wide view where the location is the star and people are tiny.**


**How to write it: Name the place, scale and any small figures. Pair with a static or very slow camera.**


```text
EXAMPLE PROMPT
```

Extreme wide shot of a desert road at sunrise. One small figure walks along the road. Static camera.

> [!WARNING]
> **Avoid: Asking for facial expressions at this distance. They will not be visible.**


#### 5.2 Wide / long shot


**What it is: Shows the full body and a good part of the surroundings.**


**How to write it: Use it to show positions and distances between people.**


```text
EXAMPLE PROMPT
```

Wide shot of Person A and Person B standing on opposite sides of the doorway, both full body visible.

> [!WARNING]
> **Avoid: Expecting subtle eye acting.**


#### 5.3 Full shot


**What it is: Head to toe, with the figure filling most of the frame height.**


**How to write it: Good for costumes, walking and full-body gestures.**


```text
EXAMPLE PROMPT
```

Full shot of the woman standing in the hallway, hands visible at her sides.

> [!WARNING]
> **Avoid: Cropping the feet when you said 'full shot'.**


#### 5.4 Medium-long / cowboy shot


**What it is: Cuts at mid-thigh or knees; keeps the hands and any belt or holster in view.**


**How to write it: Use for gestures plus a sense of posture.**


```text
EXAMPLE PROMPT
```

Medium-long shot of the traveller reaching toward the bag at his belt with his right hand.

> [!WARNING]
> **Avoid: Using it when you need face detail.**


#### 5.5 Medium shot


**What it is: Waist up. The workhorse for dialogue.**


**How to write it: Give the subject's position, gaze and any hand action.**


```text
EXAMPLE PROMPT
```

Medium shot of Person A speaking to someone off-camera frame-left, hands resting on the table.

> [!WARNING]
> **Avoid: Moving the camera and character at once.**


#### 5.6 Medium close-up


**What it is: Chest up. Emphasises face and shoulders.**


**How to write it: Use for emotional beats that need body language.**


```text
EXAMPLE PROMPT
```

Medium close-up of Person B, eyes lowered, restrained sadness, mouth closed.

> [!WARNING]
> **Avoid: Asking for big arm gestures that fall outside the frame.**


#### 5.7 Close-up


**What it is: Head and shoulders, or an important object, fills the frame.**


**How to write it: Use for strong emotion or an object detail. Keep actions very small.**


```text
EXAMPLE PROMPT
```

Close-up on Person A's face as the realisation appears in her eyes. Static camera.

> [!WARNING]
> **Avoid: Large head turns; the face will distort.**


#### 5.8 Extreme close-up


**What it is: A tiny detail: eyes, lips, fingers, a button.**


**How to write it: Name exactly which detail and what it does.**


```text
EXAMPLE PROMPT
```

Extreme close-up of an eye, the pupil narrows slightly as the light turns on.

> [!WARNING]
> **Avoid: Asking for the whole face and the eye detail together.**


#### 5.9 Insert shot


**What it is: A close detail of an object or action that explains something to the viewer.**


**How to write it: Describe the object, its position and the single action.**


```text
EXAMPLE PROMPT
```

Insert shot of a brass key placed on a wooden table by a hand from frame-right.

> [!WARNING]
> **Avoid: Letting a face wander into the insert.**


#### 5.10 Two-shot


**What it is: Two people share the frame.**


**How to write it: Say who is frame-left and frame-right and what the space between them does.**


```text
EXAMPLE PROMPT
```

Medium two-shot. Person A on frame-left, Person B on frame-right, one metre apart, facing each other.

> [!WARNING]
> **Avoid: Not stating positions, so they swap places.**


#### 5.11 Three-shot and group shot


**What it is: Three or more people in one composition.**


**How to write it: Describe arrangement: line, triangle, semicircle.**


```text
EXAMPLE PROMPT
```

Wide group shot of five people in a loose semicircle around a small fire.

> [!WARNING]
> **Avoid: Large groups with several simultaneous actions.**


#### 5.12 Choosing the right shot size


**What it is: Match the shot size to what the viewer must see.**


**How to write it: Ask: what is the single thing the viewer must notice? Place that thing as large in the frame as is sensible.**


```text
EXAMPLE PROMPT
```

(Need to show worry in the eyes: use a close-up. Need to show who is in the room: use a wide shot.)

> [!WARNING]
> **Avoid: Using close-ups for everything. The clip will feel flat.**


### 5.13 Composition: rule of thirds and look room

Subject on a third line, with open space in the direction of the gaze

#### 5.14 Rule of thirds placement


**What it is: Putting a subject on a vertical third line looks balanced and cinematic.**


**How to write it: Say which third the subject occupies.**


```text
EXAMPLE PROMPT
```

Subject placed on the right third of the frame, looking toward the left.

> [!WARNING]
> **Avoid: Centering every subject.**


#### 5.15 Look room and lead room


**What it is: Space in the direction a person looks (look room) or moves (lead room) feels natural.**


**How to write it: Keep open space on the side the character faces.**


```text
EXAMPLE PROMPT
```

Leave open space on frame-left where the subject is looking.

> [!WARNING]
> **Avoid: Placing the subject against the frame edge they face.**


#### 5.16 Headroom and framing the eyes


**What it is: Eyes sit near the upper third. Too much headroom wastes space; too little feels cramped.**


**How to write it: State 'eyes on the upper third line'.**


```text
EXAMPLE PROMPT
```

Close-up with the eyes on the upper third line.

> [!WARNING]
> **Avoid: Cutting off the top of the head by accident.**


## 6. Camera angles

Camera angle is where the camera is placed relative to the subject: higher, lower, left, right, behind. Angle changes meaning. A high angle can make a person look small. A low angle can make them look powerful.
Camera heights from top-down to ground level

#### 6.1 Eye-level


**What it is: Camera at the subject's eye height. Neutral and natural.**


**How to write it: Use for dialogue and honest portrayal.**


```text
EXAMPLE PROMPT
```

Eye-level medium shot of Person A talking to Person B off-camera.

> [!WARNING]
> **Avoid: Forgetting to say 'eye-level'. The model may choose a dramatic angle.**


#### 6.2 High angle


**What it is: The camera looks down on the subject.**


**How to write it: Say how steep: slightly high, steep high.**


```text
EXAMPLE PROMPT
```

Slight high-angle medium shot of a boy sitting on the steps, looking down.

> [!WARNING]
> **Avoid: Extreme top views when you wanted a gentle one.**


#### 6.3 Low angle


**What it is: The camera looks up. The subject feels tall or threatening.**


**How to write it: Pair with a wide lens for a heroic feel.**


```text
EXAMPLE PROMPT
```

Low-angle shot of the knight standing before the gate, sky behind him.

> [!WARNING]
> **Avoid: Making a comic character look menacing by mistake.**


#### 6.4 Ground-level


**What it is: Camera almost on the ground.**


**How to write it: Great for boots, paws, scale and chases.**


```text
EXAMPLE PROMPT
```

Ground-level view of boots splashing through a puddle toward the camera.

> [!WARNING]
> **Avoid: Expecting faces to look natural.**


#### 6.5 Bird's-eye / top-down


**What it is: Camera directly above, pointing straight down.**


**How to write it: Good for table layouts and maps.**


```text
EXAMPLE PROMPT
```

Top-down shot of four people around a round table, hands moving cards.

> [!WARNING]
> **Avoid: Combining with strong perspective cues.**


#### 6.6 Dutch / canted angle


**What it is: The horizon is tilted for unease.**


**How to write it: Use very sparingly; say how many degrees.**


```text
EXAMPLE PROMPT
```

A subtle 10-degree Dutch tilt as the character notices something wrong.

> [!WARNING]
> **Avoid: Leaving it on for long dialogue.**


#### 6.7 Profile view


**What it is: Camera sees the side of the face.**


**How to write it: Use for silhouette and clear eyelines.**


```text
EXAMPLE PROMPT
```

Profile close-up of the woman looking out of a train window toward frame-right.

> [!WARNING]
> **Avoid: Asking the character to look into the lens.**


#### 6.8 Three-quarter view


**What it is: The face is turned partway between front and profile.**


**How to write it: A flattering natural angle for portraits.**


```text
EXAMPLE PROMPT
```

Three-quarter close-up, eyes looking toward frame-left.

> [!WARNING]
> **Avoid: Switching to frontal mid-shot.**


#### 6.9 Rear view


**What it is: Camera behind the subject.**


**How to write it: Great for revealing a landscape the character sees.**


```text
EXAMPLE PROMPT
```

Rear view of a man standing on a cliff, looking out over a valley.

> [!WARNING]
> **Avoid: Expecting facial emotion.**


#### 6.10 Over-the-shoulder (OTS)


**What it is: Camera behind one character, so their shoulder frames the other.**


**How to write it: State which shoulder is in the foreground and whether it is blurred.**


```text
EXAMPLE PROMPT
```

Over-the-shoulder from behind Person A's right shoulder, foreground soft. Person B is in focus.

> [!WARNING]
> **Avoid: Showing A's face in OTS.**


#### 6.11 Reverse over-the-shoulder


**What it is: The opposite OTS to cut back and forth.**


**How to write it: Mirror the previous angle and keep the same axis.**


```text
EXAMPLE PROMPT
```

Reverse over-the-shoulder from behind Person B toward Person A.

> [!WARNING]
> **Avoid: Crossing the axis, making them swap sides.**


#### 6.12 True point-of-view (POV)


**What it is: The camera is a character's eyes. That character is not seen.**


**How to write it: Say 'the POV character is outside the frame'. Optionally add small hand edges.**


```text
EXAMPLE PROMPT
```

True POV from Person B's eyes. Person A holds the envelope in the doorway.

> [!WARNING]
> **Avoid: Showing the POV person's face.**


#### 6.13 Through foliage / doorway


**What it is: A foreground blur frames the subject like a secret view.**


**How to write it: Name the foreground object and its blur level.**


```text
EXAMPLE PROMPT
```

Camera peers through blurred leaves toward the woman by the stream.

> [!WARNING]
> **Avoid: Hiding the subject too much.**


#### 6.14 Reflection shot


**What it is: Subject shown in a mirror, window or water.**


**How to write it: State what is reflected and whether the real subject is visible.**


```text
EXAMPLE PROMPT
```

The man's face appears in the dark window glass, matching his real expression.

> [!WARNING]
> **Avoid: Letting reflection and reality disagree.**


#### 6.15 Silhouette


**What it is: Backlight turns subjects into dark shapes.**


**How to write it: Describe the bright background and the shape.**


```text
EXAMPLE PROMPT
```

Two silhouettes stand in a bright doorway; their faces are in shadow.

> [!WARNING]
> **Avoid: Asking for facial expressions.**

Two-shot, over-the-shoulder and true POV from above

## 7. Camera movements

A camera movement is how the camera itself travels or rotates during the clip. Every movement has a name, a direction and a purpose. A good rule: if the story does not need movement, use a static camera.
The six basic camera movements

#### 7.1 Static / locked-off


**What it is: The camera does not move at all.**


**How to write it: Say 'static camera, locked-off, no movement' to stop drifting.**


```text
EXAMPLE PROMPT
```

Static locked-off medium shot. The camera does not move or zoom.

> [!WARNING]
> **Avoid: Leaving it unspecified; many models add random drift.**


#### 7.2 Pan (left or right)


**What it is: The camera rotates horizontally from a fixed point.**


**How to write it: State direction, amount in degrees and speed.**


```text
EXAMPLE PROMPT
```

Slow pan right by about 20 degrees to reveal the doorway. No zoom.

> [!WARNING]
> **Avoid: 'Pan' when you mean 'track sideways'.**


#### 7.3 Tilt (up or down)


**What it is: The camera rotates vertically.**


**How to write it: State start and end of the tilt.**


```text
EXAMPLE PROMPT
```

Slow tilt up from the boots on the floor to the man's face.

> [!WARNING]
> **Avoid: Combining with a pan without saying so.**


#### 7.4 Dolly in / push-in


**What it is: The camera physically moves toward the subject. Builds focus or tension.**


**How to write it: Say how far and how slow.**


```text
EXAMPLE PROMPT
```

Very slow push-in from a medium shot to a close-up. The subject stays still.

> [!WARNING]
> **Avoid: Using 'zoom' when you want real parallax.**


#### 7.5 Dolly out / pull-back


**What it is: The camera moves away. Reveals space or isolation.**


**How to write it: State what is revealed at the end.**


```text
EXAMPLE PROMPT
```

Slow pull-back from a close-up of the girl to a wide view of the empty gymnasium.

> [!WARNING]
> **Avoid: Revealing new people that were not in the image.**


#### 7.6 Truck / lateral track


**What it is: The camera slides sideways.**


**How to write it: State direction and what stays in the frame.**


```text
EXAMPLE PROMPT
```

The camera tracks left along the counter, keeping the baker in view.

> [!WARNING]
> **Avoid: Mixing with a pan accidentally.**


#### 7.7 Follow / tracking shot


**What it is: The camera follows a moving subject.**


**How to write it: Say behind, beside or in front, and the distance.**


```text
EXAMPLE PROMPT
```

Rear tracking shot following the runner along the corridor at a constant distance of three metres.

> [!WARNING]
> **Avoid: Changing the subject's speed mid-shot.**


#### 7.8 Leading shot (camera retreats in front)


**What it is: The subject walks toward the camera while the camera moves backward.**


**How to write it: State the distance and that the subject looks past the lens.**


```text
EXAMPLE PROMPT
```

Camera moves backward at walking speed as the woman walks toward it; she looks ahead, not into the lens.

> [!WARNING]
> **Avoid: Letting the subject stare into the lens.**


#### 7.9 Side tracking


**What it is: The camera moves parallel to the subject.**


**How to write it: Match speeds.**


```text
EXAMPLE PROMPT
```

Side-tracking shot matching the subject's walking pace, profile view.

> [!WARNING]
> **Avoid: Mismatching speeds so the subject drifts out.**


#### 7.10 Arc / orbit


**What it is: The camera moves around the subject in a curve.**


**How to write it: Limit the angle: 15 to 45 degrees. Full circles often fail.**


```text
EXAMPLE PROMPT
```

A slow 30-degree arc from profile to three-quarter view. The subject stays still.

> [!WARNING]
> **Avoid: Asking for a full 360.**


#### 7.11 Crane / jib


**What it is: The camera rises or descends smoothly over a space.**


**How to write it: State start height, end height and what is revealed.**


```text
EXAMPLE PROMPT
```

The camera rises slowly above the group to reveal the whole courtyard.

> [!WARNING]
> **Avoid: Adding subject action as well.**


#### 7.12 Pedestal


**What it is: The camera body moves straight up or down without tilting.**


**How to write it: State levels: chest to waist.**


```text
EXAMPLE PROMPT
```

Camera lowers from chest level to waist level while staying level.

> [!WARNING]
> **Avoid: Confusing it with tilt.**


#### 7.13 Optical zoom in / out


**What it is: The lens changes magnification; the camera does not move. Perspective stays flat.**


**How to write it: Say 'optical zoom' to separate it from a dolly.**


```text
EXAMPLE PROMPT
```

Subtle optical zoom toward the sign; the camera itself stays still.

> [!WARNING]
> **Avoid: Using zoom when you wanted depth.**


#### 7.14 Whip pan


**What it is: A very fast pan with blur, often used as a transition.**


**How to write it: State start and end subjects.**


```text
EXAMPLE PROMPT
```

Quick whip pan from the open door to the startled subject.

> [!WARNING]
> **Avoid: Overusing it.**


#### 7.15 Handheld


**What it is: Small natural shake for realism or urgency.**


**How to write it: State the intensity: subtle, moderate.**


```text
EXAMPLE PROMPT
```

Subtle handheld movement, like a documentary camera. Not shaky.

> [!WARNING]
> **Avoid: Asking for 'handheld' and 'perfectly steady' together.**


#### 7.16 Gimbal / Steadicam


**What it is: Smooth floating motion.**


**How to write it: Use for long follows.**


```text
EXAMPLE PROMPT
```

Smooth gimbal shot following the man down the hallway.

> [!WARNING]
> **Avoid: Expecting exact repetition.**


#### 7.17 Rack focus


**What it is: Focus shifts from one depth plane to another.**


**How to write it: Name the first and second focus target.**


```text
EXAMPLE PROMPT
```

Start with the foreground glass in focus, then rack focus to the woman behind it.

> [!WARNING]
> **Avoid: Leaving both planes sharp.**


#### 7.18 Dolly zoom (vertigo effect)


**What it is: Camera moves one way while the lens zooms the other; the background warps.**


**How to write it: Keep the subject centered; use briefly.**


```text
EXAMPLE PROMPT
```

A brief dolly-zoom as the man realises the danger; keep his face centered.

> [!WARNING]
> **Avoid: Using it for ordinary beats.**


#### 7.19 Camera-only move


**What it is: Camera moves while everything else is frozen.**


**How to write it: Say 'all subjects remain completely still'.**


```text
EXAMPLE PROMPT
```

Camera slowly pans 15 degrees right. All people and objects stay completely still.

> [!WARNING]
> **Avoid: Letting people move as well.**


#### 7.20 Camera shake for impact


**What it is: A short shake to sell an explosion or step of a giant.**


**How to write it: Tie the shake to a cause and a duration.**


```text
EXAMPLE PROMPT
```

The camera shakes briefly for one second as the giant's foot lands.

> [!WARNING]
> **Avoid: Constant shaking.**


#### 7.21 Camera speed vocabulary


**What it is: Speed words matter.**


**How to write it: Use: imperceptible, very slow, slow, medium, fast.**


```text
EXAMPLE PROMPT
```

Very slow push-in, almost imperceptible.

> [!WARNING]
> **Avoid: 'Fast' for emotional moments, causing nausea.**


#### 7.22 Combining two movements


**What it is: Sometimes a push-in with a slight tilt is needed.**


**How to write it: Order them and keep one dominant.**


```text
EXAMPLE PROMPT
```

Slow push-in with a very slight tilt up at the end.

> [!WARNING]
> **Avoid: More than two moves at once.**


## 8. Lens, focus and depth of field

Lens choices change perspective, background blur and how big the world looks. You do not need technical knowledge. Describe the look you want in plain words and one focal-length hint.
Shallow depth of field versus deep focus

#### 8.1 Wide-angle feel


**What it is: Wide lenses show more space and exaggerate depth.**


**How to write it: Say 'wide-angle feel, strong perspective'.**


```text
EXAMPLE PROMPT
```

Wide-angle feel, the corridor stretches deeply behind the subject.

> [!WARNING]
> **Avoid: Using it on close-up faces, which distorts them.**


#### 8.2 Normal lens (about 35 to 50 mm)


**What it is: Natural perspective close to human vision.**


**How to write it: A safe default.**


```text
EXAMPLE PROMPT
```

Natural 50mm lens look, realistic proportions.

> [!WARNING]
> **Avoid: Specifying numbers the tool ignores.**


#### 8.3 Telephoto / compressed


**What it is: Long lenses flatten distance and blur backgrounds.**


**How to write it: Say 'telephoto compression, subject isolated'.**


```text
EXAMPLE PROMPT
```

Telephoto feel, the crowd behind is compressed and soft.

> [!WARNING]
> **Avoid: Expecting a wide view.**


#### 8.4 Shallow depth of field


**What it is: Only a thin plane is sharp.**


**How to write it: State the sharp subject.**


```text
EXAMPLE PROMPT
```

Shallow depth of field: her eyes are sharp, the background is a soft blur.

> [!WARNING]
> **Avoid: Forgetting to name the sharp plane.**


#### 8.5 Deep focus


**What it is: Most of the scene is sharp.**


**How to write it: Use for establishing shots and group blocking.**


```text
EXAMPLE PROMPT
```

Deep focus: both people and the doorway are readable.

> [!WARNING]
> **Avoid: Using it when you want isolation.**


#### 8.6 Focus pull


**What it is: Focus moves between subjects.**


**How to write it: State direction: near to far or far to near.**


```text
EXAMPLE PROMPT
```

Focus shifts from the cup in the foreground to the man's face behind it.

> [!WARNING]
> **Avoid: Moving the camera at the same time.**


#### 8.7 Soft focus / dreamy


**What it is: A gentle glow.**


**How to write it: Use for memories and romance.**


```text
EXAMPLE PROMPT
```

Soft-focus glow, gentle halation around highlights.

> [!WARNING]
> **Avoid: Overuse, which hides faces.**


#### 8.8 Bokeh


**What it is: Out-of-focus lights become soft circles.**


**How to write it: Mention lights in the background.**


```text
EXAMPLE PROMPT
```

Distant street lights become soft bokeh circles.

> [!WARNING]
> **Avoid: Bokeh with no lights present.**


#### 8.9 Motion blur


**What it is: Fast motion smears.**


**How to write it: Allow it for speed; forbid it for readability.**


```text
EXAMPLE PROMPT
```

Natural motion blur on the running legs; the face stays sharp.

> [!WARNING]
> **Avoid: Blurring the whole frame.**


#### 8.10 Aspect ratio and framing


**What it is: Horizontal (16:9) suits landscapes; vertical (9:16) suits phones and portraits.**


**How to write it: State the aspect ratio your tool uses and compose for it.**


```text
EXAMPLE PROMPT
```

Vertical 9:16 composition, subject centered, headroom for captions.

> [!WARNING]
> **Avoid: Planning wide shots for vertical clips.**


## 9. Lighting, colour and visual style

Light and colour are what make a clip feel real or artificial. In image-to-video you must protect the light of the reference. In text-to-video you must describe it. Describe light by direction, softness and colour.
Light direction from above (top-down view)

#### 9.1 Soft daylight


**What it is: Diffused light from a window or an overcast sky.**


**How to write it: Say direction and softness.**


```text
EXAMPLE PROMPT
```

Soft diffused daylight from a window on frame-left, natural skin tones.

> [!WARNING]
> **Avoid: 'Bright' without direction.**


#### 9.2 Golden hour


**What it is: Warm low sun.**


**How to write it: Name the sun direction.**


```text
EXAMPLE PROMPT
```

Golden hour sunlight from behind frame-right, warm rim light on hair.

> [!WARNING]
> **Avoid: Mixing with a night scene.**


#### 9.3 Hard light / midday sun


**What it is: Sharp shadows.**


**How to write it: Use for harsh drama.**


```text
EXAMPLE PROMPT
```

Hard midday sun, short sharp shadows beneath the figure.

> [!WARNING]
> **Avoid: Using it with soft portraits.**


#### 9.4 Backlight / rim light


**What it is: Light from behind outlines the subject.**


**How to write it: Keep the face readable.**


```text
EXAMPLE PROMPT
```

Soft backlight on hair and shoulders; the face remains clear.

> [!WARNING]
> **Avoid: Silhouetting by accident.**


#### 9.5 Side light


**What it is: Half of the face is lit; the other half shadowed.**


**How to write it: Good for mystery.**


```text
EXAMPLE PROMPT
```

Strong side light from frame-left, half the face in shadow.

> [!WARNING]
> **Avoid: Changing the side mid-clip.**


#### 9.6 Low-key lighting


**What it is: Dark scene with controlled highlights.**


**How to write it: Add 'faces readable'.**


```text
EXAMPLE PROMPT
```

Low-key dramatic lighting, deep shadows, eyes still visible.

> [!WARNING]
> **Avoid: Making the scene black.**


#### 9.7 High-key lighting


**What it is: Bright, even and cheerful.**


**How to write it: Good for ads and comedy.**


```text
EXAMPLE PROMPT
```

High-key bright soft lighting, minimal shadows.

> [!WARNING]
> **Avoid: Using it for horror.**


#### 9.8 Practical lights


**What it is: Lamps and screens that appear in the picture.**


**How to write it: Name the source and its colour.**


```text
EXAMPLE PROMPT
```

A warm desk lamp is the main light, a cool blue computer screen glows on the face.

> [!WARNING]
> **Avoid: Lights with no visible source.**


#### 9.9 Colour palette


**What it is: A limited palette keeps clips consistent.**


**How to write it: Choose three colours at most.**


```text
EXAMPLE PROMPT
```

Muted teal shadows, warm orange highlights, natural skin colour.

> [!WARNING]
> **Avoid: Ten colour names.**


#### 9.10 Colour temperature


**What it is: Warm versus cool light.**


**How to write it: Say which and where.**


```text
EXAMPLE PROMPT
```

Warm light inside the house, cool blue light through the window.

> [!WARNING]
> **Avoid: Letting temperature flip between shots.**


#### 9.11 Fog, mist and haze


**What it is: Atmosphere adds depth.**


**How to write it: State where mist sits and keep faces clear.**


```text
EXAMPLE PROMPT
```

Thin mist in the background only; faces and hands remain clear.

> [!WARNING]
> **Avoid: Thick fog covering the subject.**


#### 9.12 Rain and wet surfaces


**What it is: Reflective wet streets add richness.**


**How to write it: Mention reflections and lights.**


```text
EXAMPLE PROMPT
```

Light rain, glossy wet pavement reflecting the neon signs.

> [!WARNING]
> **Avoid: Heavy rain obscuring faces.**


#### 9.13 Night and moonlight


**What it is: Cool dim light.**


**How to write it: State the source.**


```text
EXAMPLE PROMPT
```

Cool moonlight from behind frame-right, faint warm lamp inside the window.

> [!WARNING]
> **Avoid: Pure black frames.**


#### 9.14 Realism level


**What it is: Choose one look: photorealistic, documentary, stylised, animation.**


**How to write it: State it once, plainly.**


```text
EXAMPLE PROMPT
```

Photorealistic live-action, natural skin texture, no cartoon styling.

> [!WARNING]
> **Avoid: Mixing styles.**


#### 9.15 Film look and grain


**What it is: Subtle grain suggests film.**


**How to write it: Use lightly.**


```text
EXAMPLE PROMPT
```

Subtle film grain, soft contrast, gentle highlight roll-off.

> [!WARNING]
> **Avoid: Heavy noise.**


#### 9.16 Style consistency across clips


**What it is: Lighting and grade must match between shots.**


**How to write it: Repeat the lighting sentence in every prompt.**


```text
EXAMPLE PROMPT
```

Same soft daylight from frame-left, same muted colour grade as the previous clip.

> [!WARNING]
> **Avoid: Rewriting the light description each time.**


## 10. Head, eyes and neck actions

The head and eyes carry most of the acting in a video. They are also the safest actions to prompt, because they are small and the body stays stable. Always say whether the HEAD moves, the EYES move, or both.
Body parts you can direct separately
Head turn angles seen from above

#### 10.1 Eyes only: shift the gaze


**What it is: Only the eyeballs move; the head stays fixed.**


**How to write it: Write 'only the eyes move' and name the start and end target.**


```text
EXAMPLE PROMPT
```

Only the eyes move: from straight ahead to the envelope on the table at frame-left. Head, shoulders and hands stay still.

> [!WARNING]
> **Avoid: Forgetting to freeze the head, which then follows the eyes.**


#### 10.2 Head turn with angle


**What it is: The head rotates left or right.**


**How to write it: State direction in frame terms and degrees.**


```text
EXAMPLE PROMPT
```

She turns her head about 30 degrees toward frame-left and stops, looking at the door.

> [!WARNING]
> **Avoid: 'Turns her head' with no direction.**


#### 10.3 Slow head turn to look back


**What it is: A classic suspense beat.**


**How to write it: Add pace and end target.**


```text
EXAMPLE PROMPT
```

While standing still, he slowly turns his head over his left shoulder to look behind him.

> [!WARNING]
> **Avoid: Spinning the whole body.**


#### 10.4 Head tilt


**What it is: The head leans sideways. Shows curiosity or sympathy.**


**How to write it: State side and degrees.**


```text
EXAMPLE PROMPT
```

She tilts her head 10 degrees toward her right shoulder and holds it.

> [!WARNING]
> **Avoid: Tilting 45 degrees, which looks unnatural.**


#### 10.5 Nod (yes)


**What it is: Vertical head movement.**


**How to write it: State count and slowness.**


```text
EXAMPLE PROMPT
```

He gives one slow nod, then stops.

> [!WARNING]
> **Avoid: 'Nods' with no count, resulting in endless nodding.**


#### 10.6 Head shake (no)


**What it is: Horizontal side-to-side head movement.**


**How to write it: State small or large and count.**


```text
EXAMPLE PROMPT
```

She shakes her head slightly twice, no more.

> [!WARNING]
> **Avoid: Large violent shakes.**


#### 10.7 Chin up / chin down


**What it is: Chin raised shows pride; lowered shows shyness or threat.**


**How to write it: State the change and the end pose.**


```text
EXAMPLE PROMPT
```

He lifts his chin slightly, looking down his nose at the other man.

> [!WARNING]
> **Avoid: Tilting the whole head back.**


#### 10.8 Looking at a specific object


**What it is: A precise eyeline tells the story.**


**How to write it: Name the object and its position.**


```text
EXAMPLE PROMPT
```

Her gaze moves from the man's face to the key in his right hand.

> [!WARNING]
> **Avoid: 'Looks at it'.**


#### 10.9 Looking at the camera (breaking the fourth wall)


**What it is: The subject stares into the lens.**


**How to write it: Say it deliberately and for how long.**


```text
EXAMPLE PROMPT
```

At the end of the clip she turns her eyes directly into the lens and holds for one second.

> [!WARNING]
> **Avoid: Letting it happen by accident.**


#### 10.10 Never looking at the lens


**What it is: Most narrative shots need the actor to look away from the lens.**


**How to write it: Add a short negative constraint.**


```text
EXAMPLE PROMPT
```

The subject never looks into the lens; the gaze stays on the off-screen speaker.

> [!WARNING]
> **Avoid: Relying on the image alone.**


#### 10.11 Blinking


**What it is: Natural blinks make characters feel alive.**


**How to write it: Allow normal blinking or request a single slow blink.**


```text
EXAMPLE PROMPT
```

Natural occasional blinking. One slow blink at the end.

> [!WARNING]
> **Avoid: Constant fast blinking.**


#### 10.12 Eyes widening / narrowing


**What it is: Subtle changes carry surprise or suspicion.**


**How to write it: Give the direction and amount.**


```text
EXAMPLE PROMPT
```

Her eyes widen slightly and then settle.

> [!WARNING]
> **Avoid: 'Huge cartoon eyes'.**


#### 10.13 Eye contact between two people


**What it is: Two people looking at each other.**


**How to write it: State who looks first and who looks away.**


```text
EXAMPLE PROMPT
```

Person A looks at Person B. Person B holds the look for two seconds, then looks away at the floor.

> [!WARNING]
> **Avoid: Both staring at the lens.**


#### 10.14 Neck and shoulder tension


**What it is: Raising the shoulders and tightening the neck shows stress.**


**How to write it: Describe the visible sign only.**


```text
EXAMPLE PROMPT
```

His shoulders rise slightly and tighten; he does not move his head.

> [!WARNING]
> **Avoid: Writing 'he feels stressed'.**

Gaze targets around the lens

## 11. Hand and arm actions (which hand, which finger)

Hands are the hardest part for AI video, so give them exact, simple instructions. For every hand action, say four things: WHICH hand (right or left of the character), WHAT it does, WHERE it goes and WHERE it stops. Add a freeze line for the other hand.
Basic arm positions: side, bent, forward, raised
Hand formula:  [character's right/left] hand + [action verb] + [target or position] + [speed] + [end pose]. The other hand: stays still at [position].

#### 11.1 Raise the right hand


**What it is: The character's right hand rises. If facing the camera, it appears on frame-left.**


**How to write it: State the end height: waist, chest, shoulder, above head.**


```text
EXAMPLE PROMPT
```

She raises her right hand slowly to shoulder height, palm facing forward, and holds it. Her left hand stays at her side.

> [!WARNING]
> **Avoid: Writing 'raises her hand' without saying which one.**


#### 11.2 Raise the left hand


**What it is: The character's left hand rises. On frame-right when facing the camera.**


**How to write it: Mirror the right-hand pattern.**


```text
EXAMPLE PROMPT
```

He raises his left hand to chest height, fingers relaxed, and stops. Right hand stays in his pocket.

> [!WARNING]
> **Avoid: Mixing frame-left with character's left.**


#### 11.3 Raise both hands


**What it is: Both hands go up together (surrender, celebration).**


**How to write it: State symmetric or one after another.**


```text
EXAMPLE PROMPT
```

Both hands rise slowly to shoulder height, palms open, elbows slightly bent.

> [!WARNING]
> **Avoid: Different heights unless wanted.**


#### 11.4 Wave


**What it is: A greeting wave.**


**How to write it: State hand, count and side-to-side motion.**


```text
EXAMPLE PROMPT
```

She waves with her right hand, three small waves, then lowers it.

> [!WARNING]
> **Avoid: 'Waves' alone. The wave may never end.**


#### 11.5 Point with the right index finger


**What it is: One finger extends toward a target.**


**How to write it: Name the finger, the target and the direction.**


```text
EXAMPLE PROMPT
```

He points with his right index finger toward the door on frame-right. Other fingers curled. Arm straight.

> [!WARNING]
> **Avoid: Pointing with the whole hand when you wanted one finger.**


#### 11.6 Point with the left index finger


**What it is: Same with the left hand.**


**How to write it: Name the direction in frame terms.**


```text
EXAMPLE PROMPT
```

She points with her left index finger toward the window at frame-left.

> [!WARNING]
> **Avoid: Crossing arms across the body unintentionally.**


#### 11.7 Open palm / offering


**What it is: Hand extended with the palm up.**


**How to write it: State the hand and the height.**


```text
EXAMPLE PROMPT
```

He extends his right hand, palm up, to offer the coin to Person B.

> [!WARNING]
> **Avoid: Palm facing down.**


#### 11.8 Stop gesture


**What it is: A palm faces the other person.**


**How to write it: State hand and height.**


```text
EXAMPLE PROMPT
```

She holds up her right hand, palm out, fingers together, at shoulder height.

> [!WARNING]
> **Avoid: Spread fingers when you want them together.**


#### 11.9 Beckoning


**What it is: Fingers curl toward the body to call someone.**


**How to write it: State the hand and repetitions.**


```text
EXAMPLE PROMPT
```

He beckons with his right hand twice: fingers curl in, palm up.

> [!WARNING]
> **Avoid: Hand waving instead.**


#### 11.10 Thumbs up


**What it is: Thumb extends upward with the fist closed.**


**How to write it: Add 'fingers curled, thumb vertical'.**


```text
EXAMPLE PROMPT
```

She gives a thumbs up with her right hand, fingers curled, thumb pointing upward.

> [!WARNING]
> **Avoid: Models often draw extra fingers; use close-ups carefully.**


#### 11.11 Make a fist


**What it is: Fingers curl into a closed hand.**


**How to write it: State which hand and tension.**


```text
EXAMPLE PROMPT
```

His right hand slowly closes into a fist, knuckles whitening. Left hand relaxed.

> [!WARNING]
> **Avoid: Both hands at once if only one is needed.**


#### 11.12 Open the hand to reveal an object


**What it is: A closed hand opens to show a prop.**


**How to write it: State the object and the direction of the reveal.**


```text
EXAMPLE PROMPT
```

Her right hand opens slowly to reveal a small silver ring in her palm.

> [!WARNING]
> **Avoid: Opening before the object exists in the frame.**


#### 11.13 Hold an object steadily


**What it is: A prop stays in the hand.**


**How to write it: Name the object, hand and grip.**


```text
EXAMPLE PROMPT
```

He holds a white coffee cup in his left hand with fingers wrapped around it. The cup stays upright.

> [!WARNING]
> **Avoid: Letting the cup change hands.**


#### 11.14 Pick up an object


**What it is: A hand lifts a prop from a surface.**


**How to write it: State hand, object and destination.**


```text
EXAMPLE PROMPT
```

She picks up the key from the table with her right hand and holds it at chest height.

> [!WARNING]
> **Avoid: Leaving the end state open.**


#### 11.15 Put down an object


**What it is: A prop is placed on a surface.**


**How to write it: State where and how gently.**


```text
EXAMPLE PROMPT
```

He places the phone gently on the table beside the notebook with his left hand and releases it.

> [!WARNING]
> **Avoid: Dropping unintentionally.**


#### 11.16 Hand over an object


**What it is: One person gives a prop to another.**


**How to write it: State giver's hand, receiver's hand and moment of contact.**


```text
EXAMPLE PROMPT
```

Person A hands the letter to Person B with his right hand; Person B takes it with her left.

> [!WARNING]
> **Avoid: Skipping the receiver's action.**


#### 11.17 Handshake


**What it is: Two right hands meet.**


**How to write it: Say who extends first and the number of shakes.**


```text
EXAMPLE PROMPT
```

Person A extends his right hand; Person B takes it; they shake once and release.

> [!WARNING]
> **Avoid: Crossed hands.**


#### 11.18 Push


**What it is: A hand presses against something.**


**How to write it: State direction and result.**


```text
EXAMPLE PROMPT
```

He pushes the door open with his right hand and stops, the door half open.

> [!WARNING]
> **Avoid: Slamming the door.**


#### 11.19 Pull


**What it is: A hand draws something toward the body.**


**How to write it: State direction.**


```text
EXAMPLE PROMPT
```

She pulls the drawer open with her left hand, slowly, about 20 centimetres.

> [!WARNING]
> **Avoid: Pulling the handle off.**


#### 11.20 Knock on a door


**What it is: Hand taps on a surface.**


**How to write it: State count.**


```text
EXAMPLE PROMPT
```

She knocks twice with her right hand on the wooden door. Pause.

> [!WARNING]
> **Avoid: Endless knocking.**


#### 11.21 Tap fingers / drum fingers


**What it is: Fingers tap on a table, a sign of impatience.**


**How to write it: State hand and rhythm.**


```text
EXAMPLE PROMPT
```

His right-hand fingers tap slowly on the table in a steady rhythm. Left hand still.

> [!WARNING]
> **Avoid: Large arm movements.**


#### 11.22 Touch the face


**What it is: Hand touches cheek, forehead or chin.**


**How to write it: State hand and target.**


```text
EXAMPLE PROMPT
```

She touches her chin with her right fingertips, thinking, then lowers her hand.

> [!WARNING]
> **Avoid: Hand passing through the face.**


#### 11.23 Hand over the mouth


**What it is: A hand covers the mouth in shock.**


**How to write it: State the hand and speed.**


```text
EXAMPLE PROMPT
```

She raises her right hand to cover her mouth, eyes wide.

> [!WARNING]
> **Avoid: Both hands unless specified.**


#### 11.24 Hand on the chest


**What it is: A hand rests over the heart.**


**How to write it: State hand and the pose.**


```text
EXAMPLE PROMPT
```

He places his right hand flat on his chest and holds it still.

> [!WARNING]
> **Avoid: Using it as an aggressive gesture.**


#### 11.25 Adjust hair or glasses


**What it is: A tiny grooming gesture.**


**How to write it: State hand and target.**


```text
EXAMPLE PROMPT
```

She tucks a strand of hair behind her left ear with her left hand.

> [!WARNING]
> **Avoid: Long loops of hair behaviour.**


#### 11.26 Wipe or brush


**What it is: Hand brushes dust or a tear.**


**How to write it: State hand and place.**


```text
EXAMPLE PROMPT
```

He wipes his right cheek with the back of his right hand.

> [!WARNING]
> **Avoid: Smearing the face.**


#### 11.27 Hands in pockets


**What it is: Both hands rest inside pockets.**


**How to write it: State which and keep them still.**


```text
EXAMPLE PROMPT
```

His hands stay in his coat pockets; he does not take them out.

> [!WARNING]
> **Avoid: Showing hands that were hidden.**


#### 11.28 Crossed arms


**What it is: Arms folded across the chest.**


**How to write it: State the start and that arms hold still.**


```text
EXAMPLE PROMPT
```

She crosses her arms over her chest and holds, shoulders slightly raised.

> [!WARNING]
> **Avoid: Arms merging through the torso.**


#### 11.29 Hands clasped / hands together


**What it is: Fingers interlock.**


**How to write it: Use medium distance.**


```text
EXAMPLE PROMPT
```

Her hands are clasped in front of her waist, fingers interlaced, still.

> [!WARNING]
> **Avoid: Close-ups of fingers.**


#### 11.30 Hand behind the back


**What it is: A hand hides an item.**


**How to write it: State which hand and object.**


```text
EXAMPLE PROMPT
```

Her left hand is behind her back holding a small box; the box stays hidden.

> [!WARNING]
> **Avoid: Revealing it unintentionally.**


#### 11.31 Write or sketch


**What it is: Hand moves a pen on paper.**


**How to write it: State direction and size.**


```text
EXAMPLE PROMPT
```

He writes three short lines with his right hand on the notebook.

> [!WARNING]
> **Avoid: Legible text; AI text is unreliable.**


#### 11.32 Use a phone


**What it is: Thumb scrolls or taps.**


**How to write it: State hand, thumb and screen visibility.**


```text
EXAMPLE PROMPT
```

She holds the phone in her left hand and taps the screen once with her right thumb. The screen is not visible.

> [!WARNING]
> **Avoid: Readable screen text.**


#### 11.33 Pour a liquid


**What it is: A bottle tilts and pours.**


**How to write it: State hand and stop point.**


```text
EXAMPLE PROMPT
```

He tilts the teapot with his right hand and pours into the cup; stops when the cup is half full.

> [!WARNING]
> **Avoid: Overflowing liquids.**


#### 11.34 Throw and catch


**What it is: An object travels through the air.**


**How to write it: State path and caught hand.**


```text
EXAMPLE PROMPT
```

She throws the apple lightly with her right hand; he catches it with his left.

> [!WARNING]
> **Avoid: Several objects.**


#### 11.35 Trembling hand


**What it is: A small shaking hand shows nerves.**


**How to write it: State intensity and which hand.**


```text
EXAMPLE PROMPT
```

His right hand trembles slightly as he holds the paper.

> [!WARNING]
> **Avoid: Violent shaking.**


#### 11.36 Counting fingers


**What it is: Fingers show numbers.**


**How to write it: State hand and number.**


```text
EXAMPLE PROMPT
```

She raises her right hand with three fingers extended: thumb, index and middle.

> [!WARNING]
> **Avoid: Extra or missing fingers.**


#### 11.37 Hand on shoulder


**What it is: A gentle touch of comfort.**


**How to write it: State whose hand and which shoulder.**


```text
EXAMPLE PROMPT
```

Person A places his right hand on Person B's left shoulder and holds it.

> [!WARNING]
> **Avoid: Hand clipping into the body.**


#### 11.38 Hand holding hands


**What it is: Two people hold hands.**


**How to write it: State which hands.**


```text
EXAMPLE PROMPT
```

Person A's right hand holds Person B's left hand as they walk side by side.

> [!WARNING]
> **Avoid: Four hands tangling.**

Hand safety tips:  1) Use medium shots, not extreme close-ups, unless the hand is the subject. 2) One hand per action. 3) Name the prop and keep it simple. 4) Say 'natural hand anatomy, five fingers' when hands are central. 5) Freeze the other hand.

## 12. Torso, legs and whole-body actions

Larger body actions need a clear starting pose, path and finishing pose. Keep the camera calm while the body moves. Describe feet and direction, not just 'walks'.

#### 12.1 Lean forward


**What it is: The upper body leans toward something.**


**How to write it: State degrees and what it shows.**


```text
EXAMPLE PROMPT
```

Seated at the table, he leans forward about 15 degrees toward Person B, hands on the table.

> [!WARNING]
> **Avoid: Falling forward.**


#### 12.2 Lean back


**What it is: The torso moves away.**


**How to write it: Add relaxed or defensive.**


```text
EXAMPLE PROMPT
```

She leans back slightly in the chair, arms folded.

> [!WARNING]
> **Avoid: Collapsing.**


#### 12.3 Turn the torso


**What it is: Shoulders and chest rotate without walking.**


**How to write it: State direction and the feet.**


```text
EXAMPLE PROMPT
```

He turns his torso toward the door, feet fixed in place.

> [!WARNING]
> **Avoid: Turning the whole body and moving the feet.**


#### 12.4 Shrug


**What it is: Shoulders lift briefly.**


**How to write it: State a single shrug.**


```text
EXAMPLE PROMPT
```

She gives one small shrug, then lets her shoulders drop.

> [!WARNING]
> **Avoid: Multiple shrugs.**


#### 12.5 Stand up


**What it is: From sitting to standing.**


**How to write it: State the start chair position, speed and end pose.**


```text
EXAMPLE PROMPT
```

He stands up slowly from the chair, pushes it back with his legs, and stands upright beside it.

> [!WARNING]
> **Avoid: Chair merging with the body.**


#### 12.6 Sit down


**What it is: From standing to seated.**


**How to write it: State the target seat.**


```text
EXAMPLE PROMPT
```

She sits down on the wooden chair and places her hands on her knees.

> [!WARNING]
> **Avoid: Hovering above the chair.**


#### 12.7 Walk forward


**What it is: Steady walking.**


**How to write it: State steps, speed and end.**


```text
EXAMPLE PROMPT
```

He walks three slow steps toward the camera and stops at arm's reach.

> [!WARNING]
> **Avoid: Endless walking.**


#### 12.8 Walk away from the camera


**What it is: The subject leaves toward the background.**


**How to write it: State direction.**


```text
EXAMPLE PROMPT
```

She walks away from the camera down the street, getting smaller.

> [!WARNING]
> **Avoid: Stuttering feet.**


#### 12.9 Walk across the frame


**What it is: Left-to-right or right-to-left.**


**How to write it: State frame direction and exit.**


```text
EXAMPLE PROMPT
```

He walks across the frame from frame-left to frame-right and exits.

> [!WARNING]
> **Avoid: Reversing direction.**


#### 12.10 Run


**What it is: Fast movement.**


**How to write it: State direction, camera follow and duration.**


```text
EXAMPLE PROMPT
```

The girl runs toward frame-right along the path while the camera tracks beside her.

> [!WARNING]
> **Avoid: Fast limbs with a close-up.**


#### 12.11 Stop suddenly


**What it is: Movement ends quickly.**


**How to write it: State the trigger.**


```text
EXAMPLE PROMPT
```

He stops abruptly as he hears a noise off-screen.

> [!WARNING]
> **Avoid: Sliding feet.**


#### 12.12 Step back / step forward


**What it is: A single step.**


**How to write it: State one step.**


```text
EXAMPLE PROMPT
```

She takes one step backward and holds.

> [!WARNING]
> **Avoid: A series of steps.**


#### 12.13 Turn around (full body)


**What it is: The person rotates to face the opposite way.**


**How to write it: State direction and end.**


```text
EXAMPLE PROMPT
```

He turns around to the right until he faces the camera, then holds.

> [!WARNING]
> **Avoid: A spin.**


#### 12.14 Kneel and crouch


**What it is: Body lowers.**


**How to write it: State end height.**


```text
EXAMPLE PROMPT
```

She kneels on her right knee beside the child.

> [!WARNING]
> **Avoid: Feet breaking through the floor.**


#### 12.15 Jump


**What it is: A short vertical hop.**


**How to write it: State count and landing.**


```text
EXAMPLE PROMPT
```

He jumps once and lands steadily on both feet.

> [!WARNING]
> **Avoid: Mid-air hover.**


#### 12.16 Stumble and recover


**What it is: A trip that is caught.**


**How to write it: State direction and support.**


```text
EXAMPLE PROMPT
```

She stumbles forward one step and catches the railing with her right hand.

> [!WARNING]
> **Avoid: Falling to the ground.**


#### 12.17 Fall and get up


**What it is: A dramatic fall.**


**How to write it: Break into two clips.**


```text
EXAMPLE PROMPT
```

Clip 1: he slips and falls onto his back. Clip 2: he pushes himself up with his hands.

> [!WARNING]
> **Avoid: Falling and rising in the same clip.**


#### 12.18 Dance (simple)


**What it is: Rhythmic movement.**


**How to write it: State a simple pattern.**


```text
EXAMPLE PROMPT
```

She sways side to side gently, arms relaxed.

> [!WARNING]
> **Avoid: Complex choreography.**


#### 12.19 Stretch or yawn


**What it is: A relaxed gesture.**


**How to write it: State arms and mouth.**


```text
EXAMPLE PROMPT
```

He stretches both arms above his head and yawns once.

> [!WARNING]
> **Avoid: Mouth distortion.**


#### 12.20 Posture change from slumped to upright


**What it is: A confident transformation.**


**How to write it: State two poses.**


```text
EXAMPLE PROMPT
```

She starts slumped in the chair and sits upright, shoulders back.

> [!WARNING]
> **Avoid: Sudden jumps.**


## 13. Facial expression and emotion

Emotion must be translated into what a camera can see: eyebrows, eyes, mouth, cheeks, posture and pace. Choose one dominant emotion per clip, one or two visible signs, and a level of intensity.
Schematic expression chart (brows, eyes, mouth)

| Intensity word | Use it for |
| --- | --- |
| Imperceptible | A tiny shift only in the eyes |
| Subtle | Quiet, realistic acting |
| Moderate | Clear to the viewer |
| Strong | Dramatic scenes |
| Exaggerated | Cartoons or comedy only |


#### 13.1 Neutral / listening


**What it is: A calm face while someone else speaks.**


**How to write it: Say 'lips closed, steady gaze, no nodding'.**


```text
EXAMPLE PROMPT
```

She listens silently, eyes on the speaker, lips closed, no nodding.

> [!WARNING]
> **Avoid: Leaving the face undirected, which can start smiling.**


#### 13.2 Subtle smile


**What it is: A small restrained smile.**


**How to write it: State the corners of the mouth and the eyes.**


```text
EXAMPLE PROMPT
```

A faint smile appears at the corners of her mouth; the eyes soften.

> [!WARNING]
> **Avoid: A broad grin.**


#### 13.3 Broad smile / laugh


**What it is: An open smile.**


**How to write it: State laughter and the body response.**


```text
EXAMPLE PROMPT
```

He laughs warmly, shoulders shaking, eyes crinkling.

> [!WARNING]
> **Avoid: Mouth distortion in close-ups.**


#### 13.4 Sadness


**What it is: Lowered eyes and softened face.**


**How to write it: State the visible signs.**


```text
EXAMPLE PROMPT
```

She looks down, brows slightly raised at the inner ends, lips pressed together.

> [!WARNING]
> **Avoid: Crying without request.**


#### 13.5 Tears


**What it is: A single tear or watery eyes.**


**How to write it: State amount and path.**


```text
EXAMPLE PROMPT
```

Her eyes become glossy and one tear runs down her right cheek.

> [!WARNING]
> **Avoid: Sobbing in a still shot.**


#### 13.6 Anger


**What it is: Tension without chaos.**


**How to write it: State the jaw, brow and gaze.**


```text
EXAMPLE PROMPT
```

His brows lower, jaw tightens, gaze hard and fixed on the other man.

> [!WARNING]
> **Avoid: Shouting without sound design.**


#### 13.7 Fear


**What it is: Wide eyes and frozen posture.**


**How to write it: State stillness and breathing.**


```text
EXAMPLE PROMPT
```

She freezes, eyes widening slightly toward the dark doorway, breath held.

> [!WARNING]
> **Avoid: Screaming faces.**


#### 13.8 Surprise


**What it is: A brief reaction.**


**How to write it: State duration.**


```text
EXAMPLE PROMPT
```

His eyes widen and his eyebrows lift for a moment, then settle.

> [!WARNING]
> **Avoid: Mouth wide open.**


#### 13.9 Suspicion


**What it is: Narrowed eyes and a held stare.**


**How to write it: State a tiny brow movement.**


```text
EXAMPLE PROMPT
```

She narrows her eyes slightly and studies the envelope; head still.

> [!WARNING]
> **Avoid: Squinting heavily.**


#### 13.10 Confusion


**What it is: Brows pull together.**


**How to write it: State two focus points.**


```text
EXAMPLE PROMPT
```

He looks from the map to the door, brows drawn together.

> [!WARNING]
> **Avoid: Head scratching unless wanted.**


#### 13.11 Disbelief


**What it is: A held stare.**


**How to write it: State the eyebrow movement.**


```text
EXAMPLE PROMPT
```

She stares for a beat, one eyebrow rising slightly.

> [!WARNING]
> **Avoid: Over-acting.**


#### 13.12 Disgust


**What it is: Nose wrinkles slightly.**


**How to write it: State the mouth.**


```text
EXAMPLE PROMPT
```

His nose wrinkles and his upper lip lifts slightly.

> [!WARNING]
> **Avoid: Vomiting.**


#### 13.13 Embarrassment


**What it is: Looking away with a half smile.**


**How to write it: State the gaze and the pause.**


```text
EXAMPLE PROMPT
```

She glances down and away, a small embarrassed smile, a moment of pause.

> [!WARNING]
> **Avoid: Face covering.**


#### 13.14 Guilt


**What it is: Avoiding eye contact.**


**How to write it: State the lowered eyes.**


```text
EXAMPLE PROMPT
```

He lowers his eyes after the question, jaw tight, silent.

> [!WARNING]
> **Avoid: Dramatic crying.**


#### 13.15 Relief


**What it is: Shoulders release.**


**How to write it: State a breath.**


```text
EXAMPLE PROMPT
```

Her shoulders drop and she exhales slowly; the tension leaves her face.

> [!WARNING]
> **Avoid: Smiling widely.**


#### 13.16 Determination


**What it is: Fixed gaze and stillness.**


**How to write it: State the gaze and jaw.**


```text
EXAMPLE PROMPT
```

He fixes his gaze on the exit, jaw set, expression firm; does not move yet.

> [!WARNING]
> **Avoid: Fighting poses.**


#### 13.17 Dry humour / sarcasm


**What it is: Underplayed expression.**


**How to write it: State a side-glance.**


```text
EXAMPLE PROMPT
```

A tiny unimpressed side-glance toward the camera-left, eyebrow lifted.

> [!WARNING]
> **Avoid: Big comic faces.**


#### 13.18 Flirtation


**What it is: A brief look and smile.**


**How to write it: State the eye contact and pause.**


```text
EXAMPLE PROMPT
```

She gives a brief half-smile, holds eye contact for a second, and looks away.

> [!WARNING]
> **Avoid: Posing for the lens.**


#### 13.19 Pain (restrained)


**What it is: A wince.**


**How to write it: State the face and the body.**


```text
EXAMPLE PROMPT
```

He winces slightly, eyes closing for a second, a sharp breath through the teeth.

> [!WARNING]
> **Avoid: Graphic injury.**


#### 13.20 Transition between two emotions


**What it is: A change over the clip.**


**How to write it: Name start and end emotion.**


```text
EXAMPLE PROMPT
```

Her face starts neutral and slowly softens into a small hopeful smile.

> [!WARNING]
> **Avoid: Three emotions in one shot.**


#### 13.21 Micro-expression


**What it is: A tiny flicker.**


**How to write it: Specify that nothing else moves.**


```text
EXAMPLE PROMPT
```

Only a slight tightening around the eyes; head, hands and torso remain still.

> [!WARNING]
> **Avoid: Big movements.**


## 14. Dialogue, voice, lip-sync and inner monologue

Video generators that create audio can produce speech with lip-sync. Control is best when you give one speaker, one short exact line, and a clear delivery description. Anything that must stay silent should be explicitly silent.

#### 14.1 One speaker, one exact line


**What it is: The most reliable dialogue prompt.**


**How to write it: Put the line in quotes and say 'says exactly'.**


```text
EXAMPLE PROMPT
```

Person A is the only speaker. She says exactly: "I thought you had left." Person B stays silent.

> [!WARNING]
> **Avoid: Long paragraphs of dialogue.**


#### 14.2 Short lines


**What it is: Short lines (under 12 words) sync best.**


**How to write it: Split long lines across clips.**


```text
EXAMPLE PROMPT
```

He says: "We leave at sunrise."

> [!WARNING]
> **Avoid: Entire speeches in one clip.**


#### 14.3 Voice description


**What it is: Pitch, texture, pace and emotion.**


**How to write it: Use four words.**


```text
EXAMPLE PROMPT
```

Voice: adult woman, medium pitch, warm, measured pace.

> [!WARNING]
> **Avoid: Contradictory descriptors.**


#### 14.4 Accent


**What it is: Specify only when needed.**


**How to write it: Name the accent plainly.**


```text
EXAMPLE PROMPT
```

A light British accent.

> [!WARNING]
> **Avoid: Stereotypes.**


#### 14.5 Whisper


**What it is: Quiet intimate speech.**


**How to write it: State a close microphone feel.**


```text
EXAMPLE PROMPT
```

She whispers: "Don't turn around." Quiet and close.

> [!WARNING]
> **Avoid: Shouting.**


#### 14.6 Shout


**What it is: Loud speech.**


**How to write it: State a reason and room.**


```text
EXAMPLE PROMPT
```

He shouts across the courtyard: "Wait!"

> [!WARNING]
> **Avoid: Long shouted lines.**


#### 14.7 Off-screen voice


**What it is: A voice from someone not visible.**


**How to write it: State direction and that the speaker is not shown.**


```text
EXAMPLE PROMPT
```

An unseen voice from frame-right says: "Stay where you are." Do not show the speaker.

> [!WARNING]
> **Avoid: The model inventing a face.**


#### 14.8 Voiceover narration


**What it is: A narrator, not lip-synced.**


**How to write it: Say 'voiceover only, lips closed'.**


```text
EXAMPLE PROMPT
```

Voiceover: "That was the day everything changed." The person's lips stay closed.

> [!WARNING]
> **Avoid: Putting narration in the character's mouth.**


#### 14.9 Inner monologue (silent visual)


**What it is: The character thinks but does not speak.**


**How to write it: Generate silent visuals and add the voice in editing.**


```text
EXAMPLE PROMPT
```

Silent visual only. Lips and jaw stay still. No whispering or mouthing. Add the thought as voiceover during editing.

> [!WARNING]
> **Avoid: Including the thought text in the visual prompt, which makes lips move.**


#### 14.10 Two-person conversation


**What it is: Turn-taking between two speakers.**


**How to write it: Use separate clips for each line.**


```text
EXAMPLE PROMPT
```

Clip 1: A says "Why now?" B silent. Clip 2: B says "Because you asked." A silent.

> [!WARNING]
> **Avoid: Both lines in one clip.**


#### 14.11 Reaction after a line


**What it is: The listener's face after hearing.**


**How to write it: State the silent reaction.**


```text
EXAMPLE PROMPT
```

After the line, Person B lowers her eyes and says nothing.

> [!WARNING]
> **Avoid: A new line from the listener.**


#### 14.12 Pauses and timing


**What it is: Silences carry weight.**


**How to write it: State a pause length.**


```text
EXAMPLE PROMPT
```

He pauses for one second before speaking.

> [!WARNING]
> **Avoid: Unspecified pacing.**


#### 14.13 Singing and humming


**What it is: Melody is hard to control.**


**How to write it: Keep it simple or add in editing.**


```text
EXAMPLE PROMPT
```

She hums softly with her lips closed.

> [!WARNING]
> **Avoid: Complete songs.**


#### 14.14 Languages and subtitles


**What it is: Non-English speech.**


**How to write it: State the language and spell the line.**


```text
EXAMPLE PROMPT
```

He says in Urdu: "Chalo, chalte hain."

> [!WARNING]
> **Avoid: Mixed languages in one line.**


### 14.15 Silence vocabulary


| Phrase | What it means |
| --- | --- |
| No dialogue | No voices; environment sounds may remain. |
| No music | No soundtrack; voices and ambience may remain. |
| Ambience only | Only the named environment sounds. |
| Completely silent | No voices, music, ambience or effects. |


## 15. Sound design

Sound is half of the picture. Describe it in layers: voices, ambience, effects and music. If the generator adds unwanted sound, produce silent video and design the sound in editing.

#### 15.1 Ambience


**What it is: The background sound of the place.**


**How to write it: Name two or three sounds.**


```text
EXAMPLE PROMPT
```

Soft wind, distant traffic and a faint dog bark.

> [!WARNING]
> **Avoid: 'Realistic sound'.**


#### 15.2 Footsteps


**What it is: Sound of walking.**


**How to write it: State surface and pace.**


```text
EXAMPLE PROMPT
```

Three slow footsteps on gravel.

> [!WARNING]
> **Avoid: Unlimited footsteps.**


#### 15.3 Object sounds


**What it is: Interaction sounds.**


**How to write it: Name the object and surface.**


```text
EXAMPLE PROMPT
```

A ceramic cup clinks once on a wooden table.

> [!WARNING]
> **Avoid: Overlapping noises.**


#### 15.4 Door, key and latch sounds


**What it is: Mechanical detail.**


**How to write it: State the count.**


```text
EXAMPLE PROMPT
```

A key turns once with a metallic click; the door creaks open.

> [!WARNING]
> **Avoid: Slamming sound without action.**


#### 15.5 Weather sounds


**What it is: Rain, thunder, wind.**


**How to write it: State intensity.**


```text
EXAMPLE PROMPT
```

Light rain on a tin roof; a distant rumble of thunder.

> [!WARNING]
> **Avoid: Storms for a quiet scene.**


#### 15.6 Magic and sci-fi sounds


**What it is: Fantasy sound effects.**


**How to write it: State one event and duration.**


```text
EXAMPLE PROMPT
```

A low magical hum rises for one second as the light appears and then fades.

> [!WARNING]
> **Avoid: Continuous noise.**


#### 15.7 Impact and action sounds


**What it is: Hits, crashes.**


**How to write it: Tie to a visible event.**


```text
EXAMPLE PROMPT
```

A single dull thud as the box hits the floor.

> [!WARNING]
> **Avoid: Cinematic stings with no visible cause.**


#### 15.8 No music


**What it is: Exclude soundtrack.**


**How to write it: Say it every time.**


```text
EXAMPLE PROMPT
```

No background music.

> [!WARNING]
> **Avoid: Hoping the model stays quiet.**


#### 15.9 Music mood (if wanted)


**What it is: A simple soundtrack.**


**How to write it: State instrument and mood.**


```text
EXAMPLE PROMPT
```

A soft solo piano, slow, melancholic, low volume.

> [!WARNING]
> **Avoid: Copyrighted song names.**


#### 15.10 Room tone and silence


**What it is: The subtle hum of a room.**


**How to write it: Use for tension.**


```text
EXAMPLE PROMPT
```

Only a faint room tone; no other sound.

> [!WARNING]
> **Avoid: Dead silence in all clips; the edit feels fake.**


#### 15.11 Separate audio workflow


**What it is: Generate visuals first, then sound.**


**How to write it: Plan the sound layers in a list.**


```text
EXAMPLE PROMPT
```

Visuals only. Add footsteps, rain and a single low piano note in editing.

> [!WARNING]
> **Avoid: Expecting perfect synced audio every time.**


## 16. One-person, two-person and group scenes

The more people in a frame, the more instructions you need. A solo shot needs one action. A two-shot needs roles. A group needs a role for every person, even if the role is 'stays still'.

### 16.1 Solo scenes


#### 16.1.1 Solo portrait, no movement


**What it is: A held portrait with only breathing.**


**How to write it: Freeze head, hands and lips.**


```text
EXAMPLE PROMPT
```

Medium close-up. The subject holds a calm expression, looking slightly off-camera to frame-left. No head, hand or body movement. Lips closed. No dialogue.

> [!WARNING]
> **Avoid: No freeze instruction.**


#### 16.1.2 Solo turns to look


**What it is: A single head turn.**


**How to write it: State angle, target and end.**


```text
EXAMPLE PROMPT
```

She turns her head slowly to frame-left and stops, looking at an off-screen person. Body still.

> [!WARNING]
> **Avoid: Adding a walk.**


#### 16.1.3 Solo walks


**What it is: One person walks.**


**How to write it: State steps and camera.**


```text
EXAMPLE PROMPT
```

Full shot. The man walks three slow steps forward and stops by the window. Camera tracks backward at the same speed.

> [!WARNING]
> **Avoid: Camera and subject both speeding.**


#### 16.1.4 Solo reacts to an off-screen sound


**What it is: A reaction to something unseen.**


**How to write it: State the direction.**


```text
EXAMPLE PROMPT
```

She hears something off-screen at frame-right; her eyes move toward it, and her expression becomes alert.

> [!WARNING]
> **Avoid: Showing the source.**


#### 16.1.5 Solo speaks to someone off-camera


**What it is: A direct dialogue.**


**How to write it: State the target and one line.**


```text
EXAMPLE PROMPT
```

Person A looks toward frame-left and says exactly: "I thought you had left." No camera eye contact.

> [!WARNING]
> **Avoid: Eye contact with the lens.**


#### 16.1.6 Solo with a prop


**What it is: A single object interaction.**


**How to write it: State hand and prop.**


```text
EXAMPLE PROMPT
```

Close-up of his right hand turning the key once in the lock.

> [!WARNING]
> **Avoid: Face wandering into frame.**


### 16.2 Two-person scenes

Keep the camera on one side of the axis between two people

#### 16.2.1 Two-shot with one speaker


**What it is: Both visible; one talks.**


**How to write it: State positions and silent listener.**


```text
EXAMPLE PROMPT
```

Medium two-shot. Person A at frame-left speaks one short line. Person B at frame-right listens silently. No position changes.

> [!WARNING]
> **Avoid: Both mouths moving.**


#### 16.2.2 Speaker and reaction


**What it is: Line and response.**


**How to write it: State the reaction.**


```text
EXAMPLE PROMPT
```

Person A says: "You knew?" Person B's eyes drop to the floor in guilt.

> [!WARNING]
> **Avoid: Two reactions.**


#### 16.2.3 Reverse shot of the listener


**What it is: Show the listener's face.**


**How to write it: Use OTS.**


```text
EXAMPLE PROMPT
```

Reverse over-the-shoulder from behind Person A. Person B listens silently with a guarded expression.

> [!WARNING]
> **Avoid: Flipping sides.**


#### 16.2.4 Silent tension


**What it is: Two people stare without speaking.**


**How to write it: State subtle eye changes.**


```text
EXAMPLE PROMPT
```

Both remain still. Their eyes meet; only a slight narrowing of A's eyes shows tension.

> [!WARNING]
> **Avoid: Random gestures.**


#### 16.2.5 One approaches the other


**What it is: A step forward.**


**How to write it: State distance and stop.**


```text
EXAMPLE PROMPT
```

Person A takes two slow steps toward Person B and stops at arm's length. B does not move.

> [!WARNING]
> **Avoid: Both walking.**


#### 16.2.6 One leaves; the other stays


**What it is: An exit.**


**How to write it: State the exit direction.**


```text
EXAMPLE PROMPT
```

Person A turns and exits frame-left. Person B stays and watches. Camera locked.

> [!WARNING]
> **Avoid: Camera follows A.**


#### 16.2.7 A comforting touch


**What it is: A hand on a shoulder.**


**How to write it: State hand and shoulder.**


```text
EXAMPLE PROMPT
```

Person A places his right hand on Person B's left shoulder and holds. B lowers her eyes.

> [!WARNING]
> **Avoid: Hugging.**


#### 16.2.8 A handover


**What it is: An object passes.**


**How to write it: State both hands.**


```text
EXAMPLE PROMPT
```

A hands a small envelope with his right hand; B takes it with her left.

> [!WARNING]
> **Avoid: Object duplicating.**


#### 16.2.9 Conversation with strict turn-taking


**What it is: Two lines in order.**


**How to write it: Use separate clips if timing is unreliable.**


```text
EXAMPLE PROMPT
```

Person A says "[LINE A]". Person B silent. Then B says "[LINE B]".

> [!WARNING]
> **Avoid: Overlapping speech.**


#### 16.2.10 Argument (restrained)


**What it is: A heated exchange.**


**How to write it: State volume and body.**


```text
EXAMPLE PROMPT
```

Person A speaks sharply but not loudly. Person B crosses her arms.

> [!WARNING]
> **Avoid: Shouting match in one clip.**


#### 16.2.11 Hug


**What it is: A simple embrace.**


**How to write it: State who initiates.**


```text
EXAMPLE PROMPT
```

Person A steps forward and hugs Person B, who raises both arms around A's back.

> [!WARNING]
> **Avoid: Body merging.**


#### 16.2.12 Eye contact moment


**What it is: Two people hold a gaze.**


**How to write it: State who looks away.**


```text
EXAMPLE PROMPT
```

They hold eye contact for two seconds; Person A looks away first.

> [!WARNING]
> **Avoid: Staring into the lens.**


### 16.3 Group scenes


#### 16.3.1 Three people, one speaker


**What it is: Roles in a trio.**


**How to write it: State positions.**


```text
EXAMPLE PROMPT
```

A at frame-left, B center, C frame-right. Only B speaks: "We leave at sunrise." A and C listen silently.

> [!WARNING]
> **Avoid: Group chatter.**


#### 16.3.2 Group reacts to one event


**What it is: Everyone looks.**


**How to write it: State direction.**


```text
EXAMPLE PROMPT
```

All five turn their heads toward the sound at frame-left. Bodies stay in place.

> [!WARNING]
> **Avoid: Walking.**


#### 16.3.3 One reacts; all others still


**What it is: A single reaction.**


**How to write it: State who.**


```text
EXAMPLE PROMPT
```

Only the woman at frame-right reacts: eyes widen. The other three stay still.

> [!WARNING]
> **Avoid: Everyone moving.**


#### 16.3.4 One leaves the group


**What it is: An exit from a cluster.**


**How to write it: State who and direction.**


```text
EXAMPLE PROMPT
```

Person C steps forward and exits frame-right. Others watch.

> [!WARNING]
> **Avoid: Everyone shifting.**


#### 16.3.5 Group listens to a leader


**What it is: A speech.**


**How to write it: State the audience's silence.**


```text
EXAMPLE PROMPT
```

The leader speaks one line. The others listen without nodding.

> [!WARNING]
> **Avoid: Cheering.**


#### 16.3.6 Layered reactions


**What it is: Foreground and background acts.**


**How to write it: State each layer.**


```text
EXAMPLE PROMPT
```

Foreground character still. Background: Person B lifts an eyebrow; Person C looks at the door.

> [!WARNING]
> **Avoid: Too many layers.**


#### 16.3.7 Crowd / extras


**What it is: Background people.**


**How to write it: State low activity.**


```text
EXAMPLE PROMPT
```

A small crowd moves naturally in the background. The main subject remains still in the foreground.

> [!WARNING]
> **Avoid: Background people interacting with the lead.**


#### 16.3.8 Safest approach for group dialogue


**What it is: Break scenes into clips.**


**How to write it: One clip per speaker plus reaction clips.**


```text
EXAMPLE PROMPT
```

Clip 1: A speaks. Clip 2: B reacts. Clip 3: B speaks. Same positions and light.

> [!WARNING]
> **Avoid: One prompt for the whole conversation.**


## 17. Props and object interaction

Props are fragile in video. They change shape, vanish or multiply. Keep them simple, name them clearly, and describe exactly which hand holds them and where they end.

#### 17.1 Naming a prop precisely


**What it is: Colour, material, size.**


**How to write it: Use plain nouns.**


```text
EXAMPLE PROMPT
```

A small brass key with a round head.

> [!WARNING]
> **Avoid: 'Something shiny'.**


#### 17.2 Prop continuity


**What it is: The prop must not change.**


**How to write it: State who holds it every time.**


```text
EXAMPLE PROMPT
```

The brass key stays in Person A's right hand throughout.

> [!WARNING]
> **Avoid: Letting the prop swap hands.**


#### 17.3 Prop reveal


**What it is: An object is shown.**


**How to write it: State the reveal method.**


```text
EXAMPLE PROMPT
```

The camera tilts down from her face to the key in her hand.

> [!WARNING]
> **Avoid: Sudden appearance.**


#### 17.4 Prop destruction


**What it is: A breaking object.**


**How to write it: Break the action into clips.**


```text
EXAMPLE PROMPT
```

Clip 1: the glass falls. Clip 2: the glass is on the floor, broken. Do not replay the fall.

> [!WARNING]
> **Avoid: A smashed glass reassembling.**


#### 17.5 Eating and drinking


**What it is: Food actions.**


**How to write it: State bite size.**


```text
EXAMPLE PROMPT
```

He lifts the cup in his right hand and takes one small sip.

> [!WARNING]
> **Avoid: Chewing close-ups.**


#### 17.6 Vehicles


**What it is: Cars and bikes.**


**How to write it: State direction and speed.**


```text
EXAMPLE PROMPT
```

A red car drives slowly from frame-left to frame-right along the street.

> [!WARNING]
> **Avoid: Warped wheels.**


#### 17.7 Weapons (non-graphic)


**What it is: Swords and staffs in fantasy.**


**How to write it: State a clear path.**


```text
EXAMPLE PROMPT
```

The knight raises his sword to shoulder height and holds it, pointed at frame-right.

> [!WARNING]
> **Avoid: Gore.**


#### 17.8 Screens and text


**What it is: Phones and signs.**


**How to write it: Avoid readable text.**


```text
EXAMPLE PROMPT
```

The phone screen glows; the text on it is not readable.

> [!WARNING]
> **Avoid: Exact lettering.**


#### 17.9 Clothing and accessories


**What it is: Hats, scarves, bags.**


**How to write it: State attachments.**


```text
EXAMPLE PROMPT
```

The leather bag hangs from her left shoulder and stays there.

> [!WARNING]
> **Avoid: Removing it by accident.**


#### 17.10 Doors, drawers and windows


**What it is: Furniture actions.**


**How to write it: State open amount.**


```text
EXAMPLE PROMPT
```

The wooden door opens inward to about 45 degrees and stops.

> [!WARNING]
> **Avoid: Doors opening both ways.**


## 18. Environment, weather and background motion

The environment is where safe motion lives. Leaves, water, clouds and crowds can add life without risking the characters.

#### 18.1 Wind


**What it is: Light breeze on grass, hair and cloth.**


**How to write it: State direction and strength.**


```text
EXAMPLE PROMPT
```

A gentle breeze moves the grass toward frame-right.

> [!WARNING]
> **Avoid: Gale force.**


#### 18.2 Rain


**What it is: Falling water.**


**How to write it: State intensity and surfaces.**


```text
EXAMPLE PROMPT
```

Light rain falls, ripples spread on the puddle.

> [!WARNING]
> **Avoid: Soaking the characters.**


#### 18.3 Snow


**What it is: Falling flakes.**


**How to write it: State size and density.**


```text
EXAMPLE PROMPT
```

Soft snowflakes drift slowly down.

> [!WARNING]
> **Avoid: Blizzard.**


#### 18.4 Fire and candle light


**What it is: Flickering.**


**How to write it: State source.**


```text
EXAMPLE PROMPT
```

The candle flame flickers slightly, warm light on her face.

> [!WARNING]
> **Avoid: Large fire.**


#### 18.5 Water and waves


**What it is: Sea, river, lake.**


**How to write it: State motion type.**


```text
EXAMPLE PROMPT
```

Small waves roll toward the shore.

> [!WARNING]
> **Avoid: Tsunami.**


#### 18.6 Clouds and sky


**What it is: Time-lapse feel.**


**How to write it: State speed.**


```text
EXAMPLE PROMPT
```

Slow clouds drift across the sky.

> [!WARNING]
> **Avoid: Rapid time-lapse.**


#### 18.7 Smoke, steam and dust


**What it is: Atmosphere.**


**How to write it: State rise and drift.**


```text
EXAMPLE PROMPT
```

Steam rises from the cup and drifts to the left.

> [!WARNING]
> **Avoid: Hiding the subject.**


#### 18.8 Street traffic and city life


**What it is: Moving background.**


**How to write it: State low or medium.**


```text
EXAMPLE PROMPT
```

Blurry traffic moves in the background; pedestrians pass at a distance.

> [!WARNING]
> **Avoid: People walking through the lead.**


#### 18.9 Forest and nature


**What it is: Trees, leaves, birds.**


**How to write it: State specific motion.**


```text
EXAMPLE PROMPT
```

Leaves sway; a bird crosses the sky at frame-right.

> [!WARNING]
> **Avoid: Animals attacking.**


#### 18.10 Time of day change


**What it is: Light shifts.**


**How to write it: State a slow shift.**


```text
EXAMPLE PROMPT
```

The sky slowly changes from dusk to night over the clip.

> [!WARNING]
> **Avoid: Sudden jumps.**


#### 18.11 Interior ambience


**What it is: Rooms.**


**How to write it: State a clock, curtains, a light.**


```text
EXAMPLE PROMPT
```

A ceiling fan turns slowly; the curtain sways slightly.

> [!WARNING]
> **Avoid: Furniture moving.**


## 19. Action, fights, magic and creatures

Fast action is the most difficult thing to prompt. Limbs cross, contact fails and the camera loses the subject. The solution: break any sequence into readable beats of one action each, then edit the beats together.

#### 19.1 A simple action beat


**What it is: One attack or dodge.**


**How to write it: State start positions and end.**


```text
EXAMPLE PROMPT
```

Person A steps back once to avoid B's single swing. A stops near the wall. B stays in place. No counterattack.

> [!WARNING]
> **Avoid: Entire fights.**


#### 19.2 Attack direction


**What it is: The path of a strike.**


**How to write it: State left to right.**


```text
EXAMPLE PROMPT
```

The creature's left arm swings from frame-right toward frame-left without touching the hero.

> [!WARNING]
> **Avoid: Contact with the model unsure.**


#### 19.3 Dodge


**What it is: Avoiding a hit.**


**How to write it: State the dodge.**


```text
EXAMPLE PROMPT
```

The hero ducks once beneath the arm and ends in a crouch.

> [!WARNING]
> **Avoid: Second strike.**


#### 19.4 Block


**What it is: A raised guard.**


**How to write it: State the object.**


```text
EXAMPLE PROMPT
```

She raises her sword in both hands to block the downward strike; sparks fly.

> [!WARNING]
> **Avoid: Unclear contact.**


#### 19.5 Punch or kick (non-graphic)


**What it is: A single blow.**


**How to write it: State the target and the end.**


```text
EXAMPLE PROMPT
```

He throws one right punch; the opponent steps back.

> [!WARNING]
> **Avoid: Combos.**


#### 19.6 Magic projectile


**What it is: A spell.**


**How to write it: State the path and the hit.**


```text
EXAMPLE PROMPT
```

A blue light forms in her right palm, travels in a straight line, hits the stone and flashes briefly.

> [!WARNING]
> **Avoid: Explosions.**


#### 19.7 Magic aura


**What it is: A glowing field.**


**How to write it: State the colour and growth.**


```text
EXAMPLE PROMPT
```

A soft golden glow grows around his hands and then fades.

> [!WARNING]
> **Avoid: Full-body fire.**


#### 19.8 Dragon or giant creature


**What it is: Large beings.**


**How to write it: State scale, head and wings.**


```text
EXAMPLE PROMPT
```

A giant dragon lowers its head toward the people below. Wings folded, tail still. Low-angle wide shot.

> [!WARNING]
> **Avoid: Fire and flight at once.**


#### 19.9 Creature walk


**What it is: Heavy steps.**


**How to write it: State camera shake.**


```text
EXAMPLE PROMPT
```

The giant takes one heavy step; the ground shakes slightly.

> [!WARNING]
> **Avoid: Fast sprints.**


#### 19.10 Explosions and debris


**What it is: Destruction.**


**How to write it: Keep small.**


```text
EXAMPLE PROMPT
```

A small puff of dust and a few pebbles rise from the blast.

> [!WARNING]
> **Avoid: Giant fireballs.**


#### 19.11 Chase scenes


**What it is: Running after someone.**


**How to write it: State the camera.**


```text
EXAMPLE PROMPT
```

Rear tracking shot following the runner along the alley, the pursuer visible far behind.

> [!WARNING]
> **Avoid: Several crossing paths.**


#### 19.12 Breaking a fight into clips


**What it is: Beats.**


**How to write it: A to E.**


```text
EXAMPLE PROMPT
```

A: stances. B: one strike. C: dodge. D: reaction. E: aftermath.

> [!WARNING]
> **Avoid: One long clip.**

Action rule:  The camera should see the action clearly. If you cannot describe it in two short sentences, split it into two clips.

## 20. Continuity and multi-clip workflow

Continuity means that shots look like they belong to the same moment: same faces, same clothes, same props, same light, same positions. Because every clip is generated separately, you must carry facts from clip to clip yourself.
Each clip ends in a state that becomes the next clip's starting state

#### 20.1 Identity continuity


**What it is: The same face and clothes.**


**How to write it: Use the same reference image and repeat critical details.**


```text
EXAMPLE PROMPT
```

Preserve the exact face, hairstyle and green coat from the reference.

> [!WARNING]
> **Avoid: New descriptions each time.**


#### 20.2 Position continuity


**What it is: Everyone stays on the same side.**


**How to write it: Restate frame positions.**


```text
EXAMPLE PROMPT
```

Person A stays at frame-left; Person B at frame-right.

> [!WARNING]
> **Avoid: Omitting positions.**


#### 20.3 Screen direction


**What it is: Movement direction stays consistent.**


**How to write it: Repeat the direction.**


```text
EXAMPLE PROMPT
```

He continues walking toward frame-right.

> [!WARNING]
> **Avoid: Reversing direction between shots.**


#### 20.4 The 180-degree rule


**What it is: Cameras stay on one side of the line between subjects.**


**How to write it: State the axis side.**


```text
EXAMPLE PROMPT
```

Camera stays on the same side of the axis; A remains on frame-left.

> [!WARNING]
> **Avoid: Crossing the axis.**


#### 20.5 Prop continuity


**What it is: Objects stay.**


**How to write it: State who holds what.**


```text
EXAMPLE PROMPT
```

The phone stays in A's left hand.

> [!WARNING]
> **Avoid: Vanishing props.**


#### 20.6 Action continuity


**What it is: Do not repeat finished events.**


**How to write it: State what is already done.**


```text
EXAMPLE PROMPT
```

The door is already open. Do not open it again.

> [!WARNING]
> **Avoid: Replays.**


#### 20.7 Lighting continuity


**What it is: Same light.**


**How to write it: Repeat the sentence.**


```text
EXAMPLE PROMPT
```

Same soft daylight from frame-left, same colour grade.

> [!WARNING]
> **Avoid: Exposure jumps.**


#### 20.8 Location continuity


**What it is: Same room.**


**How to write it: List fixed items.**


```text
EXAMPLE PROMPT
```

Same room: window left, bookshelf right, wooden table center.

> [!WARNING]
> **Avoid: New furniture.**


#### 20.9 Stable ending pose


**What it is: Clean cuts.**


**How to write it: End with a hold.**


```text
EXAMPLE PROMPT
```

At the end the subject holds still for one second.

> [!WARNING]
> **Avoid: Ending mid-motion.**


#### 20.10 Using the last frame as the next reference


**What it is: Image-to-video chaining.**


**How to write it: Save the last frame and use it.**


```text
EXAMPLE PROMPT
```

Use the last frame of Clip 1 as the reference for Clip 2.

> [!WARNING]
> **Avoid: Generating from the original image again.**


#### 20.11 Matching eyelines across shots


**What it is: Eyes must point correctly.**


**How to write it: State directions.**


```text
EXAMPLE PROMPT
```

A looks toward frame-right; B looks toward frame-left.

> [!WARNING]
> **Avoid: Both looking the same way.**


#### 20.12 A shot list


**What it is: A plan.**


**How to write it: List shots in order.**


```text
EXAMPLE PROMPT
```

1 wide, 2 MCU A, 3 reaction B, 4 insert hand, 5 wide.

> [!WARNING]
> **Avoid: Improvising each clip.**


## 21. Genre recipes

Different video types need different prompt habits. Here are short recipes for the most common ones. Each recipe tells you what to prioritise.

#### 21.1 Product advertisement


**What it is: A product displayed beautifully.**


**How to write it: Preserve the shape, colour and labels; use clean light and a slow camera.**


```text
EXAMPLE PROMPT
```

Use the product reference. Preserve exact shape and label. The bottle rotates slowly on a clean grey surface; soft studio light; static camera. No added text.

> [!WARNING]
> **Avoid: Changing the logo.**


#### 21.2 Talking-head presenter


**What it is: A person speaks to the camera.**


**How to write it: Medium close-up, steady, one line per clip.**


```text
EXAMPLE PROMPT
```

Medium close-up of the presenter looking into the lens. She says exactly: "[LINE]" in a warm, clear voice. Static camera. No music.

> [!WARNING]
> **Avoid: Over-long scripts.**


#### 21.3 Fantasy and creature scenes


**What it is: Dragons, magic, armour.**


**How to write it: Scale with low angles.**


```text
EXAMPLE PROMPT
```

Low-angle wide shot: a dragon lowers its head toward the hero. Wings folded. Slow push-in.

> [!WARNING]
> **Avoid: Too many effects.**


#### 21.4 Comedy


**What it is: Timing and underplayed faces.**


**How to write it: Use locked cameras and dry reactions.**


```text
EXAMPLE PROMPT
```

Static two-shot. Person A makes a ridiculous announcement; Person B gives a tiny unimpressed side-glance.

> [!WARNING]
> **Avoid: Overacting.**


#### 21.5 Horror and suspense


**What it is: Slow tension.**


**How to write it: Static camera, low light, little motion.**


```text
EXAMPLE PROMPT
```

Static wide shot of a dark hallway. A door at the end slowly opens by a few centimetres. No sound except faint room tone.

> [!WARNING]
> **Avoid: Jump scares in one clip.**


#### 21.6 Romance and drama


**What it is: Emotional looks.**


**How to write it: Close-ups, soft light, restraint.**


```text
EXAMPLE PROMPT
```

Close-up of Person A as she looks at Person B; a faint smile; soft golden light.

> [!WARNING]
> **Avoid: Exaggerated kissing.**


#### 21.7 Documentary and travel


**What it is: Observational realism.**


**How to write it: Handheld and natural light.**


```text
EXAMPLE PROMPT
```

Subtle handheld shot of a fisherman pulling a net at dawn. Natural light, ambient sea sound.

> [!WARNING]
> **Avoid: Stylised grading.**


#### 21.8 Music video style


**What it is: Rhythm and mood.**


**How to write it: Use repeated motifs and clean movement.**


```text
EXAMPLE PROMPT
```

Slow arc around the singer under blue stage lights, mouth closed.

> [!WARNING]
> **Avoid: Lip-sync demands.**


#### 21.9 Social media short


**What it is: Fast hooks.**


**How to write it: Vertical format, centered subject.**


```text
EXAMPLE PROMPT
```

Vertical 9:16. Close-up of the subject winking at the lens. Bright high-key light.

> [!WARNING]
> **Avoid: Wide frames.**


#### 21.10 Animation and stylised looks


**What it is: Non-photoreal.**


**How to write it: State one style.**


```text
EXAMPLE PROMPT
```

Stylised 3D animation look, soft colours, smooth movement.

> [!WARNING]
> **Avoid: Combining photoreal and cartoon.**


## 22. Troubleshooting guide

When a generation fails, do not rewrite everything. Name the failure, find its likely cause, apply the matching fix, and regenerate. Change one thing at a time.

#### 22.1 The model invents extra actions

Likely cause: The prompt contains several events or vague verbs.
Fix: Reduce to one action. Give a start state and an end state.
FIX WORDING
ONE action only: she turns her head to the door and stops. Nothing else moves.

#### 22.2 A silent character moves their lips

Likely cause: Dialogue or thought text appears in the prompt.
Fix: Remove the text. Say lips closed. Add voice later.
FIX WORDING
Lips and jaw stay completely still. No speaking, whispering or mouthing.

#### 22.3 The character looks into the camera

Likely cause: No gaze target was given.
Fix: Name an exact target.
FIX WORDING
She looks at the off-screen speaker at frame-left. She never looks into the lens.

#### 22.4 The wrong person speaks

Likely cause: Several people were visible without a named speaker.
Fix: Name one speaker and silence the others.
FIX WORDING
Only Person B speaks. Person A and Person C stay silent with lips closed.

#### 22.5 The camera moves when it should be still

Likely cause: Camera was unspecified.
Fix: State locked-off.
FIX WORDING
Static locked-off camera. No zoom, no pan, no drift.

#### 22.6 The camera moves the wrong way

Likely cause: Direction was missing.
Fix: State direction and amount.
FIX WORDING
Slow pan right about 15 degrees. No other camera movement.

#### 22.7 Left and right swap

Likely cause: Mixed systems of left and right.
Fix: Use frame terms and repeat them.
FIX WORDING
Person A stays at frame-left. Person B stays at frame-right in every shot.

#### 22.8 Face or clothing changes

Likely cause: Weak reference or long clip.
Fix: Repeat key details and shorten the clip.
FIX WORDING
Preserve the exact face, black hair and yellow raincoat from the reference.

#### 22.9 The prop changes shape or disappears

Likely cause: Prop not anchored.
Fix: State hand, shape and keep a close shot.
FIX WORDING
The brass key stays in A's right hand; its shape does not change.

#### 22.10 The previous action repeats

Likely cause: The new prompt reuses the old action.
Fix: State it as complete.
FIX WORDING
The glass has already fallen. Do not show it falling again.

#### 22.11 The model adds music

Likely cause: Default soundtrack behaviour.
Fix: Add no music; consider silent generation.
FIX WORDING
No background music, no sound effects. Ambience only.

#### 22.12 The shot is too busy

Likely cause: Too many moving things.
Fix: Cut to one subject and one background motion.
FIX WORDING
Only the curtain moves. Everything else is frozen.

#### 22.13 Emotion is exaggerated

Likely cause: No intensity control.
Fix: Use subtle and one visible sign.
FIX WORDING
Restrained realistic acting; only a slight brow tension.

#### 22.14 POV shows the POV character

Likely cause: Ambiguous viewpoint.
Fix: State that the character is outside the frame.
FIX WORDING
True POV from her eyes. She is completely outside the frame.

#### 22.15 Hands look wrong

Likely cause: Hands are small in frame or complex action.
Fix: Use a simpler gesture or a closer insert.
FIX WORDING
Natural hand anatomy, five fingers. The right hand simply holds the cup.

#### 22.16 The subject walks in place or glides

Likely cause: Unclear path.
Fix: Give step count and end.
FIX WORDING
He takes three steps forward, feet touching the ground, and stops.

#### 22.17 Lip-sync is off

Likely cause: Line too long or too many speakers.
Fix: Shorten the line.
FIX WORDING
Short line under 10 words, one speaker, close-up.

#### 22.18 Blurry or melted faces

Likely cause: Fast motion or a very wide shot.
Fix: Slow down, use a medium shot.
FIX WORDING
Slow natural motion; keep the face sharp and stable.

#### 22.19 Background people start interacting

Likely cause: Crowd not controlled.
Fix: State that they ignore the lead.
FIX WORDING
Background people move naturally but do not look at or approach the main subject.

#### 22.20 The clip starts with the wrong pose

Likely cause: The image does not match the plan.
Fix: Describe the exact first pose.
FIX WORDING
At the start she is seated with both hands flat on the table.

#### 22.21 Too many constraints are ignored

Likely cause: Prompt too long.
Fix: Keep the top priorities.
FIX WORDING
Priorities: identity, main action, camera, silence. Remove other lines.

#### 22.22 Motion looks robotic

Likely cause: Instant start and stop.
Fix: Ease in and out.
FIX WORDING
Starts from stillness and eases into a natural pace.

#### 22.23 Scene changes during a camera move

Likely cause: Too large a move.
Fix: Reduce the move.
FIX WORDING
A tiny 10-degree pan only. All subjects frozen.

#### 22.24 Colour or lighting shifts

Likely cause: Light was not locked.
Fix: Repeat the light.
FIX WORDING
Same warm lamp light from frame-right. No colour shift.

#### 22.25 Text and logos come out garbled

Likely cause: Models draw text poorly.
Fix: Avoid text or add it in editing.
FIX WORDING
No readable text on screen. Add captions in editing.

## 23. Template library

Copy a template, replace the bracketed words and delete any line you do not need.

#### T1. Image inventory

TEMPLATE
IMAGE INVENTORY
Subjects: [count and labels]
Person A: [clothes], [position], [pose], [facing], [gaze]
Person B: [clothes], [position], [pose], [facing], [gaze]
Objects: [prop], [location/hand]
Environment: [place], [time]
Light: [direction], [softness], [colour]
Focus: [sharp], [blurred]
Unknown: [do not invent]

#### T2. Basic image-to-video

TEMPLATE
Animate the provided reference image.
Start: [pose and positions].
Action: [one action].
End: [final pose].
Camera: [shot size], [angle], [static or one move].
Performance: [gaze], [one emotion], [intensity].
Audio: [dialogue / ambience / silent].
Preserve: faces, clothing, props, light, layout.
Do not: [two or three items].

#### T3. Solo silent shot

TEMPLATE
Use the reference. [SUBJECT] stays in [POSE].
Shot: [SIZE], [ANGLE], [CAMERA].
Only movement: [one small movement].
Expression: [emotion], subtle.
Gaze: [target]; never the lens.
Lips closed. No speech. No music.

#### T4. Solo speaking shot

TEMPLATE
[SUBJECT] is the only speaker and says exactly: "[LINE]".
Looks toward [TARGET], not the lens.
Shot: [SIZE/ANGLE]. Camera: [MOVE].
Voice: [pitch], [texture], [pace], [emotion].
No added words, no other speaker, no music.

#### T5. Inner monologue (silent visual)

TEMPLATE
Visual only. [SUBJECT] [POSE/ACTION].
Lips and jaw completely still. No speech, whisper or mouthing.
Camera: [SHOT/ANGLE/MOVE].
Expression: [one visible sign].
Add as voiceover in editing: "[THOUGHT]".

#### T6. Two-shot dialogue

TEMPLATE
Person A frame-[LEFT/RIGHT], Person B frame-[LEFT/RIGHT], [DISTANCE] apart.
A says exactly: "[LINE]". B silent.
Shot: [TWO-SHOT/OTS]. Camera: [STATIC/MOVE].
Preserve positions and screen direction. No overlapping speech.

#### T7. Listener reaction

TEMPLATE
Reaction close-up of [LISTENER] after an off-screen line.
The listener does not speak. Reaction: [ONE VISIBLE EXPRESSION].
Gaze: [TARGET]. Lips closed.
Camera: [STATIC]. No new action, no music.

#### T8. True POV

TEMPLATE
True POV from [CHARACTER]'s eyes. The POV character is outside the frame.
Visible: [SUBJECT] at [POSITION].
Camera: [STATIC/SMALL MOVE].
No third-person view; no new events.

#### T9. Over-the-shoulder

TEMPLATE
OTS from behind [CHARACTER]'s [LEFT/RIGHT] shoulder, foreground shoulder [soft/sharp].
Focus: [PERSON] at [POSITION].
Camera: [STATIC/MOVE]. Same distance and screen direction.

#### T10. Hidden observer

TEMPLATE
Camera hidden behind [TREE/DOOR/FOLIAGE]. Look through the gap toward [SUBJECT].
The observer does not appear.
Shot: [SIZE]. Camera: [STATIC/MOVE].
No camera eye contact.

#### T11. Group scene

TEMPLATE
Positions: A frame-left, B center, C frame-right.
Only [SPEAKER] speaks: "[LINE]".
[LISTENER 1]: [REACTION]. [LISTENER 2]: stays still and silent.
Shot: [SIZE/ANGLE]. Camera: [MOVE].
No overlapping speech.

#### T12. Camera move only

TEMPLATE
Keep the reference scene unchanged.
Camera alone moves from [START VIEW] to [END VIEW] in a slow [PAN/TILT/DOLLY/TRACK/ARC].
All people, props and light stay fixed.
One continuous shot, no cuts.

#### T13. Hand action insert

TEMPLATE
Close insert of [OBJECT] in [CHARACTER]'s [RIGHT/LEFT] hand.
Action: [ONE ACTION].
End: [FINAL POSE].
Natural hand anatomy, five fingers. The other hand stays still.
Static camera. No extra objects.

#### T14. Walking shot

TEMPLATE
[SUBJECT] walks [N] steps from [START] to [END], [PACE].
Camera: [TRACKING/STATIC].
The subject looks at [TARGET].
Stops at [END POSE]. No running.

#### T15. Head and eye action

TEMPLATE
Only the [EYES/HEAD] move: from [START TARGET] to [END TARGET], [SPEED].
Everything else stays frozen.
Shot: [SIZE]. Camera static. No speech.

#### T16. Emotion shot

TEMPLATE
[SUBJECT] shows [EMOTION] through [VISIBLE SIGNS]. Intensity: [SUBTLE/MODERATE].
Shot: [CLOSE-UP/MCU]. Camera: [STATIC/PUSH-IN].
No exaggeration. No dialogue.

#### T17. Environment-only motion

TEMPLATE
Keep the image unchanged. Only [WIND/WATER/SMOKE/RAIN] moves, [DIRECTION], [STRENGTH].
All people frozen.
Static camera. Ambience: [SOUNDS]. No music.

#### T18. Fight beat

TEMPLATE
Start: [A] at [POS], [B] at [POS].
One action: [ATTACK/DODGE] from [DIRECTION] toward [TARGET].
Result: [HIT/MISS/STOP].
Camera: [SIZE/ANGLE/MOVE]. No second attack, no new characters.

#### T19. Continuation

TEMPLATE
Continue from the last frame of the previous clip.
Already completed: [EVENT].
Start: [POSES].
New action only: [ONE ACTION].
Do not replay the completed event.
Preserve faces, clothes, light, screen direction.

#### T20. Establishing shot

TEMPLATE
Establish [LOCATION] from the reference.
Camera: [WIDE], [STATIC/SLOW MOVE].
Environment motion only: [MIST/LEAVES/RAIN].
No new characters. [AUDIO RULE].

#### T21. Product showcase

TEMPLATE
Use the product reference. Preserve shape, material, colour and labels.
The product [ROTATES SLOWLY/STAYS STILL].
Background: [CLEAN TYPE]. Soft studio light.
No added text or logos.

#### T22. Presenter

TEMPLATE
Medium close-up of the presenter, looking into the lens.
Says exactly: "[SCRIPT]" in a [TONE] voice at a [PACE] pace.
Steady framing. No music. No scene change.

#### T23. Transition shot

TEMPLATE
Same location and light. Camera [PANS/RACK FOCUSES/PULLS BACK] to reveal [ALREADY-PRESENT DETAIL].
No new event. One continuous shot.

#### T24. Ending pose

TEMPLATE
The subject completes [ACTION] and settles into [FINAL POSE].
Hold for the final [N] seconds.
Camera [STATIC]. Preserve identity and props.

#### T25. Shot list

TEMPLATE
SHOT 1: [SIZE] [ANGLE] - [WHAT]
SHOT 2: [SIZE] [ANGLE] - [WHAT]
SHOT 3: [SIZE] [ANGLE] - [WHAT]
Continuity: [FACES], [CLOTHES], [PROPS], [LIGHT], [DIRECTION].

## 24. Worked examples from image to final prompt

Each example follows the same steps: describe the image, choose one action, choose the camera, add acting and sound, then lock continuity.

### Example 1: A quiet reaction

Reference: Image: a man in a dark coat stands at frame-right reading a paper in a dim room; a woman watches from a doorway at frame-left.
Goal: Goal: show that the woman pays closer attention.
FINAL PROMPT
Animate the provided image. Preserve both people, the paper, the doorway and the lamp light.
The man stays still, looking at the paper in his hands.
The woman, partly hidden in the doorway at frame-left, slowly shifts her eyes from the man's face to the paper.
Static medium-wide shot, eye-level.
No dialogue. No music. No new objects. She never looks into the lens.

### Example 2: Dialogue as two clips

Reference: Image: two friends on a bench; A frame-left, B frame-right.
Goal: Goal: a short disappointed line and a silent reaction.
FINAL PROMPT
CLIP 1 - Medium close-up of Person A looking toward B off-camera right. A says exactly: "You should have told me." Controlled, disappointed voice. Static. No music.

CLIP 2 - Reaction close-up of Person B, silent, lowering her eyes for a moment then looking back toward A. Lips closed. Static. No dialogue.

### Example 3: A precise hand action

Reference: Image: a woman seated at a table with a cup in front of her.
Goal: Goal: one clear hand action.
FINAL PROMPT
Medium shot. The woman sits at the table. Her right hand picks up the white cup, lifts it slowly to chest height and holds it there. Her left hand stays flat on the table. Natural hand anatomy, five fingers. Eyes remain on the cup. Static camera. Ambient room tone only.

### Example 4: Camera move only

Reference: Image: three travellers by a campfire at night.
Goal: Goal: reveal the tent behind them.
FINAL PROMPT
Keep the image unchanged. All people stay completely still. The camera slowly pans right about 15 degrees to reveal the tent already visible at frame-right. No zoom, no cuts, no new objects. Crackling fire sound only. No music.

### Example 5: A walking exit

Reference: Image: a man in a doorway looking into a corridor.
Goal: Goal: he leaves frame-right.
FINAL PROMPT
Wide shot, static camera. The man turns toward frame-right and walks out of the frame in four steps. The corridor stays empty for the last second. No dialogue. Footsteps on a wooden floor.

### Example 6: Emotional close-up

Reference: Image: close portrait of a young woman, neutral face, looking at a window.
Goal: Goal: a hopeful smile.
FINAL PROMPT
Close-up. Her face starts neutral and slowly softens into a small hopeful smile. Eyes remain on the window at frame-left. Only face and eyes move; head and shoulders stay still. Soft daylight. No dialogue.

### Example 7: Fantasy creature scale

Reference: Image: a hero standing before a dragon in a cave.
Goal: Goal: show the dragon's scale.
FINAL PROMPT
Low-angle wide shot. The dragon lowers its head toward the hero. Wings folded, tail still. The hero stands still, shoulders tense. Slow push-in. A deep low breath sound. No fire, no roar.

### Example 8: Product shot

Reference: Image: a perfume bottle on a white surface.
Goal: Goal: premium feeling.
FINAL PROMPT
Preserve the exact bottle shape, glass colour and label. The bottle rotates 30 degrees to the right, slowly. Clean soft studio light, shallow depth of field. Static camera. No text added. No music.

## 25. Glossary, checklists and quick-reference tables


### 25.1 Glossary


| Term | Meaning |
| --- | --- |
| Action beat | One clear unit of physical action. |
| Axis | The imaginary line between two subjects. |
| Blocking | Where subjects stand, sit and move. |
| Bokeh | Soft out-of-focus light circles. |
| Continuity | Consistency across shots. |
| Dolly | The camera physically moves closer or farther. |
| Dutch angle | A tilted horizon. |
| Establishing shot | A wide shot of the location. |
| Eyeline | The direction a character looks. |
| Frame-left / frame-right | Left and right as the audience sees. |
| Insert | A close detail shot. |
| Look room | Open space in the direction of the gaze. |
| OTS | Over-the-shoulder shot. |
| Pan | Camera rotates sideways. |
| POV | Camera as a character's eyes. |
| Rack focus | Focus changes between depths. |
| Reaction shot | A shot showing someone's response. |
| Tilt | Camera rotates up or down. |
| Truck | Camera slides sideways. |
| Voiceover | A voice heard over images. |


### 25.2 Quick reference: shot size


| Shot | Frame shows | Best for |
| --- | --- | --- |
| Extreme wide | Location | Scale |
| Wide | Full body + space | Positions |
| Full | Head to toe | Costume and walking |
| Medium | Waist up | Dialogue |
| Medium close-up | Chest up | Emotion |
| Close-up | Face | Strong emotion |
| Extreme close-up | Eyes or detail | Tension |
| Insert | Object | Story information |


### 25.3 Quick reference: camera angle


| Angle | Feeling |
| --- | --- |
| Eye-level | Neutral |
| High | Small, exposed |
| Low | Powerful |
| Dutch | Unease |
| OTS | Conversation |
| POV | Personal |
| Top-down | Layout |


### 25.4 Quick reference: camera movement


| Movement | What moves | Effect |
| --- | --- | --- |
| Static | Nothing | Control |
| Pan | Camera rotates sideways | Reveal |
| Tilt | Camera rotates vertically | Reveal height |
| Dolly in | Camera moves forward | Focus |
| Dolly out | Camera moves back | Isolation |
| Truck | Camera slides sideways | Follow |
| Arc | Camera circles | Drama |
| Crane | Camera rises | Scale |
| Handheld | Small shake | Realism |


### 25.5 Quick reference: body actions


| Part | Verbs |
| --- | --- |
| Eyes | shift, widen, narrow, blink, hold |
| Head | turn, tilt, nod, shake, lift |
| Hands | raise, point, hold, pick up, place, wave |
| Torso | lean, turn, shrug |
| Legs | step, walk, run, stop, kneel |


### 25.6 Pre-generation checklist

Did I describe what is actually visible?
Did I label each person and give frame positions?
Did I define one main action with start and end?
Did I choose shot size and angle?
Did I choose one camera movement or static?
Did I state the exact gaze target?
For every hand action, did I say which hand?
Did I choose one emotion and an intensity?
Is there exactly one speaker, or is the clip silent?
Did I forbid music or add the sound I want?
Did I preserve faces, clothes, props, light and direction?
Does the clip end in a stable pose?

### 25.7 The ten golden rules

Describe the image before describing the motion.
One clip, one main action.
Name which hand, which direction, which end.
Say where the subject looks.
Keep emotion visible and small.
Use a static camera unless motion is needed.
Separate visible acting from audio.
Break complex scenes into several clips.
Carry continuity from clip to clip.
Change one variable at a time.
End of handbook. Use the entries as building blocks, adapt them to the abilities of your video tool, and treat every generation as an experiment.