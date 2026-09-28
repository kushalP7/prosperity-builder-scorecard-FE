# Rose Associates FE React (Vite + React)

A standalone modern Single Page Application (SPA) for the **Rose Associates - Prosperity Builder Scorecard™** platform, built using **React 19**, **Vite 6**, and **React Router 7**.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher

### Installation
```bash
npm install
```

### Environment Variables
Copy `.env.example` to `.env` (or configure via environment variables):
```bash
VITE_API_URL=http://localhost:3001
```
*Note: Any environment variable exposed to the client in Vite must start with the `VITE_` prefix.*

### Development
Start the local Vite development server:
```bash
npm run dev
```
The application will be accessible at: `http://localhost:3000/`

### Production Build
Generate an optimized static production bundle in `dist/`:
```bash
npm run build
```

### Preview Production Build Locally
```bash
npm run preview
```

---

## 🛠 Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** (`19.2.8`) | Core UI library |
| **Vite 6** (`6.2.0`) | Next-generation frontend tooling and bundler |
| **React Router 7** (`7.18.4`) | Client-side declarative routing and SPA navigation |
| **Tailwind CSS 4** (`4.3.3`) | Modern utility-first styling with `@theme` variables |
| **Zustand 5** (`5.0.14`) | High-performance client-side application state |
| **Recharts 3** (`3.10.1`) | Responsive SVG data visualization charts |
| **Leaflet 1.9** (`1.9.4`) | Interactive geospatial GIS map and custom map pins |
| **Lucide React** (`1.28.0`) | Clean icon library |
| **Zod 4** (`4.4.3`) | Schema validation |
| **jsPDF & html2canvas** | Report and scorecard PDF document generation |

---

## 📁 Project Structure

```
Rose Associates FE React/
├── dist/                      # Production build output
├── public/                    # Static assets, branding, partner logos, newsletters
│   ├── linkedIn-newsletter/
│   ├── partners/
│   ├── sample-report/
│   ├── favicon.ico
│   ├── icon.png
│   └── logo.png
├── src/
│   ├── components/            # UI, Layout, CMS, Landing, Charts, Map, Audio Player
│   │   ├── cms/               # Rich text editor, file dropzone, media & report forms
│   │   ├── landing/           # Hero, partners, showcase, map, charts, testimonials
│   │   ├── layout/            # AppShell, responsive drawer sidebar, top navigation
│   │   ├── media/             # Audio players, featured podcast & newsletter
│   │   ├── scorecard/         # Radial score speedometer and gauges
│   │   └── ui/                # Button, Card, Modal, Loader, Toast
│   ├── lib/                   # API clients, scoring engine, storage, router compatibility
│   │   ├── api.ts             # Core backend API client (Projects, Templates, Settings)
│   │   ├── media-api.ts       # Videos, Podcasts, Newsletters CMS API
│   │   ├── reports-api.ts     # Published and custom report blocks CMS API
│   │   ├── router-compat.tsx  # React Router drop-in navigation adapter
│   │   ├── scoring/           # Scorecard scoring rules and calculation engine
│   │   └── storage.ts         # LocalStorage persistence with quota management
│   ├── pages/                 # Full-page views for public landing and admin modules
│   │   ├── auth/              # LoginPage (/login)
│   │   ├── cms/               # LandingCMSPage, MediaCreate, MediaEdit, ReportCreate, ReportEdit
│   │   ├── dashboard/         # OverallAnalyticsPage, AnalyticsPage, AnalyticsMakerPage
│   │   ├── landing/           # LandingPage, About, Categories, Scorecard, Reports, Videos, etc.
│   │   ├── orders/            # OrdersPage (/orders)
│   │   ├── payments/          # PaymentsPage (/payments)
│   │   ├── projects/          # ProjectsPage, ProjectLayout, ProjectDataPage, ProjectAnalyticsPage
│   │   ├── section-maker/     # SectionMakerPage, SectionMakerCategoryPage
│   │   ├── settings/          # SettingsPage (/settings)
│   │   └── users/             # UsersPage (/users)
│   ├── store/                 # Zustand store managing projects, templates, widgets, and auth
│   ├── App.tsx                # Central route registry and scroll-to-top handler
│   ├── index.css              # Global styles, Tailwind v4 @theme, custom scrollbars, animations
│   └── main.tsx               # Application bootstrap
├── index.html                 # HTML template with Google Fonts (Inter)
├── tsconfig.json              # TypeScript configuration
├── vercel.json                # Vercel SPA rewrites configuration
└── vite.config.ts             # Vite configuration with Tailwind v4 & React plugins
```

