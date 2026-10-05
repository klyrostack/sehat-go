# 🏥 Sehat Go — Clinic Locator & Doctor Appointment Platform

Sehat Go is a vanilla JavaScript healthcare platform tailored for Jammu & Kashmir. It enables patients to find verified private clinics across districts, book time slots with conflict detection, and generate printable appointment passes, while providing doctors with a dedicated management portal to run patient queues and monitor practice earnings.

---

## 🏛️ Project Architecture

```
sehat-go/
├── css/
│   └── style.css              # Custom styling, design tokens, print-pass media queries
├── index.html                 # Homepage with hero search and featured clinics
├── main.js                    # 300ms debounced search, dropdown renderer, session navbar
├── category.html              # Clinic browse directory with district filter sidebar
├── category.js                # URL query routing, dynamic district counts, rating sorting
├── doctor-profile.html        # Doctor details, slot booking widget, reviews & modal
├── profile.js                 # Slot time math, booking conflict detection, print pass, review engine
├── dashboard.html             # Role-based dashboard (Doctor Portal & Patient Portal)
├── dashboard.js               # Route guards, queue actions (Done/No-Show), live revenue metrics
├── login.html                 # Dual-role authentication interface (Doctor & Patient)
├── login.js                   # Role verification, patient registration, session persistence
├── register.html              # Practice registration and clinic profile editor
└── register.js                # Dual-mode form (Create/Edit), operating hours validation
```

---

## ⚡ Core Engineering & Features

- **Real-Time Search Debouncing (`main.js`):** Modular `performSearch()` pipeline with an asynchronous 300ms delay via `setTimeout` and `clearTimeout`. Eliminates laggy DOM re-renders while typing, with an instant bypass on Enter.
- **Dynamic Slot Booking & Pass Generation (`profile.js`):** Pure minute-based time engine (`formatTime`) converting schedules into 12-hour slots. Checks existing bookings via `Array.some()` to prevent double-booking, and builds printable single-page confirmation passes using `window.print()`.
- **Review & Rolling Rating Engine (`profile.js`):** Computes live average ratings using `Array.reduce()` and `toFixed(1)`. Automatically synchronizes newly submitted reviews back to the global doctor directory.
- **Doctor Practice Analytics & Queue Management (`dashboard.js`):** Aggregates consultation earnings in real time while excluding cancelled visits. Includes queue lifecycle actions (`Done` / `No-Show`) with immutable state updates.
- **Dual-Mode Clinic Profile Editor (`register.js`):** Automatically pre-hydrates doctor data for authenticated users to update hours, fees, and specialties in-place using `Array.findIndex()` and object spread syntax.
- **Defensive Error Handling:** Standardized `safeGetStorage()` and `safeSetStorage()` helpers wrapped in `try...catch` blocks to protect against malformed JSON, storage quota limits, and null properties using optional chaining (`?.`) and nullish coalescing (`??`).

---

## 🛠️ Tech Stack

- **Markup:** HTML5 (semantic layout, accessible form controls, modals)
- **Styling:** Custom CSS3 (Flexbox, CSS Grid, custom properties, print stylesheets)
- **Scripting:** Pure Vanilla JavaScript (ES6+, DOM APIs, Web Storage, single-threaded timing)
- **No external frameworks or libraries.**

---

## 🚀 Running Locally

No build tools or package managers required.

1. Clone the repository:
   ```bash
   git clone https://github.com/klyrostack/sehat-go.git
   ```
