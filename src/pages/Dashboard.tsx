import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Users, CalendarDays, Activity, TrendingUp, UserPlus, Brain, ArrowRight, Clock,
} from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CHART_COLORS = [
  "hsl(199, 89%, 38%)",
  "hsl(160, 60%, 42%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 55%, 55%)",
  "hsl(0, 72%, 51%)",
];

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: appointments, isLoading: loadingAppts } = useQuery({
    queryKey: ["appointments-schedule"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, patients(name, age, gender, ai_summaries(summary_points))")
        .order("appointment_date", { ascending: true })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { count: totalPatients } = await supabase.from("patients").select("*", { count: "exact", head: true });
      const { count: totalAppointments } = await supabase.from("appointments").select("*", { count: "exact", head: true });
      const { count: pendingAppointments } = await supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "pending");
      const { count: totalRecords } = await supabase.from("medical_records").select("*", { count: "exact", head: true });
      return {
        totalPatients: totalPatients ?? 0,
        totalAppointments: totalAppointments ?? 0,
        pendingAppointments: pendingAppointments ?? 0,
        totalRecords: totalRecords ?? 0,
      };
    },
  });

  const { data: monthlyData } = useQuery({
    queryKey: ["monthly-growth"],
    queryFn: async () => {
      const { data } = await supabase.from("patients").select("created_at").order("created_at");
      if (!data) return [];
      const months: Record<string, number> = {};
      data.forEach((p) => {
        const key = format(new Date(p.created_at), "MMM yyyy");
        months[key] = (months[key] || 0) + 1;
      });
      return Object.entries(months).map(([month, count]) => ({ month, count }));
    },
  });

  const { data: diagnosisCategories } = useQuery({
    queryKey: ["diagnosis-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("diagnoses").select("category");
      if (!data) return [];
      const cats: Record<string, number> = {};
      data.forEach((d) => {
        const cat = d.category || "Uncategorized";
        cats[cat] = (cats[cat] || 0) + 1;
      });
      return Object.entries(cats).map(([name, value]) => ({ name, value }));
    },
  });

  const { data: recentPatients } = useQuery({
    queryKey: ["recent-patients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("id, name, age, gender, created_at, symptoms")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const statCards = [
    { label: "Total Patients", value: stats?.totalPatients ?? 0, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Today's Appointments", value: stats?.totalAppointments ?? 0, icon: CalendarDays, color: "text-accent", bg: "bg-accent/10" },
    { label: "Active Cases", value: stats?.pendingAppointments ?? 0, icon: Activity, color: "text-warning", bg: "bg-warning/10" },
    { label: "Clinical Records", value: stats?.totalRecords ?? 0, icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Welcome back — here's your clinic overview.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to="/upload-patient">
              <UserPlus className="mr-1.5 h-4 w-4" /> Add Patient
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/ai-diagnosis">
              <Brain className="mr-1.5 h-4 w-4" /> Start Diagnosis
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <Card className="stat-card">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                  <s.icon className={`h-6 w-6 ${s.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts + Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient Growth */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Patient Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyData ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 11 }} />
                <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(214, 18%, 88%)", fontSize: 12 }} />
                <Line type="monotone" dataKey="count" stroke="hsl(199, 89%, 38%)" strokeWidth={2.5} dot={{ fill: "hsl(199, 89%, 38%)", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Condition Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={diagnosisCategories ?? []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40} label={({ name }) => name} labelLine={false}>
                  {(diagnosisCategories ?? []).map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity + Appointments */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Patients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Recent Patients</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/patients" className="text-xs text-muted-foreground">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPatients?.length ? recentPatients.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/patients/${p.id}`)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors duration-150"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.age}y • {p.gender} • {p.symptoms?.slice(0, 40) || "No symptoms"}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Clock className="h-3 w-3" />
                  {format(new Date(p.created_at), "MMM d")}
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No patients yet</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAppts ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : !appointments?.length ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No upcoming appointments</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Patient</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.slice(0, 6).map((apt) => {
                      const patient = apt.patients;
                      return (
                        <TableRow key={apt.id} className="hover:bg-muted/30 transition-colors duration-150">
                          <TableCell className="text-sm font-medium py-3">{(patient as any)?.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground py-3">{format(new Date(apt.appointment_date), "MMM d, yyyy")}</TableCell>
                          <TableCell className="py-3">
                            <Badge variant={apt.status === "completed" ? "default" : "secondary"} className="text-xs">
                              {apt.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
