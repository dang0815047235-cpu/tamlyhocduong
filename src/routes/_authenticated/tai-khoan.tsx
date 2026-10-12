import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarDays, HeartPulse, UserRound } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { AvatarEditor, PasswordChanger } from "@/components/AccountExtras";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { APPOINTMENT_STATUS } from "@/lib/constants";
import { MAX_SCORE } from "@/lib/quiz";

export const Route = createFileRoute("/_authenticated/tai-khoan")({
  head: () => ({
    meta: [
      { title: "Tài khoản và lịch sử hỗ trợ | THPT Phạm Văn Đồng" },
      { name: "description", content: "Xem thông tin tài khoản, lịch hẹn tư vấn và lịch sử kiểm tra cảm xúc của bạn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:title", content: "Tài khoản và lịch sử hỗ trợ" },
      { property: "og:description", content: "Thông tin cá nhân, lịch hẹn và kết quả tự kiểm tra cảm xúc." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, profile, accountType, teacherStatus, isAdmin } = useAuth();
  const isTeacher = accountType === "teacher";
  const queryClient = useQueryClient();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const saveName = async () => {
    const trimmed = newName.trim();
    if (!user || !trimmed) {
      toast.error("Tên không được để trống.");
      return;
    }
    setSavingName(true);
    const { error } = await supabase.from("profiles").update({ display_name: trimmed }).eq("id", user.id);
    setSavingName(false);
    if (error) {
      toast.error("Chưa đổi được tên. Bạn thử lại nhé.");
      return;
    }
    toast.success("Đã đổi tên tài khoản.");
    setEditingName(false);
    await queryClient.invalidateQueries();
    window.location.reload();
  };
  const { data: checkins = [], isError: checkinsError } = useQuery({
    queryKey: ["checkins", "mine", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("checkins").select("id, score, level, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: appointments = [], isError: appointmentsError } = useQuery({
    queryKey: ["appointments", "account", user?.id, accountType, profile?.display_name],
    enabled: !!user && !!accountType && (!isTeacher || teacherStatus === "approved"),
    queryFn: async () => {
      if (!user) return [];
      let query = supabase.from("appointments").select("id, student_id, counselor_name, appointment_date, appointment_slot, topic, status").order("appointment_date", { ascending: false });
      if (isTeacher) query = query.eq("counselor_name", profile?.display_name ?? "");
      else query = query.eq("student_id", user.id);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <PageShell title={isTeacher ? "Tài khoản giáo viên" : "Tài khoản học sinh"} description="Thông tin và hoạt động hỗ trợ của bạn.">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <div className="flex items-center gap-2"><UserRound className="size-5 text-primary" /><h2 className="text-lg font-semibold">Thông tin tài khoản</h2></div>
          <AvatarEditor />
          <div className="border-t border-border py-4 text-sm space-y-3">
            <div>
              <span className="text-muted-foreground">Họ tên</span>
              {editingName ? (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="max-w-xs" autoFocus />
                  <Button size="sm" onClick={saveName} disabled={savingName}>{savingName ? "Đang lưu..." : "Lưu"}</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>Hủy</Button>
                </div>
              ) : (
                <p className="font-medium">
                  {profile?.display_name ?? "Đang tải..."}{" "}
                  <button type="button" className="text-sm font-normal text-primary underline-offset-4 hover:underline" onClick={() => { setNewName(profile?.display_name ?? ""); setEditingName(true); }}>Đổi tên</button>
                </p>
              )}
            </div>
            <div><span className="text-muted-foreground">Email</span><p className="break-all font-medium">{user?.email}</p></div>
            <div><span className="text-muted-foreground">Loại tài khoản</span><p className="font-medium">{isTeacher ? "Giáo viên" : "Học sinh"}{isAdmin ? " · Quản trị viên" : ""}</p></div>
            {!isTeacher && profile?.class_name && <div><span className="text-muted-foreground">Lớp</span><p className="font-medium">{profile.class_name}</p></div>}
            {isTeacher && <div><span className="text-muted-foreground">Trạng thái giáo viên</span><p className="font-medium">{teacherStatus === "approved" ? "Đã phê duyệt" : teacherStatus === "rejected" ? "Chưa được phê duyệt" : "Đang chờ phê duyệt"}</p></div>}
          </div>
          {isTeacher && teacherStatus === "approved" && <Button asChild variant="outline"><Link to="/giao-vien">Xem hộp thư giáo viên</Link></Button>}
          <PasswordChanger />
        </section>
        <section className="space-y-4">
          <div className="flex items-center gap-2"><HeartPulse className="size-5 text-primary" /><h2 className="text-lg font-semibold">Lịch sử cảm xúc</h2></div>
          <p className="text-sm text-muted-foreground">Kết quả tự kiểm tra chỉ mang tính tham khảo, không phải chẩn đoán y khoa.</p>
          {checkinsError ? <p className="text-sm text-destructive">Chưa tải được lịch sử cảm xúc.</p> : checkins.length === 0 ? <p className="text-sm text-muted-foreground">Bạn chưa hoàn thành bài kiểm tra nào.</p> : (
            <div className="space-y-2">{checkins.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 border-b border-border py-3 text-sm"><div><p className="font-medium">{item.level}</p><p className="text-muted-foreground">{new Date(item.created_at).toLocaleString("vi-VN")}</p></div><span className="shrink-0 font-semibold">{item.score}/{MAX_SCORE}</span></div>)}</div>
          )}
          <Button asChild variant="outline" size="sm"><Link to="/kiem-tra-cam-xuc">Kiểm tra cảm xúc</Link></Button>
        </section>
      </div>
      <section className="mt-10 space-y-4 border-t border-border pt-8">
        <div className="flex items-center gap-2"><CalendarDays className="size-5 text-primary" /><h2 className="text-lg font-semibold">{isTeacher ? "Lịch hẹn tư vấn với bạn" : "Lịch hẹn của bạn"}</h2></div>
        {appointmentsError ? <p className="text-sm text-destructive">Chưa tải được lịch hẹn.</p> : appointments.length === 0 ? <p className="text-sm text-muted-foreground">{isTeacher && teacherStatus !== "approved" ? "Sau khi được phê duyệt, lịch hẹn với bạn sẽ xuất hiện tại đây." : "Chưa có lịch hẹn nào."}</p> : (
          <div className="grid gap-3 md:grid-cols-2">{appointments.map((item) => <Card key={item.id}><CardHeader className="pb-2"><CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base"><span>{new Date(`${item.appointment_date}T00:00:00`).toLocaleDateString("vi-VN")} · {item.appointment_slot}</span><Badge variant="secondary" className={APPOINTMENT_STATUS[item.status]?.className ?? ""}>{APPOINTMENT_STATUS[item.status]?.label ?? item.status}</Badge></CardTitle></CardHeader><CardContent className="text-sm"><p>{item.topic}</p><p className="mt-1 text-muted-foreground">{isTeacher ? "Lịch hẹn tư vấn" : item.counselor_name}</p></CardContent></Card>)}</div>
        )}
        {isTeacher ? teacherStatus === "approved" && <Button asChild variant="outline" size="sm"><Link to="/giao-vien">Quản lý lịch hẹn</Link></Button> : <Button asChild variant="outline" size="sm"><Link to="/dat-lich">Đặt và theo dõi lịch hẹn</Link></Button>}
      </section>
    </PageShell>
  );
}