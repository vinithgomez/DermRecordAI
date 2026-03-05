import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
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
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: Brain,
    title: "AI-Powered Summaries",
    description:
      "Automatically generate concise diagnosis summaries with risk levels and recommended tests using advanced AI.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Users,
    title: "Patient Management",
    description:
      "Upload, search, and manage patient records with a clean, intuitive interface built for clinical workflows.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: FileText,
    title: "Report Generation",
    description:
      "Create professional medical reports with AI-polished summaries and download them instantly.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Visualize patient growth, diagnosis distributions, and appointment trends with interactive charts.",
    color: "text-chart-4",
    bg: "bg-primary/5",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description:
      "Secure role-based authentication for doctors and admins with row-level data protection.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: Upload,
    title: "File Storage",
    description:
      "Upload and manage patient documents, lab results, and PDFs in a secure cloud storage bucket.",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
];

const workflow = [
  {
    step: "01",
    icon: Upload,
    title: "Upload Patient",
    description: "Enter patient details and upload documents. An appointment is auto-created.",
  },
  {
    step: "02",
    icon: Brain,
    title: "AI Analyzes",
    description: "AI instantly generates diagnosis summaries, risk levels, and medical hints.",
  },
  {
    step: "03",
    icon: ClipboardList,
    title: "Create Records",
    description: "Add symptoms, observations, and lab results. AI structures your raw notes.",
  },
  {
    step: "04",
    icon: FileText,
    title: "Generate Report",
    description: "Produce polished medical reports with AI summaries and download them.",
  },
];

const stats = [
  { label: "AI Models", value: "3+", icon: Sparkles },
  { label: "Secure & Encrypted", value: "100%", icon: Lock },
  { label: "Time Saved", value: "70%", icon: Clock },
  { label: "Instant Insights", value: "Real-time", icon: Zap },
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
              <Heart className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              MedRecord AI
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
        {/* Decorative gradient blobs */}
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
              AI-Powered Medical Platform
            </Badge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Smarter Patient Records.{" "}
            <span className="text-primary">Faster Diagnosis.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed"
          >
            Streamline clinical workflows with AI-generated summaries, intelligent
            medical hints, and professional report generation — all in one
            secure, role-based platform.
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
              Everything You Need
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              From patient intake to AI-assisted diagnosis — a complete toolkit
              designed for modern healthcare professionals.
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
              Four simple steps from patient upload to professional report.
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
                <Brain className="mr-1.5 h-3.5 w-3.5" /> AI Engine
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Intelligent Medical Assistance
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Our AI engine processes medical data to surface actionable
                insights — from diagnosis summaries to contextual medical hints
                — helping doctors make informed decisions faster.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Structured diagnosis summaries with risk levels",
                  "Contextual hints for related conditions & tests",
                  "AI-polished professional report generation",
                  "Secure, privacy-first processing pipeline",
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
                  <span className="ml-2 text-xs text-muted-foreground">AI Summary Output</span>
                </div>
                <div className="space-y-3 rounded-lg bg-muted/60 p-4 font-mono text-xs text-foreground">
                  <p className="text-muted-foreground">{"// AI-generated diagnosis summary"}</p>
                  <p>
                    <span className="text-primary">{"{"}</span>
                  </p>
                  <p className="pl-4">
                    <span className="text-accent">"risk_level"</span>: <span className="text-warning">"medium"</span>,
                  </p>
                  <p className="pl-4">
                    <span className="text-accent">"summary_points"</span>: [
                  </p>
                  <p className="pl-8 text-muted-foreground">"Elevated blood pressure noted",</p>
                  <p className="pl-8 text-muted-foreground">"History of Type 2 Diabetes",</p>
                  <p className="pl-8 text-muted-foreground">"Recommend HbA1c follow-up"</p>
                  <p className="pl-4">],</p>
                  <p className="pl-4">
                    <span className="text-accent">"recommended_tests"</span>: [
                  </p>
                  <p className="pl-8 text-muted-foreground">"Lipid Panel", "Renal Function"</p>
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
            Ready to Transform Your Practice?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join healthcare professionals using AI to streamline patient care,
            reduce paperwork, and make faster clinical decisions.
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
            <Heart className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">MedRecord AI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MedRecord AI. Built for healthcare professionals.
          </p>
        </div>
      </footer>
    </div>
  );
}
