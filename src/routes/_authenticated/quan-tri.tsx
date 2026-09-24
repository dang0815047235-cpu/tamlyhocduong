import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/quan-tri")({
  head: () => ({
    meta: [
      { title: "Quản trị - Duyệt tài khoản giáo viên | THPT Phạm Văn Đồng" },
      { name: "description", content: "Quản trị viên phê duyệt tài khoản giáo viên tư vấn tâm lý học đường." },
      { property: "og:title", content: "Quản trị hệ thống tư vấn tâm lý học đường" },
      { property: "og:description", content: "Phê duyệt và quản lý tài khoản giáo viên." },
    ],
  }),
  component: AdminPage,
});

const STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-900" },
  approved: { label: "Đã duyệt", className: "bg-emerald-100 text-emerald-900" },
  rejected: { label: "Từ chối", className: "bg-rose-100 text-rose-900" },
};

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const qc = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ["teacher_requests"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("teacher_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const decide = useMutation({
    mutationFn: async ({ userId, id, approve }: { userId: string; id: string; approve: boolean }) => {
      if (approve) {
        const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "teacher" });
        if (error && error.code !== "23505") throw error;
      } else {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "teacher");
        if (error) throw error;
      }
      const { error } = await supabase
        .from("teacher_requests")
        .update({ status: approve ? "approved" : "rejected", reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(v.approve ? "Đã phê duyệt giáo viên" : "Đã từ chối / thu hồi quyền");
      void qc.invalidateQueries({ queryKey: ["teacher_requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (loading) return <PageShell title="Quản trị"><p className="text-muted-foreground">Đang tải...</p></PageShell>;
  if (!isAdmin) return <PageShell title="Quản trị"><p className="text-muted-foreground">Khu vực chỉ dành cho quản trị viên.</p></PageShell>;

  return (
    <PageShell title="Quản trị" description="Phê duyệt tài khoản giáo viên trước khi họ dùng hộp thư, nhận đặt lịch và quản lý bài viết.">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Yêu cầu tài khoản giáo viên</CardTitle>
          <CardDescription>{data.filter((r) => r.status === "pending").length} yêu cầu đang chờ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.length === 0 ? <p className="text-sm text-muted-foreground">Chưa có yêu cầu nào.</p> : data.map((r) => (
            <div key={r.id} className="flex flex-col gap-3 rounded-2xl border border-border p-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="font-semibold">{r.display_name}</p>
                <p className="text-xs text-muted-foreground">{r.email} · Gửi ngày {new Date(r.created_at).toLocaleDateString("vi-VN")}</p>
              </div>
              <Badge variant="secondary" className={STATUS[r.status]?.className ?? ""}>{STATUS[r.status]?.label ?? r.status}</Badge>
              <div className="flex gap-2">
                {r.status !== "approved" && (
                  <Button size="sm" onClick={() => decide.mutate({ userId: r.user_id, id: r.id, approve: true })}>Phê duyệt</Button>
                )}
                {r.status !== "rejected" && (
                  <Button size="sm" variant="outline" onClick={() => decide.mutate({ userId: r.user_id, id: r.id, approve: false })}>
                    {r.status === "approved" ? "Thu hồi" : "Từ chối"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageShell>
  );
}
