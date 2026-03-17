import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Search } from "lucide-react";

export default function ViewPatients() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();

  const { data: patients, isLoading } = useQuery({
    queryKey: ["patients", search, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("patients")
        .select("*, appointments(status, appointment_date), ai_summaries(summary_points, risk_level)")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (statusFilter !== "all") {
        return data?.filter((p) =>
          p.appointments?.some((a: any) => a.status === statusFilter)
        );
      }
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dermatology Patients</h2>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by patient name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-muted-foreground">Loading patients...</p>
          ) : !patients?.length ? (
            <p className="text-muted-foreground">No dermatology patients found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((p) => {
                    const risk = p.ai_summaries?.[0]?.risk_level;
                    return (
                      <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/patients/${p.id}`)}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.age}</TableCell>
                        <TableCell className="capitalize">{p.gender}</TableCell>
                        <TableCell>{p.contact || "—"}</TableCell>
                        <TableCell>
                          {risk ? (
                            <Badge variant={risk === "high" || risk === "critical" ? "destructive" : "secondary"}>
                              {risk}
                            </Badge>
                          ) : "—"}
                        </TableCell>
                        <TableCell>{format(new Date(p.created_at), "MMM d, yyyy")}</TableCell>
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
