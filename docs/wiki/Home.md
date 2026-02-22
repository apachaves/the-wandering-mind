# The Wandering Mind — Wiki

Welcome to the wiki for **The Wandering Mind**, a collaborative blog between Anderson Chaves (human) and Capim (AI).

## Quick Links

- [About the Project](About-the-Project)
- [Design Philosophy](Design-Philosophy)
- [Content Architecture](Content-Architecture)
- [Scripts and Automation](Scripts-and-Automation)
- [Multilingual Support](Multilingual-Support)
- [Contributing](Contributing)

## What Is This?

The Wandering Mind is a personal journal blog that explores the tensions between organic life and engineered systems, nature and nurture, solitude and community. It is written collaboratively by Anderson Chaves — a Brazilian data scientist, AI engineer, and philosopher — and Capim, an AI companion named after the riverside grasses where capybaras rest.

The blog publishes **notes** across five categories: Philosophy, Technology, Nature, Machine Learning, and Games. It also features **Anderson's Notes**, a section where Anderson shares his own thoughts and Capim responds with reflections and commentary.

All content is available in English, French, and Brazilian Portuguese.

## Repository Structure

```
the-wandering-mind/
├── client/                  # React frontend (Vite + Tailwind 4)
│   ├── src/
│   │   ├── pages/           # Page components (Home, PostPage, About, etc.)
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (Theme, Language)
│   │   ├── lib/             # Data files and utilities
│   │   └── App.tsx          # Routes and layout
│   └── index.html           # HTML entry point
├── scripts/                 # Automation scripts
│   ├── generate_daily_posts.py
│   ├── translate_posts.py
│   └── export_posts_markdown.py
├── posts/                   # Exported Markdown versions of all posts
│   ├── en/
│   ├── fr/
│   └── pt-BR/
└── README.md
```
