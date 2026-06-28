<div align="center">
  <img src="./public/logo.png" alt="HivePod Logo" width="150" />
  <h1>HivePod</h1>
  <p>A premium, state-of-the-art platform for creators to share courses, host audio lectures, and build thriving communities.</p>
</div>

---

## 📖 Overview

**HivePod** is a comprehensive, meticulously crafted web application built for the modern creator economy. Leveraging the latest in web technologies including **Next.js (App Router)** and **React 19**, it provides an all-in-one ecosystem where education meets entertainment and social connection. 

Our core philosophy is to empower creators to monetize their knowledge and foster highly-engaged communities without the need to stitch together disparate tools. HivePod seamlessly blends high-quality video courses, immersive audio podcasting, and interactive community spaces into a single, cohesive platform.

The user interface is heavily inspired by premium iOS design patterns, featuring extensive use of **glassmorphism**, dynamic blur effects, sleek typography, and fluid micro-animations powered by **Framer Motion**. Whether you are a student exploring new skills or an admin tracking your sales metrics, HivePod guarantees a fluid, distraction-free, and native-feeling experience across all devices.

---

## ✨ Comprehensive Features

### 🧑‍🎓 For Learners (User Experience)
- **Course Library & Browsing:** Elegant interface to discover, preview, and enroll in courses.
- **My Courses Dashboard:** Dedicated portal for users to track their learning progress, resume where they left off, and access course materials.
- **Smart Audio Player:** A persistent, global audio player (`SmartAudioPlayer.tsx`) powered by Shaka Player for listening to podcast-style lectures while navigating the app, fully optimized for robustness.
- **Transcripts & Copy Features:** Automatically read and copy lecture transcripts directly from the UI.
- **iOS-Style Profile Management:** Clean, minimalist profile section for managing personal details, avatars, and account settings.
- **Community Hub:** Integrated social spaces for students to interact, share insights, and ask questions.

### 👑 For Creators (Admin Experience)
- **Admin Dashboard:** A powerful command center featuring analytics, recent sales tracking, and platform overview.
- **Automated Access Requests:** Receive instant email notifications (via Resend) whenever a user requests access to a private course, with 1-click links to approve/deny.
- **Course Builder:** Intuitive tools to create and structure courses, upload videos, and organize modules.
- **Material Uploads:** Secure and efficient file uploads via Cloudflare R2 / AWS S3 integration.
- **User Management:** Oversee enrolled students, manage permissions, and track engagement.

### 🤖 AI & Advanced Capabilities
- **Hinglish AI Transcription:** Groundbreaking transcription pipeline that uses Deepgram to generate audio utterances and Groq (`llama-3.1-8b-instant`) to process text in intelligent chunks. It perfectly fixes spelling mistakes for native Hinglish (Hindi written in Latin alphabet) without losing the original spoken tone or context, maintaining perfect line-by-line formatting.
- **Speech-to-Text Processing:** Integration with Deepgram (`@deepgram/sdk`) for automatic transcription and closed captioning of audio/video lectures.

### 🛡 Core Architecture & Security
- **Authentication:** Secure, passwordless or multi-provider login workflows powered by Firebase Auth.
- **Bot Protection:** Integrated Cloudflare Turnstile (`@marsidev/react-turnstile`) to prevent spam and abuse.
- **Real-time Notifications:** In-app notification system (`useNotifications.ts`) to keep users informed about new courses and community replies.
- **Reliable Email Delivery:** Integrated with Resend API for lightning-fast transactional emails.

---

## 🛠 Complete Technology Stack

### Frontend Core
- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Components, Server Actions)
- **Library:** [React](https://react.dev/) 19
- **Language:** TypeScript 5+

### UI, Styling & Animations
- **Styling:** Tailwind CSS v4 (with PostCSS)
- **Component Library:** Shadcn UI (Headless UI components via Radix UI)
- **Icons:** Lucide React
- **Animations:** Framer Motion & `tw-animate-css`

### Backend, Database & Infrastructure
- **BaaS / Database:** [Firebase](https://firebase.google.com/) 12+ (Firestore, Auth)
- **Storage:** Cloudflare R2 / AWS S3 SDK for direct, secure file uploads.
- **Emails:** [Resend](https://resend.com) SDK for admin alerts.

### AI & Third-Party Services
- **LLMs / AI:** `groq-sdk` (Llama 3.1)
- **Audio Processing:** `@deepgram/sdk`
- **Security:** `@marsidev/react-turnstile`

---

## ⚙️ Configuration & Environment

To run HivePod locally, you must configure several third-party services. Create a `.env.local` file in the root of your project and populate it with the following keys.

### `.env.local`

```env
# Firebase Configuration (Get these from your Firebase Project settings)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Cloudflare R2 / AWS S3 Storage (For Video/Audio/Material Uploads)
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-your-r2-url.r2.dev

# AI & Processing APIs
DEEPGRAM_API_KEY=your_deepgram_key
GROQ_API_KEY=your_groq_key

# Cloudflare Turnstile Configuration
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key

# Resend Configuration (For Admin Emails)
RESEND_API_KEY=re_your_resend_api_key
ADMIN_EMAIL=your-admin-email@example.com
NEXT_PUBLIC_SITE_URL=https://hivepod.vercel.app
```

---

## 🚀 Getting Started

### Prerequisites

Ensure your local development environment meets the following requirements:
- **Node.js**: v18.17.0 or higher
- **Package Manager**: `npm`, `yarn`, or `pnpm`
- **Git**

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/hivepod.git
   cd hivepod
   ```

2. **Install dependencies:**
   Using npm:
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment variables above into a `.env.local` file and replace the placeholders with your actual API keys.

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser. The application supports Hot Module Replacement (HMR) for instant feedback during development.

---

## ☁️ Deployment

The easiest and recommended way to deploy HivePod is via [Vercel](https://vercel.com/new).

1. Push your code to a GitHub, GitLab, or Bitbucket repository.
2. Import the repository into Vercel.
3. Add your Environment Variables in the Vercel dashboard. **Make sure to include `NEXT_PUBLIC_SITE_URL` pointing to your exact Vercel deployment link.**
4. Click **Deploy**. Vercel will automatically configure the build settings and deploy your application globally.

---

## 🎨 UI/UX Design Philosophy

HivePod is designed to feel less like a traditional website and more like a native iOS application. 
- **Glassmorphism:** We utilize backdrop blurs (`backdrop-blur-md`, `bg-white/10`) extensively to create depth and hierarchy without relying on heavy drop shadows.
- **Typography:** Clean, sans-serif typography ensures readability across all course materials and UI elements.
- **Micro-interactions:** Every button press, hover state, and page transition is accompanied by subtle animations to provide immediate, satisfying feedback to the user.
- **Responsiveness:** The layout fluidly adapts from ultra-wide desktop monitors down to mobile devices, ensuring creators and students can access the platform anywhere.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.