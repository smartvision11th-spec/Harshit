# Velocity Auto Detailing

A cinematic, 3D interactive website for a premium car detailing studio.
React 18 + Vite + TypeScript, Three.js (React Three Fiber + drei), GSAP ScrollTrigger, Framer Motion, Lenis, Tailwind CSS.

> **Status:** this source was written without being able to run `npm install` or `npm run build` in the authoring environment (package registry access was blocked). Run the commands below first. If the build reports an error, it will be small and local; see "If the build fails".

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs dist/
npm run preview    # serves the production build
npm run typecheck  # optional: TypeScript check
```

Requires Node 18.18+ (Node 20 or 22 recommended).

## Edit your business details (one file)

Open `src/config/site.ts`. Everything marked `PLACEHOLDER` must be replaced before launch:

- `whatsappNumber` (digits only, international format, e.g. `919876543210`), phone, email, address, hours
- `instagramUrl`, `mapsUrl`
- `url` (your live domain, used for canonical, Open Graph and structured data)
- `SERVICES`, `PROCESS_STEPS`, `WHY_US`, `GALLERY`, `TESTIMONIALS` copy

Also update the matching `<title>` / description in `index.html`.

The testimonials are clearly labelled "Sample" and contain no invented reviews. Replace them with real reviews you have permission to publish. No certifications, addresses or experience claims are included.

## Replace the placeholder imagery

All images in `public/images/` are original procedurally generated placeholders (made by `scripts/generate_placeholders.py`, needs `pip install pillow numpy`). Swap in your own photography using the same file names (WebP recommended, or AVIF/JPG with updated paths in `src/config/site.ts`). Also replace `public/og-image.jpg` (1200x630).

## 3D car

By default the hero and the pinned showcase render a procedural sports coupe, so the site ships with no heavy 3D files. To use a real model:

1. Export an optimised `.glb` (Draco/meshopt compressed, ideally under 3 to 5 MB, front of the car along +X).
2. Put it in `public/models/car.glb`.
3. Set `carModelUrl: '/models/car.glb'` in `src/config/site.ts`.

The model is auto-scaled and centred. Check the licence of any model you download.

## Performance and fallbacks

- The 3D stack is code-split and loaded after first paint (idle), only when WebGL exists.
- Lower pixel ratio, no antialiasing and smaller shadow maps on phones and tablets; automatic DPR drop if the frame rate falls.
- Render loop pauses when the canvas is off-screen.
- No WebGL, context loss or model error: a static hero image is shown.
- `prefers-reduced-motion`: smooth scroll, pinning, parallax and entrance animation are turned off; content is shown statically.
- Touch devices: no custom cursor or magnetic buttons; pinned horizontal gallery and process sections become native swipe/stacked layouts below tablet width or desktop width.
- GSAP animations are created inside `gsap.context()` and reverted on unmount.

## Deploy

### 1. Extract
Unzip `velocity-auto-detailing.zip`, open the folder in a terminal, run `npm install` and `npm run build` once to confirm.

### 2. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/velocity-auto-detailing.git
git push -u origin main
```
(Create the empty repository on github.com first.)

### 3. Import into Vercel
1. Sign in at vercel.com, choose **Add New > Project**, and import the GitHub repository.
2. Vercel detects Vite automatically (`vercel.json` is included): build command `npm run build`, output `dist`.

### 4. Deploy
Click **Deploy**. Every push to `main` redeploys automatically.

### 5. Custom domain
In the Vercel project: **Settings > Domains > Add**, enter your domain, and set the DNS records Vercel shows (an A record for the apex domain and a CNAME for `www`). Then set `SITE.url` in `src/config/site.ts` and redeploy.

## Project structure

```
src/
  components/   Hero, Intro, Services, CarShowcase, Process, BeforeAfter, WhyUs,
                Gallery, Testimonials, FinalCTA, Booking, Footer, Navbar, Preloader, Cursor...
  three/        CarScene (R3F canvas), ProceduralCar, GlbCar, SceneBoundary
  animations/   gsap.ts (plugin registration), scrollAnimations.ts, motionConfig.ts, SmoothScroll.tsx
  hooks/        useMediaQuery, useWebGL, useInView
  config/       site.ts (all editable content)
  styles/       global.css
```

## If the build fails

Run `npm run typecheck` to see the exact file and line. Dependency versions are set with caret ranges in `package.json`; the code targets react-three-fiber 8 / drei 9 / three 0.169 / lenis 1.x / framer-motion 11. If you upgrade major versions, API changes may need small edits.
