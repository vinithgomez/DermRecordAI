# DermRecord AI

A modern, AI-powered dermatology clinic management platform built for doctors and administrators. DermRecord AI streamlines patient management, medical record keeping, diagnosis tracking, and report generation — all enhanced with intelligent AI capabilities.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite 5
- **Styling:** Tailwind CSS v3, shadcn/ui, Framer Motion
- **State Management:** TanStack React Query
- **Backend:** Lovable Cloud (Supabase) — Database, Auth, Edge Functions, Storage
- **AI Models:** Google Gemini & OpenAI GPT via Lovable AI Gateway
- **Routing:** React Router v6

## Core Features

- **Patient Management** — Full CRUD for patient records with search, filtering, and CSV bulk upload
- **Medical Records** — Track symptoms, observations, lab results, and raw clinical notes per patient
- **AI Auto-Fill** — Automatically structure raw clinical notes into organized medical fields
- **AI Summarization** — Generate concise patient summaries with risk levels and recommended tests
- **AI Medical Hints** — Get intelligent diagnostic suggestions based on symptoms and history
- **Progress Notes** — Document ongoing treatment, severity, and next steps
- **Diagnosis Tracking** — Record and categorize diagnoses with risk level assessment
- **Report Generation** — Create polished medical reports with AI-enhanced summaries
- **Appointment Management** — Schedule and track patient appointments
- **Role-Based Access** — Doctor and Admin roles with Row-Level Security
- **Authentication** — Secure email/password signup and login

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

### How to Run the App

```sh
# 1. Clone the repository
git clone <YOUR_GIT_URL>

# 2. Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Deploying

Open [Lovable](https://lovable.dev) and click **Share → Publish** to deploy your app instantly.
