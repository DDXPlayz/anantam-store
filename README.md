# Anantam Store

A one-page merchandise store where the product is a 3D garment you can pick up,
spin with your cursor and look at from behind before you buy it.

**[Live → store.anantamracing.com](https://store.anantamracing.com/)**

---

## What this is, and what it is not

**This is a 3D product showcase with an ordering handoff.** Four shirts, each a
real GLB mesh, rendered with three.js in a reflective showroom; drag to rotate,
pick a size, check the measurements, and send the order through WhatsApp.

**It is not a storefront with a checkout.** There is no cart, no payment, no
inventory and no order database. The "Order via WhatsApp" button opens a
pre-filled message to the team's order number — which is how a small team
actually takes six orders a week, and is why there is no reason for the rest of
it to exist. An earlier revision carried Shopify variant ids; they were
placeholders and were removed rather than wired up.

If you want the same team's code with a *real* payment integration, that is
[anantam-tickets](https://github.com/DDXPlayz/anantam-tickets) — Razorpay,
signature verification and all.

---

## Why 3D for a t-shirt

A flat product photo of a printed shirt tells you what the print looks like. It
does not tell you how the print sits across a chest, how it falls, or what the
back looks like. For a team shirt bought mostly by people who already know the
team, the question is not "what is this" but "do I want to be seen in it" — and
that is a question about the garment in three dimensions.

It is also, honestly, the kind of thing a racing team should be able to show
off, given everything else in the portfolio renders at 60 fps.

---

## How it works

```
Home.tsx
  └── GarageShowcase.tsx      617 lines — the whole experience
        ├── <Canvas>  react-three-fiber
        │     ├── WindTunnel            five translucent torus rings, depth haze
        │     ├── MeshReflectorMaterial  the showroom floor
        │     ├── ContactShadows, Sparkles, Environment
        │     ├── EffectComposer → Bloom
        │     └── InteractiveShirt × 4
        │           └── ShirtDisplay → useGLTF(model) → <Float>
        ├── framer-motion      the UI layer and the transition states
        └── SizeChartModal     S/M/L/XL chest, length, shoulder, sleeve
```

**Rotation is driven by quaternions, not by Euler angles.** The drag handler
accumulates a target rotation and the frame loop slerps toward it, so dragging
from 350° to 10° takes the 20° path rather than unwinding 340° the other way.
Vertical rotation is clamped to ±0.4 rad so the shirt cannot be tumbled upside
down.

**The showcase is a small state machine**, not a set of booleans:
`idle → entering → centering → ready → returning_ui_out → returning_main_shirt`.
Dragging is only accepted in `ready`. That is what stops a half-finished camera
move from being interrupted into an inconsistent layout.

**Idle shirts float, the selected shirt does not.** `<Float>` is disabled for the
active shirt, because bobbing gently while someone is trying to inspect a print
is irritating rather than alive.

---

## The models

Four GLB files, one per design, ~1.7 MB each:

```
public/models/{CharlesLeclerc,GeorgeRussell,LandoNorris,MaxVerstappen}-opt.glb
```

Each is the **same garment mesh** — a single `cloth_parent` node with one
`cloth_shape` mesh and a `Shirt Texture` material — with a different print baked
into the texture. The `-opt` suffix is not decoration: they were run through
`glTF-Transform` v4.3.0, which is what makes four meshes plus four textures a
7 MB page instead of a 40 MB one. Materials are overridden at load
(`roughness 0.4`, `metalness 0.3`, `envMapIntensity 1.5`) so all four read as the
same fabric under the showroom lighting regardless of how each was exported.

---

## Getting started

```bash
git clone https://github.com/DDXPlayz/anantam-store.git
cd anantam-store
npm install
npm run dev          # http://localhost:5173
```

```bash
npm run build        # static output in dist/
npm run preview
```

No environment variables, no API keys, no backend. `npm run build` produces a
folder you can drop on any static host.

---

## Project structure

```
src/
  main.tsx                     entry
  App.tsx                      router
  pages/Home.tsx               renders the showcase
  components/
    GarageShowcase.tsx         617 lines: scene, camera, drag, transitions, UI
    ShirtDisplay.tsx           loads and clones one GLB, tunes its material
    SizeChartModal.tsx         the measurements table
  index.css                    Tailwind v4 entry
public/models/*.glb            the four garments
```

807 lines of TypeScript across five files. `GarageShowcase.tsx` is three quarters
of it and does too much for one file — scene graph, pointer handling, transition
state and layout all live there. That is a fair criticism; it grew as one scene
and was never split.

---

## Engineering decisions

**Clone the GLTF scene per instance.** `useGLTF` caches by URL and returns the
same object graph to every caller, so four shirts sharing one cached scene would
share one transform. `ShirtDisplay` clones it inside a `useMemo`, which is the
difference between four shirts and one shirt that teleports.

**Preload all four up front.** `useGLTF.preload()` is called at module scope for
every model, so switching shirts is instant rather than a spinner. Four × 1.7 MB
is an acceptable up-front cost for a page whose entire purpose is comparing them.

**Bloom, but only just.** The postprocessing pass is there to make the white
print glow against a dark showroom. It is the single most expensive thing on the
page, and it is the first thing to cut if this ever has to run on a weak phone.

**WhatsApp instead of a checkout.** Building a cart, a payment integration and an
order store for a team that fulfils orders by hand would be building the wrong
thing well. The pre-filled message carries the design, the size and the quantity,
so the order arrives structured even though nothing structured it.

---

## Status & verification

**Status:** live. Stable; not under active development.

| Claim | How it was checked |
|---|---|
| Live at `store.anantamracing.com` | HTTP 200, checked 2026-11-21 |
| Builds from a bare clone | `npm install && npm run build` — **run, passes**, 2,722 modules, 2.1 s |
| The build reproduces what is deployed | **byte-identical.** The bundle built here and the bundle fetched from the live site have the same SHA-256 (`24e570d4f68fc745…`) and the same Vite content hash, `index-CTCfcn3g.js` |
| The GLBs are garment meshes, not likenesses | inspected the glTF JSON: one node `cloth_parent`, mesh `cloth_shape`, material `Shirt Texture` |
| Models were optimised | glTF asset generator reads `glTF-Transform v4.3.0` |
| No secrets in the repository or its history | swept every commit — no keys, no `.env`, ever committed |

**Not verified:**

- **Nothing was ordered.** The WhatsApp handoff was not exercised; no message was
  sent to anyone.
- Rendering and frame rate on anything other than the development machine. The
  bundle is 1.46 MB (416 KB gzipped) before the models, which is a lot for a
  phone on mobile data.
- The size chart against actual garments — the numbers are as supplied.

**One thing to know before forking:** the order button opens
`wa.me/<number>` with the team's own order number hardcoded in
`GarageShowcase.tsx`. It is the same number the live site has always served in
its public bundle, so this repository exposes nothing new — but if you fork this,
change it before you deploy it.

---

## Credits

Written by **Dhruva Goyal** for Team Anantam. Shirt designs are the team's.

three.js (BSD-3-Clause) via react-three-fiber and drei; framer-motion; Tailwind
CSS; lucide-react.

Extracted with its history from the team's site monorepo, which remains the
deployment source.

---

## Licence

[MIT](LICENSE). The licence covers the code. The shirt artwork and the team's
marks are not open-licensed.
