# LifeLink (Bengaluru Edition)
### *Every Drop Counts. Be Someone's Lifeline.*

LifeLink is a production-oriented, full-stack, real-time blood donor registry and emergency requisition platform engineered to connect hospital patients requiring transfusions with nearby, willing, and contactable donors within minutes.

- **Initial Launch Service Area:** Bengaluru, Karnataka, India (18+ BBMP Localities & Major Blood Centres)
- **Expansion Target:** Karnataka and Pan-India
- **Platform Architecture:** React 19, TypeScript (Strict Mode), Vite, Tailwind CSS, Supabase, Leaflet, Progressive Web App (PWA)

---

## 1. Technology Architecture

- **Frontend Core:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend & Database:** PostgreSQL 15+ (Supabase), Row Level Security (RLS), Triggers, Realtime Replication
- **Preliminary Matching Engine:** Component-aware ABO/Rh clinical matrix, Haversine proximity calculations, 90-day rest interval enforcement
- **Mapping & Geofencing:** Leaflet, OpenStreetMap, DPDP ~1.1 km privacy blur rings
- **Real-Time Data Layer:** Supabase Realtime Channels (`blood_requests`, `donor_responses`), `BroadcastChannel` multi-tab bus, Web Audio API synthetic alert chimes
- **Multichannel Notifications:** Web Push Notifications (`public/sw.js`), Indian TRAI DLT Registered SMS templates (`LIFELK`), Transactional Email
- **PWA & Offline Resilience:** Web App Manifest (`manifest.json`), Service Worker caching, offline emergency hospital hotlines
- **Security & Privacy:** Indian Digital Personal Data Protection (DPDP) Act compliance, anti-self-admin escalation triggers, anti-spam requisition rate limiters
- **Deployment Target:** Vercel (Frontend & SPA Rewrites) + Supabase (Database/Auth/Realtime)

---

## 2. All 10 Phases Implemented

| Phase | Description | Status | Deliverables |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Foundation & UI Design System | **COMPLETED** | Vite + React + TypeScript setup, Tailwind medical design tokens, responsive public landing page, interactive blood group/locality discovery, safety charter, Bengaluru emergency blood banks, modals for request creation & donor onboarding. |
| **Phase 2** | Backend Schema & Supabase Auth | **COMPLETED** | PostgreSQL normalized DDL migration (`profiles`, `donor_profiles`, `requester_profiles`, `blood_requests`, `donor_responses`, `admin_audit_logs`, `locality_records`), Row Level Security policies, Anti-Self-Admin Escalation trigger, typed Supabase client, AuthContext with live/dev session provider, and dedicated Donor, Requester & Admin dashboards. |
| **Phase 3** | Donor Registry & Availability | **COMPLETED** | Multi-tab Donor Command Center (`Overview`, `Matching Requests`, `Complete Profile`, `Availability & Radii`, `Donation History`), automated 90-day whole blood rest calculator, two-factor OTP phone verification contract (`PhoneVerificationModal`), privacy-preserving coarse GPS capture (`geoUtils.ts`), and DPDP Right to Erasure account deletion. |
| **Phase 4** | Emergency Requisition System | **COMPLETED** | 4-step Emergency Creation Wizard (`CreateEmergencyRequestWizard`), blood component selector (PRBC, Whole Blood, Platelets, FFP, Cryoprecipitate), anti-spam rate limiting & duplicate detection engine (`spamDetector.ts`), verified vs pending requisition gating, and upgraded Requester Command Center with live donor responses & fulfillment tracking. |
| **Phase 5** | Preliminary Matching Engine | **COMPLETED** | Clinical compatibility engine (`matchingEngine.ts`) with PRBC/Platelet/FFP rules, Haversine proximity calculations, 90-day rest interval cooldown audit, Leaflet map component (`ProximityMap.tsx`) with DPDP ~1.1km privacy blur rings, upgraded Find Donors explorer (`FindDonorsPage.tsx`), and Requester live proximity matching modal with instant broadcast alert dispatcher. |
| **Phase 6** | Real-Time Subscriptions & Audio | **COMPLETED** | Supabase Realtime channels (`public:blood_requests`, `public:donor_responses`), cross-tab `BroadcastChannel` bus, Web Audio API synthetic alert chimes (`audioChime.ts`), real-time status pill widget (`RealtimeStatusIndicator.tsx`), floating emergency alerts dock (`RealtimeToastContainer.tsx`), notifications drawer (`NotificationsDrawer.tsx`), and live two-way donor/requester synchronization. |
| **Phase 7** | Multichannel Notifications | **COMPLETED** | Web Push service worker (`public/sw.js`), Indian TRAI DLT Registered SMS templates (`smsService.ts`), Transactional Email generator (`emailService.ts`), and unified dispatch orchestrator (`notificationOrchestrator.ts`). |
| **Phase 8** | Admin Operations & Audit Logs | **COMPLETED** | Comprehensive Operations Console (`AdminDashboardPage.tsx`), requisition moderation queue, donor registry standing manager, and immutable DPDP security audit logs viewer. |
| **Phase 9** | Progressive Web App & Offline | **COMPLETED** | Web App Manifest (`manifest.json`), service worker caching strategy (`sw.js`), offline emergency standby banner (`OfflineEmergencyBanner.tsx`) with tap-to-call blood centres and 104 hotline. |
| **Phase 10** | E2E Testing & Vercel Deploy | **COMPLETED** | 37-test automated verification suite (`lifelink_e2e.test.ts`), `vercel.json` SPA configuration and security headers, production build verification (`npm run build`). |