---

## 🌐 Routes Migrated

### Public Landing & Information
- `/` — Homepage (Hero, Strategic Partners Marquee, Key Metrics, Featured Reports)
- `/about` — About Rose Associates & Leadership
- `/categories` — Prosperity Builder Scorecard Categories
- `/executive-analytics` — Executive Level Analytics Showcase
- `/framework` — Municipal Development Framework & Methodology
- `/glossary` — Economic Development Terminology & Glossary
- `/pricing` — Advisory & Scorecard Service Tier Pricing
- `/process` — 3-Phase Prosperity Building Process Roadmap
- `/project-portfolio` — Interactive Geographic Portfolio with Leaflet Map
- `/projects-portfolio` — Alias redirect to `/project-portfolio`
- `/prosperity-builder-scorecard` — Scorecard Introduction & Sample Audits
- `/report-showcase` — Alias redirect to `/prosperity-builder-scorecard`
- `/services` — Redirect to services anchor on homepage (`/#services`)
- `/reports` — Browse Published Market Reports & Newsletter Archive
- `/report/:slug` — Dynamic Full-Page Rich Media Report Viewer (PDF viewer, gallery, stats grid)
- `/videos` — Video, Podcast, and Media Library
- `/videos/all` — Complete Categorized Media Archive

### Authentication
- `/login` — Secure Admin Authentication (`admin@roseassociates.com` / `admin123`)

### Admin Management Platform (Protected by AppShell)
- `/overall-analytics` — Multi-project executive portfolio dashboard
- `/analytics` — Project analytics dashboard
- `/analytics-maker` — Custom analytics widget configuration
- `/projects` — Project inventory management
- `/projects/:id` — Project nested layout (auto-redirects to `/projects/:id/data`)
  - `/projects/:id/data` — Project scorecard data grid with formula execution
  - `/projects/:id/analytics` — Project-specific interactive analytics
- `/section-maker` — Global section templates
- `/section-maker/:sectionId/categories/:categoryId` — Category table schema and conditional rule builder
- `/landing-cms` — Unified content management for Reports, Media Sphere, and Featured Projects
- `/landing-cms/media/create` — Add new media item (Video / Podcast / Newsletter)
- `/landing-cms/media/edit/:id` — Edit media item
- `/landing-cms/reports/create` — Create report with modular block builder
- `/landing-cms/reports/edit/:id` — Edit report and section blocks
- `/orders` — Order tracking and audit requests
- `/payments` — Financial transactions and invoice records
- `/users` — Platform user management and roles
- `/settings` — Application settings, brand profile, rating bands

---

## ☁️ Deployment Configurations

### 1. Vercel Deployment
A `vercel.json` file is included in the project root:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
**Deployment Steps on Vercel:**
1. Connect your repository to Vercel.
2. Set **Framework Preset** to `Vite`.
3. Set **Root Directory** to `Rose Associates FE React`.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variable: `VITE_API_URL` pointing to your production NestJS backend URL.

### 2. AWS Deployment (S3 + CloudFront)
Because React Router handles routing on the client side, direct navigation or page refreshes on subroutes (e.g. `/reports` or `/projects/proj-123/data`) will request non-existent files from S3 unless SPA fallback is configured.

#### Option A: CloudFront Error Response (Recommended)
1. Upload the `dist/` directory contents to an Amazon S3 bucket configured for static website hosting or private bucket with OAC.
2. In your CloudFront distribution settings:
   - Navigate to **Error pages** -> **Create custom error response**.
   - **HTTP error code**: `403: Forbidden` (and/or `404: Not Found`).
   - **Error caching minimum TTL**: `0` or `10`.
   - **Customize error response**: `Yes`.
   - **Response page path**: `/index.html`.
   - **HTTP Response code**: `200: OK`.

#### Option B: CloudFront Function for Clean URL Rewrites
Create a lightweight CloudFront Function associated with Viewer Request:
```javascript
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  
  // If the request is for a file with an extension, pass through
  if (uri.includes('.')) {
    return request;
  }
  
  // Otherwise rewrite to index.html for SPA routing
  request.uri = '/index.html';
  return request;
}
```

#### Option C: AWS Amplify
If deploying with AWS Amplify Hosting:
Add the following rewrite rule in **App settings** -> **Rewrites and redirects**:
- **Source address**: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`
- **Target address**: `/index.html`
- **Type**: `200 (Rewrite)`
