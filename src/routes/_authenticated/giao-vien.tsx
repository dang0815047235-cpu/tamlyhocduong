import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarClock, Inbox, BookOpenText, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { APPOINTMENT_STATUS, REPORT_STATUS, SEVERITIES } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/giao-vien")({
  head: () => ({
    meta: [
      { title: "Bảng điều khiển giáo viên | Tâm lý học đường THPT Phạm Văn Đồng" },
      { name: "description", content: "Thống kê lịch hẹn, hộp thư báo cáo sự việc và quản lý thư viện bài viết." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:title", content: "Bảng điều khiển giáo viên tư vấn" },
      { property: "og:description", content: "Khu vực dành cho giáo viên tư vấn tâm lý học đường." },
    ],
  }),
  component: TeacherPage,
});

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--primary)"];

function TeacherPage() {
  const { role, pendingTeacher, loading } = useAuth();

  if (loading) return <PageShell title="Bảng điều khiển giáo viên"><p className="text-muted-foreground">Đang tải...</p></PageShell>;

  if (role !== "teacher") {
    return (
      <PageShell title="Bảng điều khiển giáo viên">
        <Card>
          <CardContent className="pt-6 text-sm">
            {pendingTeacher
              ? "Tài khoản giáo viên của bạn đang chờ quản trị viên phê duyệt. Sau khi được duyệt, bạn sẽ dùng được hộp thư, lịch hẹn và quản lý bài viết."
              : "Khu vực này chỉ dành cho giáo viên đã được phê duyệt."}
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell title="Bảng điều khiển giáo viên" description="Theo dõi lịch hẹn, hộp thư báo cáo và thư viện bài viết.">
      <Tabs defaultValue="overview">
        <TabsList className="mb-6 flex h-auto flex-wrap">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="appointments">Lịch hẹn</TabsTrigger>
          <TabsTrigger value="reports">Hộp thư báo cáo</TabsTrigger>
          <TabsTrigger value="articles">Bài viết</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><Overview /></TabsContent>
        <TabsContent value="appointments"><Appointments /></TabsContent>
        <TabsContent value="reports"><Reports /></TabsContent>
        <TabsContent value="articles"><Articles /></TabsContent>
      </Tabs>
    </PageShell>
  );
}

function useAllAppointments() {
  return useQuery({
    queryKey: ["appointments", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("appointments").select("*").order("appointment_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useAllReports() {
  return useQuery({
    queryKey: ["reports", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useStudentNames() {
  return useQuery({
    queryKey: ["profiles", "all"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, display_name, class_name");
      const map = new Map<string, string>();
      (data ?? []).forEach((p) => map.set(p.id, p.class_name ? `${p.display_name} (${p.class_name})` : p.display_name));
      return map;
    },
  });
}

function countBy<T>(list: T[], key: (x: T) => string) {
  const m = new Map<string, number>();
  list.forEach((x) => m.set(key(x), (m.get(key(x)) ?? 0) + 1));
  return Array.from(m, ([name, value]) => ({ name, value }));
}

function Overview() {
  const { data: appts = [] } = useAllAppointments();
  const { data: reports = [] } = useAllReports();

  const stats = [
    { label: "Lịch chờ duyệt", value: appts.filter((a) => a.status === "pending").length, icon: CalendarClock },
    { label: "Tổng lịch hẹn", value: appts.length, icon: CalendarClock },
    { label: "Báo cáo mới", value: reports.filter((r) => r.status === "new").length, icon: Inbox },
    { label: "Báo cáo khẩn cấp", value: reports.filter((r) => r.severity === "high" && r.status !== "resolved").length, icon: AlertTriangle },
  ];

  const byTopic = [...countBy(appts, (a) => a.topic), ...countBy(reports, (r) => r.incident_type)]
    .reduce<{ name: string; value: number }[]>((acc, cur) => {
      const f = acc.find((x) => x.name === cur.name);
      if (f) f.value += cur.value; else acc.push({ ...cur });
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value);
  const byStatus = countBy(appts, (a) => APPOINTMENT_STATUS[a.status]?.label ?? a.status);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 pt-6">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-primary"><s.icon className="size-5" /></span>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader><CardTitle className="text-base">Phân loại vấn đề</CardTitle><CardDescription>Chủ đề lịch hẹn và loại sự việc được báo cáo</CardDescription></CardHeader>
          <CardContent className="h-72">
            {byTopic.length === 0 ? <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byTopic} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" allowDecimals={false} fontSize={12} />
                  <YAxis type="category" dataKey="name" width={140} fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="value" name="Số lượng" radius={[0, 8, 8, 0]}>
                    {byTopic.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Trạng thái lịch hẹn</CardTitle></CardHeader>
          <CardContent className="h-72">
            {byStatus.length === 0 ? <p className="text-sm text-muted-foreground">Chưa có lịch hẹn.</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} label>
                    {byStatus.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Appointments() {
  const qc = useQueryClient();
  const { data = [] } = useAllAppointments();
  const { data: names } = useStudentNames();
  const [filter, setFilter] = useState("all");
  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Đã cập nhật trạng thái"); void qc.invalidateQueries({ queryKey: ["appointments"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const list = data.filter((a) => filter === "all" || a.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[["all", "Tất cả"], ...Object.entries(APPOINTMENT_STATUS).map(([k, v]) => [k, v.label])].map(([k, l]) => (
          <Button key={k} size="sm" className="rounded-full" variant={filter === k ? "default" : "outline"} onClick={() => setFilter(k!)}>{l}</Button>
        ))}
      </div>
      {list.length === 0 ? <p className="text-sm text-muted-foreground">Không có lịch hẹn.</p> : list.map((a) => (
        <Card key={a.id}>
          <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{new Date(a.appointment_date).toLocaleDateString("vi-VN")} · {a.appointment_slot}</p>
              <p className="text-sm text-muted-foreground">{names?.get(a.student_id) ?? "Học sinh"} · {a.counselor_name}</p>
              <p className="text-sm">Chủ đề: {a.topic}</p>
              {a.note && <p className="text-sm text-muted-foreground">Ghi chú: {a.note}</p>}
            </div>
            <Select value={a.status} onValueChange={(v) => update.mutate({ id: a.id, status: v })}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(APPOINTMENT_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Reports() {
  const qc = useQueryClient();
  const { data = [] } = useAllReports();
  const { data: names } = useStudentNames();
  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("reports").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Đã cập nhật báo cáo"); void qc.invalidateQueries({ queryKey: ["reports"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      {data.length === 0 ? <p className="text-sm text-muted-foreground">Hộp thư trống.</p> : data.map((r) => (
        <Card key={r.id} className={r.severity === "high" ? "border-destructive/40" : ""}>
          <CardContent className="space-y-2 pt-6">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{r.incident_type}</p>
              <Badge variant="secondary" className={SEVERITIES[r.severity]?.className ?? ""}>{SEVERITIES[r.severity]?.label ?? r.severity}</Badge>
              <span className="ml-auto text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("vi-VN")}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Người gửi: {r.is_anonymous || !r.reporter_id ? "Ẩn danh" : names?.get(r.reporter_id) ?? "Học sinh"}
              {r.occurred_at && ` · Thời gian: ${r.occurred_at}`}{r.location && ` · Địa điểm: ${r.location}`}
            </p>
            <p className="whitespace-pre-line text-sm">{r.description}</p>
            <Select value={r.status} onValueChange={(v) => update.mutate({ id: r.id, status: v })}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(REPORT_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Articles() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", topic: "", summary: "", content: "", source: "" });
  const { data = [] } = useQuery({
    queryKey: ["articles", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const refresh = () => void qc.invalidateQueries({ queryKey: ["articles"] });
  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("articles").insert({ ...form, source: form.source || null, is_published: false });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Đã thêm bài viết (chờ duyệt)"); setForm({ title: "", topic: "", summary: "", content: "", source: "" }); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const toggle = useMutation({
    mutationFn: async ({ id, v }: { id: string; v: boolean }) => {
      const { error } = await supabase.from("articles").update({ is_published: v }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Đã xóa bài viết"); refresh(); },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Plus className="size-4" /> Thêm bài viết</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); create.mutate(); }}>
            <div className="space-y-1"><Label>Tiêu đề</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-1"><Label>Chủ đề</Label><Input required placeholder="Học tập, Cảm xúc, An toàn..." value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} /></div>
            <div className="space-y-1"><Label>Tóm tắt</Label><Input required value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></div>
            <div className="space-y-1"><Label>Nội dung</Label><Textarea required rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
            <div className="space-y-1"><Label>Nguồn tham khảo</Label><Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></div>
            <Button type="submit" disabled={create.isPending}>Lưu bài viết</Button>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {data.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex items-start gap-3 pt-6">
              <BookOpenText className="mt-1 size-4 shrink-0 text-primary" />
              <div className="flex-1">
                <p className="font-semibold">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.topic} · {a.summary}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">{a.is_published ? "Đã duyệt" : "Chờ duyệt"}</span>
                <Switch checked={a.is_published} onCheckedChange={(v) => toggle.mutate({ id: a.id, v })} />
                <Button variant="ghost" size="icon" aria-label="Xóa" onClick={() => { if (confirm("Xóa bài viết này?")) remove.mutate(a.id); }}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
