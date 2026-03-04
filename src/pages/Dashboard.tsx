import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, CalendarDays, Activity, TrendingUp } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

const CHART_COLORS = [
  "hsl(210, 75%, 42%)",
  "hsl(170, 55%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 55%, 55%)",
  "hsl(0, 72%, 51%)",
];

export default function Dashboard() {
  const { data: appointments, isLoading: loadingAppts } = useQuery({
    queryKey: ["appointments-schedule"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, patients(*, ai_summaries(summary_points))")
        .order("appointment_date", { ascending: true })
        .limit(20);
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

  const statCards = [
    { label: "Total Patients", value: stats?.totalPatients ?? 0, icon: Users, color: "text-primary" },
    { label: "Appointments", value: stats?.totalAppointments ?? 0, icon: CalendarDays, color: "text-accent" },
    { label: "Pending", value: stats?.pendingAppointments ?? 0, icon: Activity, color: "text-warning" },
    { label: "Records", value: stats?.totalRecords ?? 0, icon: TrendingUp, color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Patient Growth</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(210, 75%, 42%)" strokeWidth={2} dot={{ fill: "hsl(210, 75%, 42%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Diagnosis Categories</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={diagnosisCategories ?? []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {(diagnosisCategories ?? []).map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Schedule */}
      <Card>
        <CardHeader><CardTitle className="text-base">Upcoming Patient Schedule</CardTitle></CardHeader>
        <CardContent>
          {loadingAppts ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : !appointments?.length ? (
            <p className="text-muted-foreground">No appointments yet. Upload a patient to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Previous Diagnosis</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((apt) => {
                    const patient = apt.patients;
                    const summaryPoints = apt.ai_summaries?.[0]?.summary_points;
                    const summaryText = Array.isArray(summaryPoints)
                      ? (summaryPoints as string[]).slice(0, 2).join("; ")
                      : patient?.previous_diagnosis?.slice(0, 60) || "—";
                    return (
                      <TableRow key={apt.id}>
                        <TableCell className="font-medium">{patient?.name}</TableCell>
                        <TableCell>{patient?.age}</TableCell>
                        <TableCell className="capitalize">{patient?.gender}</TableCell>
                        <TableCell>{format(new Date(apt.appointment_date), "MMM d, yyyy")}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{summaryText}</TableCell>
                        <TableCell>
                          <Badge variant={apt.status === "completed" ? "default" : "secondary"}>
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
  );
}
