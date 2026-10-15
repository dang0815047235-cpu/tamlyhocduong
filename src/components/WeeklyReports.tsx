import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { generateWeeklyReportsNow } from "@/lib/weekly-reports.functions";

const SENT: Record<string, { label: string; cls: string; guide: string }> = {
  negative: { label: "Cần quan tâm", cls: "bg-rose-100 text-rose-900", guide: "Hướng giải quyết" },
  neutral: { label: "Ổn định", cls: "bg-sky-100 text-sky-900", guide: "Gợi ý" },
  positive: { label: "Tích cực", cls: "bg-emerald-100 text-emerald-900", guide: "Lời khích lệ" },
};

export function WeeklyReports() {
  const qc = useQueryClient();
  const gen = useServerFn(generateWeeklyReportsNow);
  const [week, setWeek] = useState<string>("");
  const { data = [] } = useQuery({
    queryKey: ["weekly-reports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("weekly_reports").select("*").order("week_start", { ascending: false }).order("sentiment").limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: summaries = [] } = useQuery({
    queryKey: ["weekly-summaries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("weekly_summaries").select("*").order("week_start", { ascending: false }).limit(12);
      if (error) throw error;
      return data ?? [];
    },
  });
  const weeks = Array.from(new Set(data.map((r) => r.week_start)));
  const active = week || weeks[0] || "";
  const rows = data.filter((r) => r.week_start === active).sort((a, b) => (a.sentiment === "negative" ? -1 : b.sentiment === "negative" ? 1 : 0));

  const run = useMutation({
    mutationFn: () => gen(),
    onSuccess: (r) => {
      toast[r.paused ? "warning" : "success"](r.paused ?? `Đã tạo ${r.created} báo cáo${r.remaining ? ", bấm lại để tạo tiếp" : ""}.`);
      void qc.invalidateQueries({ queryKey: ["weekly-reports"] });
      void qc.invalidateQueries({ queryKey: ["weekly-summaries"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Báo cáo tâm lý hàng tuần</CardTitle>
          <CardDescription>
            Tự động tổng hợp mỗi sáng thứ Hai từ trò chuyện AI, bài kiểm tra cảm xúc, lịch hẹn và báo cáo của từng học sinh. Chỉ mang tính tham khảo, không phải chẩn đoán.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Button onClick={() => run.mutate()} disabled={run.isPending}>
            {run.isPending ? "Đang tổng hợp..." : "Tổng hợp tuần này ngay"}
          </Button>
          {weeks.map((w) => (
            <Button key={w} size="sm" variant={w === active ? "secondary" : "outline"} onClick={() => setWeek(w)}>
              Tuần từ {new Date(w).toLocaleDateString("vi-VN")}
            </Button>
          ))}
        </CardContent>
      </Card>
      {(() => {
        const digest = summaries.find((s) => s.week_start === active);
        if (!digest) return null;
        const st = digest.stats as { students?: number; positive?: number; neutral?: number; negative?: number; chats?: number; checkins?: number; appointments?: number; reports?: number };
        return (
          <Card className="border-primary/40">
            <CardHeader>
              <CardTitle>Bản tóm tắt đầu tuần</CardTitle>
              <CardDescription>
                {st.students ?? 0} học sinh · {st.positive ?? 0} tích cực · {st.neutral ?? 0} ổn định · {st.negative ?? 0} cần quan tâm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm whitespace-pre-line">{digest.summary}</p>
              {digest.recommendations ? (
                <div className="rounded-xl bg-secondary p-3 text-sm whitespace-pre-line">
                  <span className="font-medium">Đề xuất cho tuần tới: </span>
                  {digest.recommendations}
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })()}
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có báo cáo nào.</p>
      ) : (
        rows.map((r) => {
          const s = SENT[r.sentiment] ?? SENT["neutral"]!;
          const st = r.stats as { chats?: number; checkins?: number; appointments?: number; reports?: number };
          return (
            <Card key={r.id}>
              <CardContent className="space-y-2 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{r.student_name}</p>
                  <Badge variant="secondary" className={s.cls}>{s.label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {st.chats ?? 0} tin nhắn AI · {st.checkins ?? 0} bài kiểm tra · {st.appointments ?? 0} lịch hẹn · {st.reports ?? 0} báo cáo
                </p>
                <p className="text-sm">{r.summary}</p>
                <div className="rounded-xl bg-secondary p-3 text-sm">
                  <span className="font-medium">{s.guide}: </span>
                  {r.guidance}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
