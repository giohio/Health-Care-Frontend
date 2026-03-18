# HealthAI Portal — Completed Work Summary

> **Purpose**: Handoff document for a new agent. Read this before touching any code.

---

## Project Overview

A **Vite + React SPA** (no TypeScript, no React Router). Located at `d:\Healcare Frontend`.

- **Routing**: Single `useState('dashboard')` in `App.jsx` -> `currentView` string controls everything.
- **Styling**: Pure CSS in `src/index.css` (no Tailwind). Uses CSS custom properties defined in `:root`.
- **Icons**: All SVG icons live in `src/icons.jsx` as named exports, each with PropTypes.
- **PropTypes**: `prop-types` package installed. Every component has `.propTypes` declarations.
- **No React Router**. Navigation is always done via `setCurrentView('view-name')`.

---

## Design System (strictly enforced — do not deviate)

| Token | Value |
|---|---|
| Font | Inter (Google Fonts, already imported in `index.html`) |
| Background | `--color-bg: #ffffff` |
| Border | `--color-border: #e2e8f0` (slate-200) |
| Primary text | `--color-text-primary: #0f172a` (slate-900) |
| Secondary text | `--color-text-secondary: #64748b` (slate-500) |
| Muted text | `--color-text-muted: #94a3b8` (slate-400) |
| Accent (buttons, active states ONLY) | `--color-accent: #4f46e5` (indigo-600) |
| Accent hover | `--color-accent-hover: #4338ca` (indigo-700) |
| Alert background | `--color-rose-50: #fff1f2` |
| Alert text | `--color-rose-700: #be123c` |
| **Forbidden** | No gradients, no glow effects, no `box-shadow` heavier than `shadow-sm` |

---

## File Structure

```
src/
├── App.jsx                          ← Root router (~45 lines). Manages currentView + selectedAppointment state.
├── icons.jsx                        ← All SVG icons (named exports): IconHeart, IconStethoscope, IconCalendar,
│                                      IconWarning, IconClose, IconArrowLeft, IconSparkle, IconStar, IconCheck,
│                                      IconMapPin, IconCalendarCheck
├── index.css                        ← All styles (~1660 lines). CSS custom properties in :root.
├── main.jsx                         ← Vite entry, renders <App />
│
├── components/
│   └── Navbar.jsx                   ← Sticky top bar. Props: { currentView, setCurrentView }
│                                      - Logo (indigo heart icon + "HealthAI" | "Patient Portal")
│                                      - Centered nav links: "Dashboard" / "My Appointments" (active = indigo underline)
│                                      - Right: avatar "JD" + "Jane Doe"
│
└── views/
    ├── Dashboard.jsx                ← Props: { setCurrentView }
    │                                  - Greeting, allergy banner (dismissible, rose-50)
    │                                  - 2 action cards → 'symptom-checker', 'booking-wizard'
    │                                  - Upcoming appointments section (static sample data)
    │
    ├── SymptomCheckerView.jsx       ← Props: { setCurrentView }
    │                                  - Back → 'dashboard'
    │                                  - AI chat UI (3 pre-seeded messages, quick reply chips)
    │                                  - "Book Appointment" CTA → 'booking-wizard'
    │
    ├── BookingWizardView.jsx        ← Props: { setCurrentView }
    │                                  - 3-step wizard with local state (step 1→2→3)
    │                                  - Step 1: specialty grid (3 cards) + doctor cards (2)
    │                                  - Step 2: 7-day date strip + 8-slot time grid (2 unavailable)
    │                                  - Step 3: summary card + allergy reminder (rose) + confirm
    │                                  - Confirm → 'booking-confirmed'
    │
    ├── BookingConfirmedView.jsx     ← Props: { setCurrentView }
    │                                  - Success screen: checkmark icon ring, "You're all set, Jane."
    │                                  - "Back to Dashboard" → 'dashboard'
    │
    ├── RescheduleView/
    │   └── index.jsx                ← Props: { setCurrentView, selectedAppointment }
    │                                  - Back → 'appointments'
    │                                  - Read-only current appointment summary card (bg-slate-50)
    │                                  - Day strip (MAR 20–26, SUN 23 unavailable, SAT 22 pre-selected)
    │                                  - Time grid (8 slots, 9:00/9:30 unavailable, 11:00 pre-selected)
    │                                  - Live change-summary diff card (old=strikethrough, new=bold)
    │                                  - "Keep Original" → 'appointments'
    │                                  - "Confirm Reschedule" → 'reschedule-confirmed'
    │
    ├── RescheduleConfirmedView.jsx  ← Props: { setCurrentView }
    │                                  - Calendar-check icon, "Appointment Rescheduled."
    │                                  - "View My Appointments" → 'appointments'
    │                                  - "Back to Dashboard" → 'dashboard'
    │
    └── AppointmentsView/
        ├── index.jsx                ← Props: { setCurrentView, setSelectedAppointment }
        │                              - "Upcoming" / "Past" tabs
        │                              - Manages upcoming array state (can be filtered on cancel)
        │                              - Toast state (auto-dismiss 4s)
        │                              - Empty state when all cancelled → 'booking-wizard'
        │
        ├── UpcomingCard.jsx         ← Props: { appt, onReschedule, onCancel }
        │                              - Normal state: doctor info, Reschedule + Cancel buttons
        │                              - Cancel click → inline confirmation row (rose-50 bg)
        │                              - "Yes, Cancel" → opacity fade (300ms) → remove from array → toast
        │                              - "Keep it" → revert to normal
        │                              - Status badges: "Confirmed" (indigo), "Pending" (amber)
        │
        ├── PastCard.jsx             ← Props: { appt }
        │                              - Muted styling, no action buttons
        │                              - "Completed" badge (slate), "View Notes" link (no-op for now)
        │
        ├── Toast.jsx                ← Props: { message, onDismiss }
        │                              - Fixed bottom-center, bg-slate-800 text-white, slide-in animation
        │                              - Auto-dismisses via setTimeout(onDismiss, 4000) in useEffect
        │
        └── data.js                  ← UPCOMING_APPOINTMENTS (3 items) + PAST_APPOINTMENTS (2 items)
```

