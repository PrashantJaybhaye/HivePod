<div align="center">
  <img src="./public/logo.png" alt="HivePod Logo" width="150" />
  <h1>HivePod</h1>
  <p>A premium, state-of-the-art platform for creators to share courses, host audio lectures, and build thriving communities.</p>
</div>

---

## 📖 Overview

**HivePod** is a comprehensive, meticulously crafted web application built for the modern creator economy. Leveraging the latest in web technologies including **Next.js 16.2 (App Router)** and **React 19**, it provides an all-in-one ecosystem where education meets entertainment and social connection. 

Our core philosophy is to empower creators to monetize their knowledge and foster highly-engaged communities without the need to stitch together disparate tools. HivePod seamlessly blends high-quality video courses, immersive audio podcasting, and interactive community spaces into a single, cohesive platform.

The user interface is heavily inspired by premium iOS design patterns, featuring extensive use of **glassmorphism**, dynamic blur effects, sleek typography, and fluid micro-animations powered by **Framer Motion**. Whether you are a student exploring new skills or an admin tracking your sales metrics, HivePod guarantees a fluid, distraction-free, and native-feeling experience across all devices.

---

## ✨ Comprehensive Features

### 🧑‍🎓 For Learners (User Experience)
- **Course Library & Browsing:** Elegant interface to discover, preview, and enroll in courses.
- **My Courses Dashboard:** Dedicated portal for users to track their learning progress, resume where they left off, and access course materials.
- **Smart Audio Player:** A persistent, global audio player (`SmartAudioPlayer.tsx`) for listening to podcast-style lectures while navigating the app.
- **iOS-Style Profile Management:** Clean, minimalist profile section for managing personal details, avatars, and account settings.
- **Community Hub:** Integrated social spaces for students to interact, share insights, and ask questions.
- **Support System:** Built-in help center for resolving issues and contacting support.

### 👑 For Creators (Admin Experience)
- **Admin Dashboard:** A powerful command center featuring analytics, recent sales tracking, and platform overview (`StatCard.tsx`).
- **Course Builder:** Intuitive tools to create and structure courses, upload videos, and organize modules.
- **Material Uploads:** Secure and efficient file uploads via AWS S3 integration (`UploadMaterial.tsx`).
- **User Management:** Oversee enrolled students, manage permissions, and track engagement.

### 🛡 Core Architecture & Security
- **Authentication:** Secure, passwordless or multi-provider login workflows powered by Firebase Auth.
- **Bot Protection:** Integrated Cloudflare Turnstile (`@marsidev/react-turnstile`) to prevent spam and abuse.
- **Real-time Notifications:** In-app notification system (`useNotifications.ts`) to keep users informed about new courses and community replies.
- **Analytics:** Integrated Vercel Analytics and custom tracking (`tracking.ts`) for user behavior insights.

### 🤖 AI & Advanced Capabilities
- **Generative AI Integration:** Powered by Google GenAI (`@google/genai`) and Groq (`groq-sdk`) for intelligent course recommendations, auto-generating summaries, or assisting creators.
- **Speech-to-Text Processing:** Integration with Deepgram (`@deepgram/sdk`) for automatic transcription and closed captioning of audio/video lectures.

---

## 🛠 Complete Technology Stack

