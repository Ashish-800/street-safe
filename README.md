# StreetSafe 🚨

StreetSafe is a modern, high-performance, hyper-local women's safety web and mobile application designed specifically for the city of Kolkata. Built with **React Native (Expo SDK 56)**, **Expo Router**, **Supabase**, and **Mapbox**, StreetSafe provides production-quality tactical safety tools, live location telemetry sharing, and an AI-powered safe routing engine to protect users in transit.

StreetSafe features a warm, trustworthy, cream-and-orange theme (`#FFF9EF` to `#F97316`) designed to look premium, reduce eye-strain, and remain highly visible under harsh lighting conditions. It runs seamlessly on iOS, Android, and Web platforms, and is optimized for deployment on Vercel as a Single Page Application (SPA).

---

## 🌟 Core Features

### 1. 🧠 AI-Powered Safety Routing Engine
StreetSafe implements a multi-factor safety evaluation algorithm to compute and sort routes between any two points in Kolkata:
*   **Incident Proximity Calculation**: Uses the **Haversine formula** to measure real-time distance from the route path to any active database reports.
*   **Dynamic Time-of-Day Risk Assessment**: Adapts scoring dynamically depending on the current time (e.g., late-night safety warnings).
*   **Crowd Density & Lighting Estimation**: Estimates human activity levels and street lighting conditions based on time-of-day models.
*   **Route Mode Penalty**: Accounts for vulnerability based on transport mode (e.g., walking, cycling, driving).
*   **Safest Route Auto-sorting**: Recommends the safest possible path with a prominent **AI PICK** badge.

### 2. ⚡ Tactical Emergency Tools
A collection of rapid-access safety widgets available directly from the bottom navigation or quick action deck:
*   **3-Second Hold SOS**: A safety button built with custom SVG stroke animation. Prevents accidental presses by requiring a continuous 3-second hold to dispatch telemetry and register an active SOS state in the database.
*   **Fake Call Simulator**: Triggers a realistic, full-screen incoming call overlay (e.g., "Mom") with audio simulation to provide a safe excuse to exit uncomfortable situations.
*   **Covert Voice Recorder**: Records background audio evidence and saves it locally.
*   **Flashlight Toggle**: Fast illumination control.
*   **Loud Siren & Silent Photo**: Tools to draw attention or silently capture and upload images.
*   **Call Police**: Immediate hot-link to Kolkata Police (100).

### 3. 📡 Live Location Telemetry Sharing
*   Provides real-time location reverse geocoding using the Mapbox API.
*   A togglable sharing switch automatically syncs latitude and longitude coordinates to the `location_shares` database table every 30 seconds.
*   Enables emergency contacts to track the user's live position in real-time.

### 4. 📢 Crowd-Sourced Hyper-Local Incident Registry
*   Interactive alert log displaying safety warnings throughout Kolkata (e.g., poorly lit streets, traffic issues, active security alerts).
*   Categorized by severity: **Severe (Red)**, **Moderate (Yellow)**, **Safe/Verified (Green)**, and **Info (Blue)**.
*   A "Report Incident" modal lets authenticated users instantly submit detailed, geo-tagged incident logs directly to the public registry.

### 5. 🎨 Universal Theme & UI Aesthetics
*   Fully optimized for both **Warm Light Mode** (soothing orange/cream theme) and **Sleek Dark Mode** via React Context.
*   Smooth micro-animations, glassmorphism overlays, and premium typography using modern icon sets.

---

## 🛠️ Tech Stack