---

## App State (in `App.jsx`)

```jsx
const [currentView,         setCurrentView]         = useState('dashboard')
const [selectedAppointment, setSelectedAppointment] = useState(null)
```

- `selectedAppointment` is set by `AppointmentsView` before navigating to `'reschedule'`
- It is passed into `RescheduleView` as a prop; falls back to Dr. Sarah Chen defaults if null

---

## All Valid `currentView` Values

| Value | Renders |
|---|---|
| `'dashboard'` | Dashboard |
| `'symptom-checker'` | SymptomCheckerView |
| `'booking-wizard'` | BookingWizardView |
| `'booking-confirmed'` | BookingConfirmedView |
| `'appointments'` | AppointmentsView |
| `'reschedule'` | RescheduleView |
| `'reschedule-confirmed'` | RescheduleConfirmedView |

---

## CSS Conventions

- All classes use BEM-like prefixes by feature:
  - `.navbar-*` — navbar
  - `.nav-link*` — navbar navigation links
  - `.page-container`, `.section-label` — dashboard
  - `.sc-*` — SymptomCheckerView (also reused as base for back-button in other views)
  - `.chat-*` — chat window inside SymptomCheckerView
  - `.bw-*` — BookingWizardView (stepper, specialty cards, time pills, etc.)
  - `.bc-*` — BookingConfirmedView (also reused by RescheduleConfirmedView)
  - `.av-*` — AppointmentsView (tabs, card list, empty state, toast)
  - `.appt-*`, `.btn-appt-*`, `.badge-*` — appointment cards (shared between upcoming/past)
  - `.rs-*` — RescheduleView
  - `.rc-*` — RescheduleConfirmedView
- **Reuse** existing classes where possible. For example:
  - `.sc-back-btn` is the back-navigation button style, reused in RescheduleView
  - `.bw-day-pill`, `.bw-time-pill`, `.bw-section-label` are reused in RescheduleView
  - `.bc-container`, `.bc-icon-wrap`, `.bc-title`, `.bc-subtitle`, `.bc-back-btn` are reused in RescheduleConfirmedView
  - `.appt-badge`, `.badge--indigo`, `.badge--amber`, `.badge--slate` are shared badge styles

---

## Dev Server

Run `npm run dev` in `d:\Healcare Frontend`. Vite serves on `http://localhost:5173`.

---

## Known Non-Critical Lint Warnings (safe to ignore)

- CSS contrast warnings on `.bw-circle--idle` and `.bw-step--idle`: intentionally de-emphasized per design spec (idle stepper steps are meant to be muted).
- SonarQube may flag these; they are design choices, not bugs.