### Frontend Core
- **Framework:** [Next.js](https://nextjs.org/) 16.2.9 (App Router, Server Components, Server Actions)
- **Library:** [React](https://react.dev/) 19.2.4
- **Language:** TypeScript 5+

### UI, Styling & Animations
- **Styling:** Tailwind CSS v4 (with PostCSS)
- **Component Library:** Shadcn UI (Headless UI components via Radix UI)
- **Icons:** Lucide React
- **Animations:** Framer Motion & `tw-animate-css`
- **Utility Libraries:** `clsx`, `tailwind-merge`, `class-variance-authority`

### Backend, Database & Infrastructure
- **BaaS / Database:** [Firebase](https://firebase.google.com/) 12.14.0 (Firestore, Auth)
- **Storage:** AWS S3 SDK (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`) for direct, secure file uploads.

### AI & Third-Party Services
- **LLMs / AI:** `@google/genai`, `groq-sdk`
- **Audio Processing:** `@deepgram/sdk`
- **Security:** `@marsidev/react-turnstile`
- **Analytics:** `@vercel/analytics`

---

## 📂 Detailed Folder Structure

```text
hivepod/
├── app/                        # Next.js 14+ App Router directory
│   ├── actions/                # Next.js Server Actions for form handling & DB mutations
│   ├── admin/                  # Admin dashboard & creator management interfaces
│   ├── community/              # Social feed, forums, and community interaction pages
│   ├── course/                 # Individual course viewing and video player pages
│   ├── folder/                 # Resource organization
│   ├── login/                  # Authentication flows (Sign in, Sign up, Forgot Password)
│   ├── my-courses/             # User's enrolled courses and progress tracking
│   ├── profile/                # User profile management (iOS-inspired aesthetic)
│   ├── settings/               # App configuration and user preferences
│   ├── support/                # Help center and ticketing system
│   ├── globals.css             # Global Tailwind directives and CSS variables
│   ├── layout.tsx              # Root application layout (Providers, global UI)
│   └── not-found.tsx           # Custom 404 error page
│
├── components/                 # Reusable UI architecture
│   ├── ui/                     # Shadcn UI primitive components (Buttons, Inputs, Dialogs)
│   ├── AuthProvider.tsx        # Firebase Authentication context provider
│   ├── CourseCard.tsx          # Card component for displaying course metadata
│   ├── CourseSkeleton.tsx      # Loading state placeholders for courses
│   ├── DashboardLayout.tsx     # Shell layout for authenticated dashboard views
│   ├── EmptyState.tsx          # Reusable component for empty data states
│   ├── Header.tsx              # Global application navigation bar
│   ├── Sidebar.tsx             # Collapsible side navigation
│   ├── SmartAudioPlayer.tsx    # Persistent, picture-in-picture style audio player
│   ├── StatCard.tsx            # KPI visualization cards for admin dashboard
│   └── UploadMaterial.tsx      # Drag-and-drop S3 file upload component
│
├── hooks/                      # Custom React hooks
│   └── useNotifications.ts     # Hook for managing and fetching user notifications
│
├── lib/                        # Utility functions and external service initialization
│   ├── firebase.ts             # Firebase app initialization and service exports
│   ├── notifications.ts        # Notification logic and helper functions
│   ├── tracking.ts             # Telemetry and analytics event tracking wrappers
│   └── utils.ts                # General helpers (e.g., Tailwind class merging with clsx)
│
├── public/                     # Static assets (images, fonts, favicons)
│   ├── logo.png                # Main application logo
│   └── icon.png                # App icon / PWA manifest icon
│
├── package.json                # Project dependencies and NPM scripts
├── tailwind.config.ts          # Tailwind CSS theme extensions and plugin configurations
└── tsconfig.json               # TypeScript compiler configuration
```

---

## ⚙️ Configuration & Environment

To run HivePod locally, you must configure several third-party services. Create a `.env.local` file in the root of your project and populate it with the following keys.

### Example `.env.local`

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# AWS S3 Storage (For Video/Audio/Material Uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET_NAME=your_bucket_name

# AI & Processing APIs
GROQ_API_KEY=your_groq_key
GOOGLE_GENAI_API_KEY=your_google_genai_key
DEEPGRAM_API_KEY=your_deepgram_key

# Security
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key
TURNSTILE_SECRET_KEY=your_cloudflare_turnstile_secret_key
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
   *Note: Due to Next.js 16/React 19, you might see peer dependency warnings. You can use `--legacy-peer-deps` if necessary, though the current `package-lock.json` resolves them.*

3. **Configure Environment Variables:**
   Copy the example environment variables above into a `.env.local` file and replace the placeholders with your actual API keys.

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser. The application supports Hot Module Replacement (HMR) for instant feedback during development.

---

## 📜 Available Scripts

- `npm run dev`: Starts the Next.js development server on `localhost:3000`.
- `npm run build`: Compiles the application into an optimized production build inside the `.next` directory.
- `npm start`: Starts a Node.js production server using the compiled build output.
- `npm run lint`: Runs ESLint over the codebase to ensure code quality and adherence to React/Next.js best practices.

---

## ☁️ Deployment

The easiest and recommended way to deploy HivePod is via [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme), the creators of Next.js.

1. Push your code to a GitHub, GitLab, or Bitbucket repository.
2. Import the repository into Vercel.
3. Add your Environment Variables in the Vercel dashboard.
4. Click **Deploy**. Vercel will automatically configure the build settings and deploy your application globally.

---

## 🎨 UI/UX Design Philosophy

HivePod is designed to feel less like a traditional website and more like a native application. 
- **Glassmorphism:** We utilize backdrop blurs (`backdrop-blur-md`, `bg-white/10`) extensively to create depth and hierarchy without relying on heavy drop shadows.
- **Typography:** Clean, sans-serif typography ensures readability across all course materials and UI elements.
- **Micro-interactions:** Every button press, hover state, and page transition is accompanied by subtle Framer Motion animations to provide immediate, satisfying feedback to the user.
- **Responsiveness:** The layout fluidly adapts from ultra-wide desktop monitors down to mobile devices, ensuring creators and students can access the platform anywhere.

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's fixing bugs, improving documentation, or proposing new features:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

Please ensure you run `npm run lint` and verify the build (`npm run build`) before submitting your PR.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.