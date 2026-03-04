

## 🏥 AI-Powered Patient Record & Diagnosis Support System

### Phase 1: Foundation & Database Setup
- **Enable Lovable Cloud** for Supabase backend (database, auth, edge functions, storage)
- **Database schema** with normalized tables:
  - `patients` — name, age, gender, contact, medical_history
  - `appointments` — patient_id, date, status (pending/completed), linked to patient creation
  - `medical_records` — symptoms, observations, lab_results, raw_notes, ai_processed_notes
  - `diagnoses` — patient_id, record_id, summary, risk_level
  - `reports` — patient_id, doctor_name, date, notes, prescription, ai_summary, pdf_url
  - `ai_summaries` — patient_id, record_id, summary_points, risk_level, recommended_tests, context_notes
  - `user_roles` — role-based access (doctor/admin) using secure enum pattern
- **Row Level Security** on all tables scoped to authenticated users with role-based policies via `has_role()` security definer function
- **Supabase Storage** bucket for patient file uploads (PDFs, lab reports)
- **Supabase Auth** with email/password login

### Phase 2: Layout & Navigation
- **Collapsible sidebar** using shadcn Sidebar component with animated collapse
  - Dashboard, Upload Patient, View Patients, Create Record, Generate Report
  - Active route highlighting, icon-only mini mode when collapsed
- **Auth pages**: Login and signup with role assignment
- **Responsive layout** with professional medical/hospital theme (clean blues, whites, subtle accents)

### Phase 3: Dashboard Page
- **Upcoming Patients Schedule** — table showing patient name, age, gender, appointment date, AI-generated previous diagnosis summary, status badge (Pending/Completed)
- **Analytics Section** with Recharts:
  - Total patients count card
  - Monthly patient growth line chart
  - Diagnosis category distribution pie/bar chart
  - Visit frequency trend chart
- Data fetched via TanStack Query with caching

### Phase 4: Upload Patient Page
- Form with fields: Name, Age, Gender, Contact, Symptoms, Previous Diagnosis, Medical History, File Upload (PDF via Supabase Storage)
- On submit:
  1. Save patient to database
  2. Auto-create appointment entry with current date
  3. Trigger AI edge function to generate crisp summary of previous diagnosis
  4. Store AI summary in `ai_summaries` table
  5. Redirect to Dashboard with toast "Patient added to schedule"

### Phase 5: View Patients Page
- Searchable, paginated table of all patients
- Filters: date range, diagnosis category, status
- Click row → full patient detail page with:
  - Timeline of diagnoses
  - AI crisp summaries (3-5 bullet points)
  - Uploaded documents viewer

### Phase 6: AI Integration Layer (Lovable AI Gateway)
- **Edge function: `ai-summarize`** — takes diagnosis text, returns structured JSON with summary_points, risk_level, recommended_tests, context_notes
- **Edge function: `ai-medical-hints`** — contextual medical hints (related conditions, risk indicators, suggested checks) — medically neutral, no treatment prescriptions
- **Edge function: `ai-report-polish`** — polishes report notes into clean medical summary
- All AI calls use Lovable AI Gateway (`google/gemini-3-flash-preview`) with structured tool-calling for consistent JSON output

### Phase 7: Diagnosis Assistance (Patient Detail View)
- When doctor opens a patient record:
  - **Previous Diagnosis Summary** — AI-generated bullet points
  - **Contextual Medical Hints** — related conditions, risk indicators, suggested diagnostic checks
  - Clearly labeled as "informational reference only"

### Phase 8: Create Record Page
- Form: current symptoms, observations, lab results, diagnosis notes (long-form)
- On submit:
  1. Save raw notes
  2. Send to AI edge function
  3. Generate structured notes: key findings, final diagnosis summary, risk category
  4. Store both raw and AI-processed versions

### Phase 9: Generate Report Page
- Patient selection dropdown, date picker, doctor name, diagnosis notes, observations, prescription notes
- On submit:
  1. AI generates clean medical summary with bullet-point diagnosis overview
  2. Generate downloadable PDF (basic styled with sections, headers, bullet points)
  3. Store report metadata and PDF in Supabase Storage

### Technical Architecture
- **Modular folder structure**: pages, components, hooks, services, types, lib
- **Error boundaries** and Suspense loading states throughout
- **TanStack Query** for all data fetching with caching strategy
- **Pagination** on all list views
- **Accessible UI** with shadcn components, smooth animations, clear status indicators

