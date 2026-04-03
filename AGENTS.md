# Winchester Budget: Agent Architecture Guide

Welcome, Agent. This document outlines the architectural decisions, design patterns, and deployment infrastructure of the **Winchester Budget** application. It is designed to rapidly onboard new agents performing refactoring, feature enhancements, or maintenance.

---

## 1. Technology Stack

*   **Framwork:** React 19 via Vite.
*   **Routing:** React Router v6 (`react-router-dom`).
*   **Styling:** Tailwind CSS (v3.x).
*   **Data Visualization:** Recharts.
*   **Icons:** Lucide React (`lucide-react`).
*   **Deployment:** Firebase Hosting via automated GitHub Actions Continuous Deployment (CD).
*   **Analytics:** Google Analytics integrated via the Firebase Web SDK (`src/firebase.ts`).

---

## 2. Design System: "Modern Archivist"

The application strictly adheres to the "Modern Archivist" design language.

*   **Core Palette:**
    *   **Primary:** `#9e001f` (A deep crimson red). Used for highlights, active tabs, and primary data marks.
    *   **Background (Light Mode):** `#fafafa` (Surface/Canvas), `#ffffff` (Cards).
    *   **Background (Dark Mode):** `#18181b` (Surface/Canvas), `#18181b` (Cards, but rely on border contrast).
    *   **Text:** High contrast text on backgrounds (`text-zinc-900` or `text-zinc-100`).
*   **Typography:** The design relies heavily on tracking adjustments and font weight. Section headers often use `font-black tracking-tighter`. Tertiary labels use `text-[10px] font-bold uppercase tracking-[0.2em]`.
*   **Layout Architecture:** The UI is constructed using an asymmetric **Bento Grid System**. Structural divs utilize `grid grid-cols-1 lg:grid-cols-12 gap-8` with children spanning specific column counts (`lg:col-span-5` vs `lg:col-span-7`).
*   **Container Styling:** Content cards use harsh styling: `bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-[0_20px_40px_rgba(26,28,28,0.06)]`. Borders generally do *not* have rounded corners (`rounded-none`), reflecting the brutalist/archivist aesthetic.

---

## 3. Data Architecture Strategy

The application explicitly avoids a real-time backend database to maximize performance and simplify maintenance.

*   **Data Source:** All budget data is entirely static and housed within a single payload: `src/data/budget_data.json`.
*   **Structure:**
    *   `fiscalYears`: An array containing historical budget definitions parsed directly from town meeting "Yellow Sheets".
    *   `supplementalData`: Storage for one-off notes or revised historical data points.
*   **Interface Layer:** Do not interact with the JSON directly in views. Import utility functions from `src/data/budgetUtils.ts`. These functions handle the business logic (like returning only "complete" fiscal years, calculating percent changes, or formatting currencies).

---

## 4. Primary Components & Routing

*   **`/summary` (`src/pages/SummaryPage.tsx`):**
    *   The landing dashboard.
    *   Features a reactive hook (`useState`) attached to a `<select>` dropdown in the header, allowing users to toggle the displayed Fiscal Year.
    *   Uses Recharts for a Pie Chart (expenditure split) and a vertical Bar Chart (comparing the selected year to the previous year). *Note: Recharts requires hardcoded hex values for colors rather than Tailwind CSS variables to render correctly across browsers.*
*   **`/trends` (`src/pages/TrendsPage.tsx`):**
    *   Displays compound growth metrics over the full historic data range.
    *   Features dynamic Line and Area charts that map over the entire `fiscalYears` dataset from the JSON, illustrating historical expenditure velocity.
*   **`/raw-data` (`src/pages/RawDataPage.tsx`):**
    *   A full-width data table component leveraging `overflow-x-auto`.
    *   Used purely for transparency, parsing the entire complete dataset into an accessible tabular format.

---

## 5. Deployment & CI/CD Pipeline

*   **Hosting:** Google Firebase Hosting (`winchester-budget`).
*   **Continuous Deployment:** Controlled via GitHub Actions (`.github/workflows/`).
    *   `firebase-hosting-pull-request.yml`: Runs tests/builds and provisions a temporary Firebase Preview URL when a PR is opened.
    *   `firebase-hosting-merge.yml`: Automatically builds the production bundle (`npm ci && npm run build`) and publishes directly to the live Firebase URL upon merging to the `main` branch.
    *   *Agent Note:* Authentication is brokered via a GCP Service Account stored inside the GitHub repository secret `FIREBASE_SERVICE_ACCOUNT_WINCHESTER_BUDGET`.
*   **Analytics Initialization:** Located in `src/firebase.ts`. It fetches the config and initializes `getAnalytics()`. This file is imported at the top level in `src/App.tsx` ensuring passive page tracking immediately on client load.
