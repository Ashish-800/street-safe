<p align="center">
  <img src="https://img.shields.io/badge/React_Native-Expo_SDK_56-blue?style=for-the-badge&logo=expo" />
  <img src="https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=for-the-badge&logo=supabase" />
  <img src="https://img.shields.io/badge/Maps-Mapbox-000?style=for-the-badge&logo=mapbox" />
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-orange?style=for-the-badge" />
</p>

# 🛡️ StreetSafe

**A hyper-local women's safety application built for Kolkata.**

StreetSafe empowers women with real-time safety intelligence, AI-powered route recommendations, tactical emergency tools, and community-driven incident reporting — all in one premium, production-ready mobile app.

---

## ✨ Features

### 🧠 AI Safe Route Engine
- Computes safety scores for routes using a multi-factor algorithm
- Analyzes **incident proximity** (Haversine distance to reported dangers), **time-of-day risk**, **crowd density**, **street lighting estimation**, and **transport mode vulnerability**
- Auto-sorts routes by safety — the safest path gets an **AI PICK** badge
- Supports walking, cycling, and driving via Mapbox Directions API

### 🚨 Emergency SOS
- **3-second hold-to-activate** SOS with animated SVG progress ring
- Logs emergency events with GPS coordinates to the database
- Alerts emergency contacts and authorities instantly

### 📡 Live Location Sharing
- Real-time GPS tracking with reverse geocoding
- Auto-syncs location to the cloud every 30 seconds when sharing is enabled
- Emergency contacts can monitor your live position

### 📢 Community Incident Reporting
- Crowd-sourced safety alerts across Kolkata neighborhoods
- Color-coded severity levels: Severe · Moderate · Safe · Info
- Geo-tagged incident submission with location auto-fill

### 🔧 Tactical Safety Tools
- **Fake Call** — Full-screen realistic incoming call simulator
- **Voice Recorder** — Covert audio evidence capture
- **Flashlight** — Quick-access torch toggle
- **Loud Siren** — 75dB alarm to draw attention
- **Silent Photo** — Discreet burst image capture
- **Call Police** — One-tap dial to Kolkata Police (100)

### 🎨 Premium UI/UX
- Warm cream & orange theme designed for trust and calm
- Full dark mode support
- Smooth micro-animations and glassmorphism effects
- Custom SVG safety score gauge on the dashboard

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native (Expo SDK 56) |
| Routing | Expo Router (file-based) |
| Backend & Auth | Supabase (PostgreSQL + Auth + RLS) |
| Maps & Geocoding | Mapbox API |
| Animations | React Native Reanimated |
| Icons | Lucide React Native |
| Deployment | Vercel (static SPA) |

---

## 📂 Project Structure

```
├── app/
│   ├── (tabs)/           # Tab screens — Home, Alerts, Map, Route, Tools, Profile
│   ├── auth/             # Login & Signup
│   ├── _layout.tsx       # Root layout with global providers
│   └── index.tsx         # Splash screen
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # Auth, Location, Theme providers
│   ├── lib/              # Supabase client with offline fallback
│   ├── mock/             # Fallback data for offline mode
│   └── theme/            # Design tokens (colors, spacing, typography)
├── assets/               # Images, icons, fonts
└── vercel.json           # Vercel deployment config
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/Ashish-800/street-safe.git
cd street-safe

# Install dependencies
npm install

# Create a .env file with your API keys
cp .env.example .env
# Fill in your Supabase and Mapbox credentials

# Start the development server
npm start
```

Press `w` for web, `a` for Android, or `i` for iOS.

### Environment Variables

Create a `.env` file in the root directory with the following keys:

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_MAPBOX_TOKEN=
```

> The app includes an offline fallback mode — it works without these keys using local mock data, but live features require valid credentials.

---

## ☁️ Deployment (Vercel)

1. Push the repo to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Set **Build Command** to `npm run build` and **Output Directory** to `dist`
4. Add the three environment variables above
5. Deploy

---

## 📄 License

MIT — see [LICENSE](./LICENSE) for details.
