
-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor');

-- Create enum for appointment status
CREATE TYPE public.appointment_status AS ENUM ('pending', 'completed');

-- Create enum for risk level
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- User roles table (secure pattern)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 200),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  contact TEXT,
  symptoms TEXT,
  previous_diagnosis TEXT,
  medical_history TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_patients_created_by ON public.patients(created_by);

-- Appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status appointment_status NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);

-- Medical records table
CREATE TABLE public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  symptoms TEXT,
  observations TEXT,
  lab_results TEXT,
  raw_notes TEXT,
  ai_processed_notes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_medical_records_patient ON public.medical_records(patient_id);

-- Diagnoses table
CREATE TABLE public.diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  record_id UUID REFERENCES public.medical_records(id) ON DELETE SET NULL,
  summary TEXT,
  risk_level risk_level DEFAULT 'low',
  category TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_diagnoses_patient ON public.diagnoses(patient_id);

-- Reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  doctor_name TEXT NOT NULL,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  diagnosis_notes TEXT,
  observations TEXT,
  prescription_notes TEXT,
  ai_summary JSONB,
  pdf_url TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- AI summaries table
CREATE TABLE public.ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  record_id UUID REFERENCES public.medical_records(id) ON DELETE SET NULL,
  summary_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  risk_level risk_level DEFAULT 'low',
  recommended_tests JSONB DEFAULT '[]'::jsonb,
  context_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_summaries ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_ai_summaries_patient ON public.ai_summaries(patient_id);

-- RLS Policies

-- user_roles: users can read their own roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- profiles
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- patients: authenticated users can CRUD
CREATE POLICY "Authenticated can view patients" ON public.patients
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert patients" ON public.patients
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated can update patients" ON public.patients
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Authenticated can delete patients" ON public.patients
  FOR DELETE TO authenticated USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- appointments
CREATE POLICY "Authenticated can view appointments" ON public.appointments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert appointments" ON public.appointments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated can update appointments" ON public.appointments
  FOR UPDATE TO authenticated USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- medical_records
CREATE POLICY "Authenticated can view records" ON public.medical_records
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert records" ON public.medical_records
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated can update records" ON public.medical_records
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- diagnoses
CREATE POLICY "Authenticated can view diagnoses" ON public.diagnoses
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert diagnoses" ON public.diagnoses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- reports
CREATE POLICY "Authenticated can view reports" ON public.reports
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert reports" ON public.reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated can update reports" ON public.reports
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- ai_summaries
CREATE POLICY "Authenticated can view ai_summaries" ON public.ai_summaries
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert ai_summaries" ON public.ai_summaries
  FOR INSERT TO authenticated WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON public.medical_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  -- Default role: doctor
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'doctor');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for patient files
INSERT INTO storage.buckets (id, name, public) VALUES ('patient-files', 'patient-files', false);

CREATE POLICY "Authenticated can upload patient files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'patient-files');
CREATE POLICY "Authenticated can view patient files" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'patient-files');
CREATE POLICY "Authenticated can delete own patient files" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'patient-files' AND auth.uid()::text = (storage.foldername(name))[1]);
