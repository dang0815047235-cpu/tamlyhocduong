import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
import { APPOINTMENT_STATUS, APPOINTMENT_TOPICS, COUNSELORS, SLOTS } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/dat-lich")({
  head: () => ({
    meta: [
      { title: "Đặt lịch tư vấn tâm lý | THPT Phạm Văn Đồng" },
      {
        name: "description",
        content: "Học sinh chọn ngày, khung giờ, giáo viên và chủ đề để đặt lịch gặp phòng tư vấn tâm lý học đường.",
      },
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

  const [counselor, setCounselor] = useState(COUNSELORS[0]!);
  const [date, setDate] = useState(today);
  const [slot, setSlot] = useState(SLOTS[0]!);
  const [topic, setTopic] = useState(APPOINTMENT_TOPICS[0]!);
  const [note, setNote] = useState("");

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
      const { error } = await supabase.from("appointments").insert({
        student_id: user!.id,
        counselor_name: counselor,
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
          ? "Khung giờ này đã có bạn khác đặt. Em chọn giờ khác giúp nhé."
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
      description="Chọn thầy cô, ngày và khung giờ phù hợp. Nội dung buổi gặp được giữ kín giữa em và giáo viên tư vấn."
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
                <Select value={counselor} onValueChange={setCounselor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNSELORS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label htmlFor="note">Em muốn nói thêm điều gì? (không bắt buộc)</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: em muốn trao đổi về việc ôn thi học kỳ."
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Đang gửi..." : "Gửi yêu cầu đặt lịch"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lịch hẹn của em</CardTitle>
            <CardDescription>Theo dõi trạng thái thầy cô cập nhật.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!mine || mine.length === 0 ? (
              <p className="text-sm text-muted-foreground">Em chưa có lịch hẹn nào.</p>
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
