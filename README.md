# Sehat Go — Healthcare Clinic Finder & Appointment Platform

A client-side healthcare platform tailored for private clinics and patients across Jammu & Kashmir. The platform handles clinic discovery, conflict-free appointment slot booking, dual-role access (Doctor/Patient), and practice analytics.

Originally built in Vanilla JavaScript, the entire application has been migrated to strict, type-safe TypeScript compiled to native ES6 browser modules.

**Live Deployment:** [sehat-go.vercel.app](https://sehat-go.vercel.app)

---

## Architecture & Directory Structure

```
sehat-go/
├── css/
│   └── style.css              # Custom styling, CSS grid/flexbox, print stylesheets
├── src/                       # TypeScript Source Files (Strict Mode)
│   ├── types.ts               # Master contracts (Doctor, Appointment, UserSession, etc.)
│   ├── storage.ts             # Safe web storage service with try/catch serialization
│   ├── main.ts                # 300ms search debouncer, dropdown renderer, category counts
│   ├── category.ts            # URL query routing, dynamic district faceting, procedures dictionary
│   ├── profile.ts             # Slot arithmetic, conflict checks, print pass, review engine
│   ├── dashboard.ts           # Dual-portal router, doctor queue, revenue aggregator
│   ├── register.ts            # Clinic onboarding, operating hours validation, edit-mode
│   └── login.ts               # Tab switcher, password verification, session persistence
├── js/                        # Compiled Production JavaScript (ES6 Modules)
│   ├── types.js
│   ├── storage.js
│   ├── main.js
│   ├── category.js
│   ├── profile.js
│   ├── dashboard.js
│   ├── register.js
│   └── login.js
├── data/
│   └── doctors.json           # Seed catalog loaded asynchronously via Fetch API
├── index.html                 # Homepage with hero search and featured clinics
├── category.html              # Browse directory with district sidebar filtering
├── doctor-profile.html        # Doctor details, slot booking slider, review submission
├── dashboard.html             # Role-based dashboard (Doctor Queue / Patient Appointments)
├── login.html                 # Authentication interface (Doctor & Patient tabs)
├── register.html              # Clinic registration & schedule configuration
├── package.json               # Project manifest and build scripts
└── tsconfig.json              # TypeScript compiler configuration (ES6, DOM)
```

---

## Core Technical Engines

- **Master Type Contracts (`src/types.ts`):** Centralized interfaces (`Doctor`, `Appointment`, `UserSession`, `PatientRecord`, `Booking`) enforce compile-time safety across all modules, eliminating runtime property lookup errors.
- **Search Debouncing (`src/main.ts`):** 300ms timer pipeline (`setTimeout` / `clearTimeout`) throttling live search queries across clinic name, specialty, and district without unnecessary DOM repaints.
- **Slot Arithmetic & Conflict Engine (`src/profile.ts`):** Generates 12-hour consultation slots from doctor operating hours using integer time division and modulo arithmetic. Uses `Array.prototype.some()` to prevent double-booking on specific calendar dates.
- **Single-Page Printable Pass (`src/profile.ts`):** Formats dynamic booking receipts using the native `window.print()` API paired with `@media print` CSS rules that suppress browser navigation headers and footers.
- **Live Revenue Aggregator (`src/dashboard.ts`):** Computes estimated doctor earnings dynamically using `Array.prototype.reduce()`, enforcing numeric casting and excluding cancelled visits.
- **Defensive Storage Service (`src/storage.ts`):** Generic helper functions (`safeGetStorage<T>`, `safeSetStorage<T>`) wrapped in `try...catch` blocks to defend against quota exhaustion and malformed JSON payloads.

---

## Tech Stack

- **Source Language:** TypeScript (Strict Mode, DOM & ES6 targets)
- **Runtime:** Native browser ES6 Modules (`<script type="module">`)
- **Markup:** Semantic HTML5
- **Styling:** Vanilla CSS3 (Custom properties, Flexbox, Grid, Media Queries)
- **Persistence:** Web Storage API (`localStorage`)
- **Hosting & CI/CD:** Vercel

---

## Project Roadmap

- [x] **Phase 1: Core Architecture (Vanilla JS):** Built search engine, booking pipeline, dual-role dashboard, and responsive UI from scratch.
- [x] **Phase 2: TypeScript Migration:** 100% of codebase migrated to TypeScript with master data contracts, modular ES6 builds, and 0 compiler errors.
- [ ] **Phase 3: React + TypeScript Migration:** Refactoring static HTML pages and imperative DOM scripts into reusable, state-driven React components.
