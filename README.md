# NextJS 14 Supabase blog

This is a dashboard starter template for the [NextJS](https://nextjs.org) 14 app router using supabase based on [shadcn-ui](https://ui.shadcn.com).

## Screenshots

![screenshot](./screenshot.png)

## Denpendencies

- NextJS 14 + Typescript + Tailwind
- Shadcn UI (Radix UI) + TimePicker + TagInput
- react-hook-form + zod
- react-i18next + zod-i18n-map
- Redux Toolkit + Redux Persist
- Supabase OAuth with PKCE flow (@supabase/ssr)
- Supabase Email Auth with PKCE flow (@supabase/ssr)
- Supabase Role-based Access Control (RBAC)
- CKEditor 5 + Supabase Upload Adapter
- PWA (Progressive Web Apps)

## Table of Contents

- [NextJS 14 Supabase blog](#nextjs-14-supabase-blog)
  - [Screenshots](#screenshots)
  - [Denpendencies](#denpendencies)
  - [Table of Contents](#table-of-contents)
  - [Folder and file Structure](#folder-and-file-structure)
  - [Getting Started](#getting-started)
  - [Generate Favicon](#generate-favicon)
  - [Docs](#docs)
  - [Define App URL](#define-app-url)
  - [Troubleshooting](#troubleshooting)
  - [License](#license)
  - [Reference](#reference)

## Folder and file Structure

The folder and file structure is based on nextjs app router [next.js project structure](https://nextjs.org/docs/getting-started/project-structure).

```txt
.
├── app/                        # App Router
│   └── api/
│       ├── auth/               # Public API for authentication
│       └── v1/                 # APIs that require authentication
├── components/                 # React components
├── config/                     # Configuration for site
├── context/
│   └── app-provider.ts         # Register context provider
├── hooks/
├── docs/                       # Documents
├── lib/                        # Utility functions
├── public/                     # Static assets to be served
│   └── [locales]/              # Internationalization
├── queries/                    # SWR for API
├── screenshots/                # Screenshots
├── store/                      # Redux reducers
├── supabase/                   # Supabase CLI
├── types/
├── components.json             # Shadcn UI
├── i18next.config.ts           # Internationalization
└── package.json                # Project dependencies and scripts
```

## Getting Started

Find and replace the following text in `supabase/seed.sql` and run sql.

- `YOUR_BUCKET_ID`
- `username@example.com`

Clone the repository to the current directory.

```shell
git clone https://github.com/w3labkr/nextjs14-supabase-blog.git .
```

Install all modules listed as dependencies.

```shell
npm install
```

Start the development server.

```shell
npm run dev
```

## Generate Favicon

Add `favicon.ico` file to `/app` directory.

- [Favicon.ico & App Icon Generator](https://www.favicon-generator.org)

Generate manifest and splash screen.

```shell
vim public/manifest.json
```

- [PWA Image Generator](https://www.pwabuilder.com/imageGenerator),
  [Maskable Icon Generator](https://progressier.com/maskable-icons-editor),
  [PWA Manifest Generator](https://www.simicart.com/manifest-generator.html)
- [Custom Splash Screen on iOS](https://appsco.pe/developer/splash-screens)

## Docs

- [INSTALLATION](./docs/INSTALLATION.md)
- [CONFIGURATION](./docs/CONFIGURATION.md)
- [DEPLOYING](./docs/DEPLOYING.md)
- [LINTER](./docs/LINTER.md)
- [EXAMPLES](./docs/EXAMPLES.md)

## Define App URL

- Environment: `NEXT_PUBLIC_APP_URL=`
- Supabase Auth: Authentication > URL Configuration > Redirect URLs
- Google cloud console: API > Credentials
- Google cloud console: API > OAuth

## Troubleshooting

- For eslint, check the [latest version](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin?activeTab=versions) of `@typescript-eslint/eslint-plugin` and upgrade.
- For ckeditor5, check the downloadable version in the [online builder](https://ckeditor.com/ckeditor-5/online-builder/) and upgrade.
- If an error occurs in the pre-rendered `sitemap.xml`, access the page in development mode and run a rebuild.

## License

This software license under the [MIT License](LICENSE).

## Reference

- [shadcn-ui/ui](https://github.com/shadcn-ui/ui)
- [shadcn-ui/taxonomy](https://github.com/shadcn-ui/taxonomy)
- [nextjs-slack-clone](https://github.com/supabase/supabase/tree/master/examples/slack-clone/nextjs-slack-clone)
- [nextjs-subscription-payments](https://github.com/vercel/nextjs-subscription-payments)
