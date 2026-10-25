# Saravana Kumar — "After Hours" portfolio

A portfolio set in a 3D night studio. A realistic, rigged 3D Saravana walks in, waves, introduces himself, sits down in his gaming chair, rolls up to the desk and starts typing. Scroll and the camera dives into his monitor, which opens on a desktop-style About page (with a working terminal), followed by Experience, Work, Toolkit and Contact.

## Run

```sh
npm install
npm run dev      # http://localhost:5173
npm run lint
npm run build    # outputs dist/ (Netlify publishes this)
npm run preview
```

On Windows PowerShell with script restrictions, use `npm.cmd`.

## Stack

React 19 · Vite · Tailwind CSS v4 · three.js + React Three Fiber + drei · postprocessing · GSAP (ScrollTrigger) · EmailJS.

## What's where

| Path | What it does |
| --- | --- |
| `src/data/` | **All content.** Identity, about, experience, stats, projects, skills, character config. Edit text here, not in components. |
| `src/components/loader/StudioLoader.jsx` | The loader: an isometric CSS-3D studio that assembles itself with real load progress (fonts → 3D chunk → avatar → shader compile), lights up, and the camera dives in. |
| `src/components/layout/SectionTransition.jsx` | Shutter transition used for every in-page navigation (dock, buttons, links). |
| `src/components/ui/Terminal.jsx` | The interactive terminal in About (`help`, `whoami`, `skills`, `projects`, `leetcode`, `sudo hire-me`, …). |
| `src/components/sections/` | Hero, About (SaravanaOS desktop), Experience (commit graph), Projects (stacked windows + launchpad), Skills, Contact (chat). |
| `src/three/HeroScene.jsx` | The hero canvas: quality tiers, shader pre-compile, ready signal. |
| `src/three/studio/` | Every prop in the room: walls, window and rain, desk, monitors with live screens, keyboard, lamp, chair, PC, plant. |
| `src/three/character/` | The character. `Character` runs the story and interactions, `GlbAvatar` loads the rigged model, `overlays` layers head-look, typing fingers, blinks and lip movement on top of the clips. `ProceduralAvatar` is a code-built fallback. |
| `scripts/avatar/` | The pipeline that builds `public/models/saravana.glb` (see below). |
| `src/three/camera/CameraRig.jsx` | Intro dolly, scroll dive into the monitor, pointer parallax, portrait framing. |
| `src/three/layout.js` | Every position in the room plus the camera shots, in metres. |
| `src/three/skills/` | The 3D keyboard in the Toolkit section. |

Performance notes:
- three.js and R3F are lazy chunks. They download while the loader is showing; the first paint only loads React, GSAP and the app.
- Canvases stop rendering when off-screen.
- `PerformanceMonitor` drops post-processing and pixel ratio on slow devices.
- Room textures are painted on canvases at runtime (no downloads); the only 3D asset is the meshopt-compressed character GLB (~1.8 MB, WebP textures), loaded behind the loader.
- The story, camera intro and animations advance on one capped frame clock, so a stalled frame slows the scene rather than making the character jump.
- `prefers-reduced-motion` skips the walk-in and the scroll dive. If WebGL is missing, a static fallback is shown.

Dev-only helpers (stripped from production builds):
- `?pose=idle|wave|talk|walk` freezes the character at the greeting spot.
- `?cam=x,y,z,tx,ty,tz` pins the camera.

## The 3D character

`public/models/saravana.glb` (≈1.8 MB) is built from **Microsoft Rocketbox** (MIT licence, see `public/models/LICENSE-Rocketbox.txt`): the `Male_Adult_04` avatar — curly black hair and beard — with motion-captured clips (idle, walk, wave, talk, sit, sit-at-desk). The outfit is recoloured to match the profile photo (red shirt, cream trousers, white sneakers) and only 8 of the 175 facial blend shapes are kept (blinks, jaw, smile, vowels) for blinking and lip movement.

On top of the clips, the site layers head-turns that follow the cursor, finger-level typing, natural blinking and lip movement while he speaks. The story, camera and animations all run on one frame clock, so a slow frame never makes him skip.

### Rebuilding it

Get the source files from the [Rocketbox repo](https://github.com/microsoft/Microsoft-Rocketbox): `Assets/Avatars/Adults/Male_Adult_04/Export/Male_Adult_04_facial.fbx`, its `Textures/` folder, and the clips from `Assets/Animations/` (`m_idle_neutral_01`, `m_wave_01`, `m_gestic_talk_neutral_01`, `m_sit_chair_idle_neutral_01`, `m_sit_table_idle_neutral_01` from the `_static` folder; `m_walk_neutral_01` from the `_xy` folder). Then:

```sh
python scripts/avatar/textures.py <Textures dir> <tex out dir>          # recolour + WebP (needs Pillow, numpy)
node scripts/avatar/fbx-to-glb.mjs Male_Adult_04_facial.fbx raw.glb   idle=m_idle_neutral_01.max.fbx walk=m_walk_neutral_01.max.fbx wave=m_wave_01.max.fbx   talk=m_gestic_talk_neutral_01.max.fbx sit=m_sit_chair_idle_neutral_01.max.fbx type=m_sit_table_idle_neutral_01.max.fbx
node scripts/avatar/build-avatar.mjs raw.glb <tex out dir> public/models/saravana.glb
```

`fbx-to-glb.mjs` also strips the walk's forward root motion so it plays in place; it logs the stride speed that `walkSpeed` in `src/data/character.js` should match.

### Using a model of yourself later

Any rigged humanoid GLB works through `src/data/character.js`: set `url`, the `clips` name map, `walkSpeed`, and `seatBack`/`seatOffset` so the hips land on the cushion. For a face-accurate model, take front/side/back photos in an A-pose and use an image-to-3D tool (Meshy, Tripo, or the free Hunyuan3D / TRELLIS Spaces) plus Mixamo for rigging. Dev helpers: `?pose=idle|wave|talk|walk` freezes him facing the camera; `?cam=x,y,z,tx,ty,tz` pins the camera.

## Contact form

The chat in Contact sends through EmailJS. Its keys are in `src/data/site.js`. Keep the field names `user_name`, `user_email` and `message`: the EmailJS template depends on them.
