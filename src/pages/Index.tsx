import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, type Variants } from "framer-motion";
import {
  Heart,
  ArrowRight,
  LogOut,
  Brain,
  FileText,
  Users,
  ShieldCheck,
  BarChart3,
  Upload,
  Stethoscope,
  ClipboardList,
  Sparkles,
  CheckCircle2,
  Zap,
  Lock,
  Clock,
  Eye,
  Microscope,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0, 0, 0.2, 1] },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0, 0, 0.2, 1] },
  }),
};

const features = [
  {
    icon: Brain,
    title: "AI Skin Analysis Summaries",
    description:
      "Automatically generate concise dermatological summaries with severity levels and recommended diagnostic tests using advanced AI.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Users,
    title: "Patient Skin Profile Management",
    description:
      "Upload, search, and manage patient dermatology records — skin type, lesion history, and treatment plans in one place.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: FileText,
    title: "Dermatology Report Generation",
    description:
      "Create professional dermatology reports with AI-polished findings on skin conditions, biopsies, and treatment outcomes.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: BarChart3,
    title: "Condition Analytics Dashboard",
    description:
      "Visualize skin condition trends, diagnosis distributions (eczema, psoriasis, melanoma), and appointment patterns.",
    color: "text-chart-4",
    bg: "bg-primary/5",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Clinic Access",
    description:
      "Secure role-based authentication for dermatologists and clinic admins with row-level patient data protection.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: Microscope,
    title: "Biopsy & Lab File Storage",
    description:
      "Upload and manage dermoscopy images, biopsy reports, patch test results, and lab PDFs in secure cloud storage.",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
];

const workflow = [
  {
    step: "01",
    icon: Upload,
    title: "Register Patient",
    description: "Enter patient skin profile, history of conditions, and upload dermoscopy images.",
  },
  {
    step: "02",
    icon: Brain,
    title: "AI Skin Analysis",
    description: "AI analyzes symptoms, generates condition summaries, severity levels, and differential diagnoses.",
  },
  {
    step: "03",
    icon: ClipboardList,
    title: "Clinical Notes",
    description: "Add skin examination findings, lesion descriptions, lab/biopsy results. AI structures your notes.",
  },
  {
    step: "04",
    icon: FileText,
    title: "Generate Derm Report",
    description: "Produce polished dermatology reports with AI summaries, treatment plans, and follow-up recommendations.",
  },
];

const stats = [
  { label: "AI Derm Models", value: "3+", icon: Sparkles },
  { label: "HIPAA-Ready", value: "100%", icon: Lock },
  { label: "Documentation Time Saved", value: "70%", icon: Clock },
  { label: "Instant Skin Insights", value: "Real-time", icon: Zap },
];

export default function Index() {
  const { user, loading, signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background overflow-x-hidden">
      {/* ── Navbar ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Eye className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              DermRecord AI
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">How It Works</a>
            <a href="#stats" className="transition-colors hover:text-foreground">Why Us</a>
          </nav>
          <div className="flex items-center gap-3">
            {loading ? null : user ? (
              <>
                <Button asChild size="sm">
                  <Link to="/dashboard">
                    Dashboard <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="mr-1 h-4 w-4" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* ── Hero ── */}
      <section className="relative py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 right-0 h-[400px] w-[500px] rounded-full bg-accent/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              AI-Powered Dermatology Platform
            </Badge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Smarter Skin Records.{" "}
            <span className="text-primary">Faster Dermatology Diagnosis.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed"
          >
            Streamline your dermatology clinic with AI-generated skin condition summaries,
            intelligent diagnostic hints, and professional report generation — all in one
            secure, HIPAA-ready platform built for dermatologists.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            {user ? (
              <Button size="lg" className="shadow-lg shadow-primary/20" asChild>
                <Link to="/dashboard">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" className="shadow-lg shadow-primary/20" asChild>
                  <Link to="/signup">
                    Start Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section id="stats" className="border-y bg-card/50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-12 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              className="flex flex-col items-center text-center"
            >
              <s.icon className="mb-2 h-6 w-6 text-primary" />
              <span className="text-2xl font-bold text-foreground">{s.value}</span>
              <span className="text-sm text-muted-foreground">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            custom={0}
            className="mb-14 text-center"
          >
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything a Dermatologist Needs
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              From patient skin profiles to AI-assisted diagnosis — a complete toolkit
              designed for modern dermatology clinics.
            </p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={scaleIn}
              >
                <Card className="group h-full border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="flex flex-col gap-3 p-6">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${f.bg}`}>
                      <f.icon className={`h-5 w-5 ${f.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="border-t bg-muted/40 py-24 lg:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            custom={0}
            className="mb-14 text-center"
          >
            <Badge variant="outline" className="mb-4">Workflow</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Four simple steps from patient intake to professional dermatology report.
            </p>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {workflow.map((w, i) => (
              <motion.div
                key={w.step}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
                className="relative flex flex-col items-center text-center"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                  <w.icon className="h-6 w-6" />
                </div>
                <span className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">
                  Step {w.step}
                </span>
                <h3 className="mb-2 text-base font-semibold text-foreground">{w.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{w.description}</p>
                {i < workflow.length - 1 && (
                  <div className="pointer-events-none absolute right-0 top-7 hidden h-px w-8 translate-x-full bg-border lg:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Capabilities ── */}
      <section className="py-24 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              custom={0}
            >
              <Badge variant="secondary" className="mb-4">
                <Brain className="mr-1.5 h-3.5 w-3.5" /> AI Derm Engine
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Intelligent Dermatology Assistance
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Our AI engine processes skin condition data to surface actionable
                insights — from lesion analysis summaries to differential diagnosis
                hints — helping dermatologists make informed decisions faster.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Structured skin condition summaries with severity levels",
                  "Differential diagnosis hints for dermatological conditions",
                  "AI-polished professional dermatology report generation",
                  "Secure, HIPAA-ready privacy-first processing pipeline",
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    custom={i + 1}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                    <span className="text-sm text-foreground">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={scaleIn}
              custom={0}
              className="relative"
            >
              <div className="rounded-2xl border bg-card p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-warning/60" />
                  <div className="h-3 w-3 rounded-full bg-success/60" />
                  <span className="ml-2 text-xs text-muted-foreground">AI Skin Analysis Output</span>
                </div>
                <div className="space-y-3 rounded-lg bg-muted/60 p-4 font-mono text-xs text-foreground">
                  <p className="text-muted-foreground">{"// AI-generated dermatology summary"}</p>
                  <p>
                    <span className="text-primary">{"{"}</span>
                  </p>
                  <p className="pl-4">
                    <span className="text-accent">"severity_level"</span>: <span className="text-warning">"moderate"</span>,
                  </p>
                  <p className="pl-4">
                    <span className="text-accent">"summary_points"</span>: [
                  </p>
                  <p className="pl-8 text-muted-foreground">"Erythematous scaly plaques on elbows",</p>
                  <p className="pl-8 text-muted-foreground">"Consistent with plaque psoriasis",</p>
                  <p className="pl-8 text-muted-foreground">"Recommend biopsy if refractory"</p>
                  <p className="pl-4">],</p>
                  <p className="pl-4">
                    <span className="text-accent">"recommended_tests"</span>: [
                  </p>
                  <p className="pl-8 text-muted-foreground">"Skin Biopsy", "Dermoscopy", "KOH Test"</p>
                  <p className="pl-4">]</p>
                  <p>
                    <span className="text-primary">{"}"}</span>
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl bg-primary/5" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t bg-primary/5 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="mx-auto max-w-2xl px-6 text-center"
        >
          <Stethoscope className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Ready to Transform Your Dermatology Practice?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join dermatologists using AI to streamline skin condition documentation,
            reduce paperwork, and deliver faster clinical decisions.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {user ? (
              <Button size="lg" className="shadow-lg shadow-primary/20" asChild>
                <Link to="/dashboard">
                  Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" className="shadow-lg shadow-primary/20" asChild>
                  <Link to="/signup">
                    Create Account <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t bg-card py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">DermRecord AI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DermRecord AI. Built for dermatology professionals.
          </p>
        </div>
      </footer>
    </div>
  );
}
