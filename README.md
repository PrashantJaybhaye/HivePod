<div align="center">
  <img src="./public/logo.png" alt="HivePod Logo" width="150" />
  <h1>HivePod</h1>
  <p>A premium platform for creators to share courses, host audio lectures, and build communities.</p>
</div>

---

## 📖 Overview

HivePod is a state-of-the-art, responsive web application meticulously crafted for the modern creator economy. Built on the robust foundation of **Next.js 14+ (App Router)** and **React 18**, it serves as a comprehensive platform where education meets community and entertainment. 

Designed with both creators and learners in mind, HivePod transcends traditional course platforms by seamlessly blending high-quality educational content with immersive podcasting and audio lectures. Our mission is to empower creators to monetize their knowledge and build thriving, highly-engaged communities without having to stitch together multiple disparate tools. 

The platform boasts a premium, glassmorphism-inspired user interface built with Tailwind CSS. It focuses heavily on delivering a sleek, intuitive, and distraction-free user experience. From the beautiful iOS-style profile management to the dynamic course browsing and interactive community spaces, every element is designed to feel native, fluid, and responsive across all devices—desktop, tablet, and mobile.

Whether you are an educator looking to host your flagship course, a podcaster aiming to share exclusive audio lectures, or a community builder wanting to foster deeper connections among your audience, HivePod provides the elegant infrastructure needed to scale your digital presence.

## ✨ Key Features

- **Course Management:** Clean, intuitive interfaces for creating, browsing, enrolling, and managing courses.
- **Audio Podcasting Integration:** Seamless audio lecture playback fully integrated into the learning experience.
- **Premium User Interface:** Built using Tailwind CSS, featuring glassmorphism elements, dynamic blur effects, and smooth animations.
- **Admin Dashboard & Analytics:** Comprehensive admin panel with stat cards, recent sales tracking, and course oversight.
- **Authentication:** Secure user login, signup, and profile management workflows.
- **Community:** Built-in community platform to engage users.
- **User Profile:** Minimalist, iOS-inspired profile and settings management.
- **Responsive Design:** Fully optimized for desktop, tablet, and mobile viewing.

## 🛠 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Library:** [React 18](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Icons:** [Lucide React](https://lucide.dev/)

## 📂 Project Structure

```text
hivepod/
├── app/                  # Next.js App Router pages, layouts, and API routes
│   ├── admin/            # Admin dashboard and management pages
│   ├── community/        # Community and social features
│   ├── course/           # Course viewing and interaction pages
│   ├── login/            # Authentication workflows
│   ├── my-courses/       # Enrolled courses and learning progress
│   ├── profile/          # iOS-style profile and settings management
│   ├── support/          # Help center and support workflows
│   └── globals.css       # Global stylesheet with custom variables
├── components/           # Reusable React components (UI, layouts, forms)
├── public/               # Static assets like images and fonts (e.g., logo.png)
└── tailwind.config.ts    # Tailwind CSS configuration and theme extensions
```

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v18 or higher recommended)
- **npm**, **yarn**, or **pnpm**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/hivepod.git
   cd hivepod
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. (Optional) Set up Environment Variables:
   Create a `.env.local` file in the root directory and add any necessary environment keys (e.g., database URLs, authentication secrets).

### Running the App

Start the local development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application. The page will automatically reload if you make edits to the code.

## 📜 Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production to the `.next` folder.
- `npm start`: Starts the production server using the built app.
- `npm run lint`: Runs ESLint to catch and fix code formatting issues.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/your-username/hivepod/issues) if you want to contribute.

## 📄 License

This project is licensed under the MIT License.