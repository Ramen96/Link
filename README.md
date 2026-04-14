# Local Link & Home Lab Docs

A minimal local network dashboard. Displays and organizes self-hosted services running on your home network, with a documentation viewer for network notes.

## Stack

- [Astro](https://astro.build) — static site framework
- [React](https://react.dev) — used for the interactive documentation viewer
- [Tailwind CSS](https://tailwindcss.com) — styling
- [Geist](https://vercel.com/font) — font (sans + mono)
- [lucide-astro](https://github.com/lucide-icons/lucide) — icons
- [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) — markdown rendering

## Project Structure

```
src/
├── components/
│   ├── ThemeScript.astro       # Theme toggle button + all theme logic
│   ├── ServiceCard.astro       # Individual service link card
│   └── DocumentationViewer.tsx # Markdown renderer with copy buttons
├── docs/
│   └── network-notes.md        # Your local network documentation
├── pages/
│   ├── index.astro             # Home — service dashboard
│   └── documentation.astro    # Documentation viewer page
├── services.ts                 # Service definitions and categories
└── styles/
    └── global.css              # Global styles
```

## Adding a Service

Open `src/services.ts` and add an entry to the `services` array:

```ts
{
  name: 'My Service',
  description: 'Short description',
  url: 'https://myservice.the404.page',
  icon: 'shield',           // see available icons below
  category: 'services',     // network | services | media | dev
}
```

### Available Icons

| Key | Icon |
|-----|------|
| `shield` | Shield (Pi-hole, security) |
| `router` | Router (network gear) |
| `bot` | Bot (AI interfaces) |
| `folder-sync` | FolderSync (file sync) |

To add a new icon, import it from `lucide-astro` in `ServiceCard.astro` and add it to the `icons` map.

### Available Categories

| Key | Label |
|-----|-------|
| `network` | Network |
| `services` | Services |
| `media` | Media |
| `dev` | Dev |

Categories without any services are automatically hidden on the dashboard.

## Adding a Category

In `src/services.ts`, add a key to the `categories` record and the `Service['category']` union type:

```ts
export type Service = {
  category: 'network' | 'services' | 'media' | 'dev' | 'mynewcategory';
  // ...
};

export const categories = {
  // ...
  mynewcategory: 'My New Category',
};
```

## Documentation

Write your network notes in `src/docs/network-notes.md`. The file is read at build time and rendered on `/documentation`. Markdown features supported:

- Headings, paragraphs, bold, italic
- Fenced code blocks with copy buttons
- Tables, lists, blockquotes
- Inline code
- Horizontal rules
- Links

## Theme

Theme logic lives entirely in `ThemeScript.astro`. Behavior:

- On load, respects a stored user preference, otherwise follows the system theme
- When the system theme changes, the stored preference is cleared and the new system theme is applied
- When the user clicks the toggle button, their choice is stored and overrides the system theme

## Development

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

## Deployment

The site runs in Docker behind nginx as a static build.

### Setup

Make sure you have `docker-compose.yml`, `Dockerfile`, and `nginx.conf` at the project root, then start the container:

```bash
docker compose up -d --build
```

The dashboard will be available at `http://localhost:5000`.

### Updating network-notes.md

`network-notes.md` is read at build time, so any changes require a rebuild. Edit the file then run:

```bash
docker compose up -d --build
```

To make this easier, there is a helper script at the project root:

```bash
./update.sh
```

The rebuild typically takes under 30 seconds.