---

## 3. Medical Safety & Privacy Principles

1. **Mandatory Clinical Crossmatching:**
   LifeLink provides preliminary donor discovery based on ABO/Rh grouping and proximity. The platform **does not certify medical eligibility**. Transfusions require hospital crossmatching and clinical assessment by licensed blood centres.
2. **Indian DPDP Act Compliance:**
   Donor phone numbers and exact home coordinates are never publicly exposed or scrapable. Requesters initiate contact only through authenticated, verified emergency requisition channels. Coarse location blur (~1.1 km) is applied by default.
3. **Strict Non-Commercialization:**
   In compliance with the Drugs and Cosmetics Act and National Blood Transfusion Council (NBTC) guidelines, blood trading or remuneration is strictly illegal. LifeLink supports 100% voluntary, unpaid donors.
4. **90-Day Donor Interval:**
   Built-in safety trackers ensure donors respect the mandatory 90-day rest interval after whole blood donation, 14 days for apheresis platelets, and 28 days for plasmapheresis.

---

## 4. Local Development & Verification

### Running the Application
```powershell
# Double-click or run the Windows launcher
.\start.bat

# Or run directly via PowerShell
.\dev.ps1
```

The application runs at `http://localhost:5173`.

### Running the End-to-End Automated Test Suite
```bash
npx tsx src/utils/__tests__/lifelink_e2e.test.ts
```

### Production Build & Type Checking
```bash
npm run build
```

---

## 5. Vercel Production Deployment Guide

1. **Push to GitHub**:
   ```bash
   git push origin master
   ```
2. **Import Project into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com).
   - Select **Add New** $\to$ **Project** $\to$ Import your LifeLink GitHub repository.
   - Framework Preset: **Vite**.
   - Build Command: `npm run build`.
   - Output Directory: `dist`.
3. **Set Environment Variables**:
   Configure the following in the Vercel project settings:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL (`https://your-project.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Public Anon Key
   - `VITE_SMS_GATEWAY_API_KEY`: SMS Gateway Provider Key
   - `VITE_SMS_DLT_SENDER_ID`: `LIFELK`
   - `VITE_FIREBASE_VAPID_KEY`: Web Push VAPID Public Key
4. **Deploy**:
   Click **Deploy**. Vercel will automatically read `vercel.json` for SPA rewrites and security headers.