*   **Framework**: [Expo SDK 56](https://docs.expo.dev/) (React Native Web)
*   **Navigation / Routing**: [Expo Router v56](https://docs.expo.dev/router/introduction/) (File-based router)
*   **Database / Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Realtime subscriptions, row-level security)
*   **Mapping Services**: [Mapbox API](https://www.mapbox.com/) (Geocoding & Directions)
*   **Animations**: [React Native Reanimated](https://docs.expo.dev/versions/latest/sdk/reanimated/)
*   **Vector Graphics**: [React Native SVG](https://github.com/react-native-svg/react-native-svg)
*   **Icons**: [Lucide React Native](https://lucide.dev/)
*   **Deployment**: [Vercel](https://vercel.com/) (Fully optimized with static single-page rewrites)

---

## 📂 Project Structure

```
street_safe_app/
├── app/                      # Expo Router File-Based Navigation
│   ├── (tabs)/               # Bottom-Tab Navigator Screens
│   │   ├── _layout.tsx       # Custom Tab Bar with Elevated central SOS button
│   │   ├── index.tsx         # Dashboard with Safety Score Gauge & Alerts Feed
│   │   ├── alerts.tsx        # Incident Log Registry & Report Incident Modal
│   │   ├── map.tsx           # Telemetry Sharing, Location Sync, Safety Contacts
│   │   ├── route.tsx         # AI Safety Route Suggestion & Factor Breakdown
│   │   ├── tools.tsx         # SOS Ring, Fake Call, Siren, Torch, Voice Recorder
│   │   └── profile.tsx       # User Settings, Stats Counters, Theme Switcher
│   ├── auth/
│   │   └── login.tsx         # Phone/Email Login and Signup Tab Layout
│   ├── _layout.tsx           # Global Providers Setup (Theme, Auth, Location)
│   ├── index.tsx             # Interactive Splash / Welcome Landing Screen
│   ├── modal.tsx             # Generic info sheet overlay
│   ├── +html.tsx             # Document head settings (SEO tags, viewport metadata)
│   └── +not-found.tsx        # Fallback 404 Route Screen
├── assets/                   # Image assets, icons, and fonts
├── components/               # Custom UI Components (Gauge, Badges, Cards)
└── src/
    ├── components/
    │   ├── AlertCard.tsx     # Display card for incidents
    │   ├── ContactCard.tsx   # Display card for emergency contacts
    │   ├── KolkataMap.tsx    # Native maps container
    │   ├── KolkataMap.web.tsx# Web-friendly static Mapbox geocoded view
    │   ├── RouteCard.tsx     # Details container for suggested paths
    │   ├── SafetyBadge.tsx   # Color-coded rating badge
    │   └── SOSButton.tsx     # Reusable SOS button component
    ├── context/
    │   ├── AuthContext.tsx   # Supabase auth wrapper & mock fallback logic
    │   └── LocationContext.tsx# Browser Geolocation + Mapbox Reverse Geocoder
    ├── lib/
    │   └── supabase.ts       # Supabase proxy client (Handles offline mock database)
    ├── mock/                 # Fallback offline static mock data
    │   ├── alerts.ts
    │   ├── contacts.ts
    │   └── routes.ts
    └── theme/                # Custom Theme Configuration & Design Tokens
        ├── ThemeContext.tsx  # Dynamic Dark/Light mode theme state
        ├── colors.ts         # Palette definitions (orange, emerald, cream, darks)
        ├── spacing.ts        # Layout margins and paddings
        └── typography.ts     # Font sizes and weights
```

---

## ⚡ Transparent Supabase Proxy Client (Offline Developer Mode)

To support seamless local development, testing, and operation in poor network environments, StreetSafe contains a custom **Supabase Proxy Client** located at [supabase.ts](file:///p:/street_safe_app/src/lib/supabase.ts).

*   If environment variables `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are not set or fail to connect, the client **automatically redirects all authentication, read, insert, update, and delete queries to an offline mock database** backed by `AsyncStorage`.
*   All user profile changes, location sharing logs, reported incidents, and SOS triggers will continue to operate locally, ensuring zero-configuration startup.

---

## 🗄️ Database Setup (Supabase SQL DDL)

If you are using a live Supabase instance, run the following SQL script in your Supabase SQL Editor to initialize the necessary tables, Row Level Security (RLS) policies, and triggers:

```sql
-- 1. Setup Profiles Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automate Profile Creation on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'phone_number',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Setup Safety Contacts Table
CREATE TABLE public.safety_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Setup Alerts Registry Table
CREATE TABLE public.alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  severity TEXT CHECK (severity IN ('SEVERE', 'MODERATE', 'SAFE', 'INFO')) DEFAULT 'MODERATE',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Setup Location Telemetry Shares Table
CREATE TABLE public.location_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  is_sharing BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Setup SOS Events Table
CREATE TABLE public.sos_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_text TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Setup Saved Safe Routes Table
CREATE TABLE public.saved_routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  safety_score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_routes ENABLE ROW LEVEL SECURITY;

-- 7. Define RLS Policies
-- Profiles
CREATE POLICY "Users can read all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Safety Contacts
CREATE POLICY "Users can manage safety contacts" ON public.safety_contacts ALL USING (auth.uid() = user_id);

-- Alerts
CREATE POLICY "Anyone can read active alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Auth users can report alerts" ON public.alerts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Location Shares
CREATE POLICY "Users can manage their own share status" ON public.location_shares ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read location shares" ON public.location_shares FOR SELECT USING (true);

-- SOS Events
CREATE POLICY "Users can manage their own SOS events" ON public.sos_events ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read SOS events" ON public.sos_events FOR SELECT USING (true);

-- Saved Routes
CREATE POLICY "Users can manage their saved routes" ON public.saved_routes ALL USING (auth.uid() = user_id);

-- Seed Initial Hyper-Local Kolkata Alerts
INSERT INTO public.alerts (title, description, location, latitude, longitude, severity)
VALUES
  ('Chain snatching reported', 'Multiple incidents near the metro gate exit.', 'Tollygunge Metro', 22.4986, 88.3476, 'SEVERE'),
  ('Poor street lighting', 'Footpaths are dark. Avoid walking alone.', 'Behala Chowrasta', 22.4989, 88.3070, 'MODERATE'),
  ('Police patrol vehicle active', 'Regular police patrolling observed.', 'Gariahat Market', 22.5176, 88.3694, 'SAFE'),
  ('Late night cab stand', 'Safe well-lit taxi stand with police presence.', 'Howrah Station Exit', 22.5839, 88.3426, 'SAFE'),
  ('Waterlogging near crossing', 'Expect traffic delay and low visibility.', 'Park Street Crossing', 22.5521, 88.3536, 'INFO'),
  ('Crowded market market zone', 'High density pickpocket alert.', 'New Market Area', 22.5573, 88.3515, 'MODERATE');
```

---

## ⚙️ Environment Variables Configuration

Create a file named `.env` in the root directory and configure the following keys:

```ini
# Supabase Integration API Keys
EXPO_PUBLIC_SUPABASE_URL=https://<your-supabase-project-id>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Mapbox API Token for geocoding, directions, and static maps
EXPO_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoibWFwYm94LXNlcnZpY2VzIn0.example_token
```

---

## 🚀 Installation & Local Development Setup

Follow these steps to run StreetSafe locally:

### Prerequisites
*   Node.js (v18 or higher recommended)
*   npm or yarn package manager

### Steps
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Ashish-800/street-safe.git
    cd street-safe
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    Run metro bundler on your local machine:
    ```bash
    npm start
    ```
    *   Press `w` to start running in Web view in your browser.
    *   Press `a` to run on a connected Android device/emulator.
    *   Press `i` to run on a connected iOS device/simulator.

4.  **Build Production Bundle**:
    Generate static HTML/JS output files for web hosting:
    ```bash
    npm run build
    ```
    This generates static output inside the `dist` directory.

---

## ☁️ Deployment Guide (Vercel)

StreetSafe is fully compatible with Vercel for instant static hosting.

### Method 1: Deploy with Vercel CLI
1.  Install Vercel globally:
    ```bash
    npm install -g vercel
    ```
2.  Deploy the project:
    ```bash
    vercel
    ```

### Method 2: Import via Vercel Dashboard (Recommended)
1.  Push the codebase to a GitHub, GitLab, or Bitbucket repository.
2.  Open the [Vercel Dashboard](https://vercel.com/) and click **Add New** -> **Project**.
3.  Import your repository.
4.  Configure the project settings:
    *   **Framework Preset**: Select `Other` (or leave it empty/default).
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
5.  Add the **Environment Variables** in the project settings panel:
    *   `EXPO_PUBLIC_SUPABASE_URL`
    *   `EXPO_PUBLIC_SUPABASE_ANON_KEY`
    *   `EXPO_PUBLIC_MAPBOX_TOKEN`
6.  Click **Deploy**. Vercel will build the Expo web export bundles and configure single-page application router rewrites as defined in `vercel.json`.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](file:///p:/street_safe_app/LICENSE) file for details.
