# LifeLink (Bengaluru Edition)
### *Every Drop Counts. Be Someone's Lifeline.*

LifeLink is a production-oriented, full-stack, real-time blood donor registry and emergency request platform designed to connect hospital patients with verified, nearby, willing donors as quickly as possible.

- **Initial Launch Service Area:** Bengaluru, Karnataka, India
- **Expansion Target:** Karnataka and Pan-India
- **Platform:** Responsive Web Application & Progressive Web App (PWA)

---

## 1. Technology Architecture

- **Frontend:** React 19, TypeScript (Strict Mode), Vite, Tailwind CSS, Lucide React icons
- **Backend:** Supabase, PostgreSQL 15+, Supabase Auth, Row Level Security, Supabase Realtime
- **Geolocation & Mapping:** Leaflet & OpenStreetMap with privacy-preserving radius circles
- **Notifications:** Browser Push (FCM), transactional email & SMS integration contracts
- **Deployment Target:** Vercel (Frontend) & Supabase (Database/Auth/Realtime)

---

## 2. Medical Safety & Privacy Principles

1. **Mandatory Clinical Crossmatching:**
   LifeLink provides preliminary donor discovery based on ABO/Rh grouping and proximity. The platform **does not certify medical eligibility**. Transfusions require hospital crossmatching and clinical assessment by licensed blood centres.
2. **Indian DPDP Act Compliance:**
   Donor phone numbers and exact home coordinates are never publicly exposed or scrapable. Requesters initiate contact only through authenticated, verified emergency requisition channels.
3. **Strict Non-Commercialization:**
   In compliance with the Drugs and Cosmetics Act and National Blood Transfusion Council (NBTC) guidelines, blood trading or remuneration is strictly illegal. LifeLink supports 100% voluntary, unpaid donors.
4. **90-Day Donor Interval:**
   Built-in safety trackers ensure donors respect the mandatory 90-day rest interval after whole blood donation.

---

## 3. Getting Started in VS Code

### Prerequisites
- Node.js LTS (v20+ or v26+)
- Git (`git --version`)
- Modern web browser (Chrome, Edge, Firefox, Safari)

### Local Setup
```bash
# 1. Clone repository
git clone https://github.com/your-username/LifeLink.git
cd LifeLink

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Start local development server
npm run dev
```

The application will be live at `http://localhost:5173`.

### Production Build & Type Checking
```bash
npm run build
```

---

## 4. Design System Tokens

- **Primary Medical Red:** `#B91C1C` / `#991B1B`
- **Pure White Canvas:** `#FFFFFF`
- **Soft Slate Background:** `#F8FAFC`
- **Dark Charcoal:** `#0F172A` / `#1E293B`
- **Verified Emerald:** `#059669`
- **Emergency Coral:** `#EF4444`
- **Warning Amber:** `#D97706`

---

## 5. Development Roadmap

- [x] **Phase 1:** Foundation, responsive medical design system, landing page, interactive discovery, safety charter & Bengaluru blood bank directory.
- [ ] **Phase 2:** Supabase integration, PostgreSQL DDL schemas, RLS policies, role-based auth.
- [ ] **Phase 3:** Donor registry profiles, availability toggle, and privacy controls.
- [ ] **Phase 4:** Emergency requisition creation, anti-spam validation, and verification gating.
- [ ] **Phase 5:** Geofenced proximity matching engine with Haversine radius calculations.
- [ ] **Phase 6:** Supabase Realtime live subscriptions for request responses.
- [ ] **Phase 7:** Multichannel notifications (Push, Email, transactional SMS).
- [ ] **Phase 8:** Admin dashboard, request moderation, and immutable audit logs.
- [ ] **Phase 9:** Progressive Web App (PWA) manifest, service worker caching, and accessibility audit.
- [ ] **Phase 10:** Automated testing, security hardening, and Vercel production deployment.
