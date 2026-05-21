# Canvas Studio by QuillBot

A visual content creation tool that transforms text into polished social media graphics, presentation slides, quote cards, and banners — no design skills required.

**Live demo:** [quillbot-canvas.vercel.app](https://quillbot-canvas.vercel.app)

## What It Does

Paste any text and Canvas Studio automatically detects the content type (quote, bullet list, announcement, long-form, etc.) and recommends the best visual format. Choose from 96 style combinations across 6 color schemes, 4 font pairings, and 4 layout templates.

### Features

- **Smart content detection** — Identifies quotes, bullet lists, presentations, announcements, and more based on text structure
- **Intelligent style matching** — Suggests color schemes and font pairings based on content keywords (e.g., tech content gets Midnight + Modern, quotes get Editorial serif)
- **4 layout templates** — Social Post (1:1), Presentation (16:9), Quote Card (4:5), Banner (21:9)
- **6 color schemes** — QuillBot, Midnight, Coral, Ocean, Sand, Mono
- **4 font pairings** — Editorial, Modern, Warm, Impact (loaded via Google Fonts)
- **Live preview** — Real-time canvas preview as you type or adjust settings
- **Mobile responsive** — Adapts layout for smaller screens
- **Export-ready** — Formatted for LinkedIn, Instagram, slide decks, and email headers

## Tech Stack

- **React 19** with hooks (useState, useEffect, useRef, useCallback, useMemo)
- **Vite 8** for dev server and production builds
- **Vercel** for hosting and analytics
- **Google Fonts** for typography (Plus Jakarta Sans, Playfair Display, Sora, DM Mono, Fraunces, Outfit, Bebas Neue)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install and Run

```bash
git clone https://github.com/ankurkulkarni90/quillbot-canvas.git
cd quillbot-canvas
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
canvas-studio/
├── index.html            # Entry HTML
├── package.json
├── vite.config.js        # Vite configuration
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── main.jsx          # React root + Vercel Analytics
    ├── App.jsx           # Main application (single-file component)
    ├── App.css
    └── index.css
```

## Deployment

This project auto-deploys to Vercel on push to `main`. Vercel Web Analytics is integrated via `@vercel/analytics`.

## License

Private project.
