# Kaizen Mobile — The High-Performance True-Status Reader 📱⚡

> **Native execution. JSI-powered rendering. Zero compromises.**
> A "Trojan Horse" mobile client that brings the **True-Status** philosophy to iOS and Android, utilizing the Expo Managed Workflow to deliver 60 FPS performance on the UI thread.

---

## 🏗️ Architectural Vision: "The Benign Shell"

Unlike traditional manga apps that hardcode parsers (and get banned from App Stores), **Kaizen Mobile** functions as a neutral rendering engine.

### 1. The Core (Shell)

A strictly typed, benign TypeScript codebase that handles:

* **UI/UX Rendering** (React Native Reanimated)
* **State Management** (Zustand)
* **Database Sync** (Supabase)
* **Image Caching** (Sliding Window Buffer)

### 2. The Extensions (Dynamic) 🛡️

Content sources are loaded dynamically via a **Sandboxed QuickJS Runtime**.

* **No piracy logic is shipped in the bundle.**
* Parsers are fetched at runtime or side-loaded by the user.
* **The Scraping Bridge:** A hidden, headless WebView allows the app to bypass Cloudflare turnstiles, extracting `cf_clearance` cookies and passing them to the Native Network Client via JSI.

---

## ⚡ Performance Mandates

We do not use standard React Native components where performance is critical.

| Requirement | Implementation | Rationale |
| --- | --- | --- |
| **Lists & Grids** | `@shopify/flash-list` | 5x performance over FlatList on low-end Android. |
| **Storage** | `react-native-mmkv` | Synchronous, JSI-based C++ storage. No async/await lag. |
| **Animations** | `react-native-reanimated` | All gestures/transitions run on the UI Thread. |
| **Styling** | `nativewind` | Compile-time Tailwind CSS for consistent design capability. |
| **Routing** | `expo-router` | File-system based routing matching Next.js patterns. |

---

## 🛠️ Tech Stack

**Framework:** Expo SDK 50+ (Managed Workflow)
**Language:** TypeScript 5.0 (Strict Mode)

| Layer | Technology | Note |
| --- | --- | --- |
| **View Layer** | React Native (New Arch) | Bridged via JSI for direct native access. |
| **Network** | Axios + Cookie Manager | Custom interceptors for Cloudflare evasion. |
| **Database** | Supabase (PostgreSQL) | Mirrors `web` schema for history/bookmarks. |
| **State** | Zustand | Transient reader state (page, zoom, brightness). |
| **Navigation** | Expo Router v3 | Deep-link capable architecture. |

---

## 🔌 The "Sliding Window" Reader Engine

To handle high-resolution manga chapters without OOM (Out of Memory) crashes on older devices, we implement a strict memory budget.

1. **Pre-Fetch:** `Current Index + 2` images are downloaded to FS cache.
2. **Render:** Only `Current Index`, `Prev`, and `Next` are mounted in the FlashList.
3. **Garbage Collection:** Images outside the window are aggressively unmounted and memory is freed.

---

## 🚀 Getting Started

### 🔑 Prerequisites

* **Node.js 20+** (LTS)
* **Bun** or **Yarn** (Preferred over npm for speed)
* **Expo Go** (For quick testing) or **Development Build** (Required for JSI/MMKV)

### 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/kaizen-mobile.git
cd kaizen-mobile

# Install dependencies (frozen lockfile mandatory)
bun install

```

### ⚙️ Environment Config

Copy `.env.example` to `.env`:

```env
# Supabase Configuration (Must match Web Project)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# MangaDex Proxy (If using an intermediate relay)
EXPO_PUBLIC_MANGADEX_PROXY=https://api.mangadex.org

```

### ▶️ Run the Project

**Development (Expo Go):**
*Limited functionality. JSI modules may fallback to shim implementations.*

```bash
npx expo start

```

**Production Simulation (Prebuild):**
*Required for MMKV, Reanimated, and native extensions.*

```bash
npx expo prebuild
npx expo run:ios   # or run:android

```

---

## 🧠 Porting Guide (Web to Mobile)

Developers moving from the `web/` directory should observe these translation rules:

| Web Concept (`web/`) | Mobile Implementation (`mobile/`) |
| --- | --- |
| `<div>` / `<span>` | `<View>` / `<Text>` |
| `<img>` | `<Image>` (Expo Image or FastImage) |
| CSS Grid | Flexbox (No Grid support in RN) |
| `localStorage` | `MMKV` (Synchronous hook) |
| `useEffect` (Data Fetch) | `useQuery` (TanStack Query) + RefreshControl |
| `Next.js API Routes` | **Forbidden.** Logic must move to App/Edge functions. |

---

## 🤝 Contribution Guidelines

1. **Strict Typing:** `any` is banned. Use Generics.
2. **Component Purity:** UI components should be dumb. Logic lives in Hooks.
3. **File Structure:**
* `/app`: Screens (Routes)
* `/components`: Reusable UI (NativeWind enabled)
* `/lib`: Core logic (Supabase, API, Scraping Bridge)
* `/store`: Zustand slices



---

## 📜 License

**GNU General Public License v3.0**

Kaizen Mobile is free software.
*True Status. True Freedom.*
