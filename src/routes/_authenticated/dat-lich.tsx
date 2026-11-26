import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarHeart } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { APPOINTMENT_STATUS, APPOINTMENT_TOPICS, SLOTS } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/dat-lich")({
  head: () => ({
    meta: [
      { title: "Đặt lịch tư vấn tâm lý | THCS & THPT Phạm Văn Đồng" },
      {
        name: "description",
        content: "Chọn ngày, khung giờ, giáo viên và chủ đề để đặt lịch gặp phòng tư vấn tâm lý học đường.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:title", content: "Đặt lịch tư vấn tâm lý học đường" },
      { property: "og:description", content: "Đặt và theo dõi trạng thái lịch hẹn với thầy cô tư vấn." },
    ],
  }),
  component: AppointmentPage,
});

function AppointmentPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);

  const [counselorId, setCounselorId] = useState("");
  const [date, setDate] = useState(today);
  const [slot, setSlot] = useState(SLOTS[0]!);
  const [topic, setTopic] = useState(APPOINTMENT_TOPICS[0]!);
  const [note, setNote] = useState("");

  const { data: counselors = [], isPending: counselorsLoading, isError: counselorsError, refetch: refreshCounselors } = useQuery({
    queryKey: ["approved-counselors"],
    enabled: !!user,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_approved_counselors");
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!counselors.some((c) => c.id === counselorId)) setCounselorId(counselors[0]?.id ?? "");
  }, [counselors, counselorId]);

  const { data: mine } = useQuery({
    queryKey: ["appointments", "mine", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("student_id", user!.id)
        .order("appointment_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: latest, error: lookupError } = await supabase.rpc("list_approved_counselors");
      if (lookupError) throw lookupError;
      const selected = latest?.find((c) => c.id === counselorId);
      if (!selected) throw new Error("Giáo viên này không còn nhận lịch. Bạn vui lòng chọn lại.");
      if (!user) throw new Error("Bạn cần đăng nhập để đặt lịch.");
      const { error } = await supabase.from("appointments").insert({
        student_id: user.id,
        counselor_id: selected.id,
        counselor_name: selected.display_name,
        appointment_date: date,
        appointment_slot: slot,
        topic,
        note: note.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Đã gửi yêu cầu đặt lịch. Thầy cô sẽ xác nhận sớm nhé!");
      setNote("");
      void qc.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (e: { code?: string; message: string }) => {
      toast.error(
        e.code === "23505"
          ? "Khung giờ này đã có bạn khác đặt. Bạn chọn giờ khác giúp nhé."
          : "Không đặt được lịch: " + e.message,
      );
    },
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Đã hủy lịch hẹn.");
      void qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  return (
    <PageShell
      title="Đặt lịch tư vấn"
      description="Chọn giáo viên, ngày và khung giờ phù hợp. Nội dung buổi gặp được giữ kín giữa bạn và giáo viên tư vấn."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarHeart className="size-5 text-primary" /> Yêu cầu lịch hẹn mới
            </CardTitle>
            <CardDescription>Hệ thống sẽ báo lại nếu khung giờ đã có người đặt.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                create.mutate();
              }}
            >
              <div className="space-y-2">
                <Label>Giáo viên tư vấn</Label>
                <Select value={counselorId} onValueChange={setCounselorId} disabled={!counselors.length}>
                  <SelectTrigger>
                    <SelectValue placeholder={counselorsLoading ? "Đang tải giáo viên..." : "Chọn giáo viên"} />
                  </SelectTrigger>
                  <SelectContent>
                    {counselors.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {counselorsError ? (
                  <p className="text-sm text-destructive">Chưa tải được danh sách giáo viên. <Button type="button" variant="link" className="h-auto p-0" onClick={() => void refreshCounselors()}>Thử lại</Button></p>
                ) : !counselorsLoading && counselors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Hiện chưa có giáo viên được phê duyệt để nhận lịch.</p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Ngày</Label>
                  <Input
                    id="date"
                    type="date"
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Khung giờ</Label>
                  <Select value={slot} onValueChange={setSlot}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SLOTS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Chủ đề khái quát</Label>
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_TOPICS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Bạn muốn nói thêm điều gì? (không bắt buộc)</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: mình muốn trao đổi về một chuyện gần đây."
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={create.isPending || !counselorId || counselorsError}>
                {create.isPending ? "Đang gửi..." : "Gửi yêu cầu đặt lịch"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lịch hẹn của bạn</CardTitle>
            <CardDescription>Theo dõi trạng thái thầy cô cập nhật.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!mine || mine.length === 0 ? (
              <p className="text-sm text-muted-foreground">Bạn chưa có lịch hẹn nào.</p>
            ) : (
              mine.map((a) => (
                <div key={a.id} className="rounded-2xl border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">
                      {new Date(a.appointment_date).toLocaleDateString("vi-VN")} · {a.appointment_slot}
                    </p>
                    <Badge className={APPOINTMENT_STATUS[a.status]?.className ?? ""} variant="secondary">
                      {APPOINTMENT_STATUS[a.status]?.label ?? a.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{a.counselor_name}</p>
                  <p className="mt-1 text-sm">Chủ đề: {a.topic}</p>
                  {a.note && <p className="mt-1 text-sm text-muted-foreground">Ghi chú: {a.note}</p>}
                  {(a.status === "pending" || a.status === "confirmed") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => cancel.mutate(a.id)}
                      disabled={cancel.isPending}
                    >
                      Hủy lịch
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
