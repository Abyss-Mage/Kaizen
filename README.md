# KAIZEN — The True-Status Manga Reader 📚⚡

> A next-generation manga reading platform that restores truth to manga publishing by separating **Source Status** from **Translation Status**.

---

## 🚨 The Problem

Every manga site on the internet is lying to you.  
They say a series is **"Ongoing"** just because the English translation is ongoing…

But the **original author** actually finished the story **years ago**.

Readers become invested — only to find they are **50+ chapters behind a completed story**.

---

## 💡 The Kaizen Solution: Dual-Layer Status

Kaizen introduces **True-Status Integrity**:

| Status Layer | What It Tracks | Verified From |
|--------------|----------------|---------------|
| **Source Status** | Original author/publisher progress | Naver, Kakao, Jump+, etc. |
| **Scan Status** | English translation progress | MangaDex Scan Sources |

We then calculate:

> **The Gap** → How far behind the reader is from the real ending

No more lies. No more surprises.  
Pure, factual reading integrity.

---

## 🔌 Architecture: The "Passthrough" Engine

Free to host. Incredibly scalable. **Zero stored images**.

### How it works
🗄️ **Metadata-Only Storage**  
Kaizen only stores titles, chapter IDs, tags, etc.

🖼️ **Passthrough Streaming**  
Image tokens are fetched **directly from MangaDex API**.

⚙️ **Sliding Window Buffer**  
Client-side Service Worker prefetches the next *3 chapters* for instant page turns.

⚡ **Benefits**
- Zero DMCA risk
- Lightning-fast UX
- Minimal infrastructure costs

---

## 🏗️ Tech Stack

| Component | Technology | Purpose |
|----------|------------|---------|
| Frontend | Next.js 14 (App Router) | SSR + Seamless UI |
| Database | Supabase (PostgreSQL) | Manga metadata + embeddings |
| Content Source | MangaDex API | Secure image passthrough |
| Caching | Service Worker + IndexedDB | Instant reading |
| AI Workers | Puppeteer + Node.js | Source status validation |

---

## 🚀 Getting Started

### 🔑 Prerequisites
- Node.js 18+
- Supabase account (Free Tier works)
- Docker (Optional — for local AI agents)

### 📦 Install

```bash
git clone https://github.com/yourusername/kaizen-reader.git
cd kaizen-reader
npm install
```

### ⚙️ Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional – for upcoming OAuth features
MANGADEX_CLIENT_ID=your_mangadex_client_id
```

### ▶️ Start Dev Server

```bash
npm run dev
```

---

## 🧠 AI Features — Roadmap

| Feature      | Status         | Description                               |
| ------------ | -------------- | ----------------------------------------- |
| Status Agent | ⏳ Planned      | Detects "Completed" labels on Naver/Kakao |
| Smart Crop   | ⏳ Planned      | Auto-detect faces for character profiles  |
| In-Painting  | ❌ Experimental | Clean-room text bubble replacement        |

---

## 🤝 Contributing

We welcome PRs that help improve reading integrity!

Please review `CONTRIBUTING.md` before submitting a pull request.

> Kaizen enforces strict **TypeScript + ESLint + Prettier** rules.
> Clean code = Clean pipelines ✨

---

## 📜 License

**GNU General Public License v3.0**

Kaizen is free and open-source — forever.

---

If Kaizen helped you read smarter, consider leaving a star!
Your support helps the manga community stay informed 🫡✨

```
