import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { INCIDENT_TYPES, REPORT_STATUS, SEVERITIES } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/bao-cao")({
  head: () => ({
    meta: [
      { title: "Báo cáo sự việc cần hỗ trợ | THCS & THPT Phạm Văn Đồng" },
      {
        name: "description",
        content: "Biểu mẫu gửi báo cáo sự việc cần hỗ trợ tới thầy cô, có tùy chọn gửi ẩn danh.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:title", content: "Báo cáo sự việc cần hỗ trợ" },
      { property: "og:description", content: "Học sinh có thể gửi báo cáo bằng tài khoản hoặc ẩn danh." },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [incidentType, setIncidentType] = useState(INCIDENT_TYPES[0]!);
  const [occurredAt, setOccurredAt] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [anonymous, setAnonymous] = useState(false);

  const { data: mine } = useQuery({
    queryKey: ["reports", "mine", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("reporter_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("reports").insert({
        reporter_id: anonymous ? null : user!.id,
        is_anonymous: anonymous,
        incident_type: incidentType,
        occurred_at: occurredAt.trim() || null,
        location: location.trim() || null,
        description: description.trim(),
        severity,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Đã gửi báo cáo tới thầy cô. Cảm ơn bạn đã lên tiếng!");
      setDescription("");
      setLocation("");
      setOccurredAt("");
      void qc.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (e: Error) => toast.error("Không gửi được báo cáo: " + e.message),
  });

  return (
    <PageShell
      title="Báo cáo sự việc cần hỗ trợ"
      description="Hãy kể lại sự việc để thầy cô nắm được và hỗ trợ kịp thời. Bạn có thể chọn gửi ẩn danh."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-primary" /> Biểu mẫu báo cáo
            </CardTitle>
            <CardDescription>
              Nếu sự việc đang nguy hiểm, hãy tìm người lớn ngay lập tức hoặc gọi 111 / 113.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (description.trim().length < 10) {
                  toast.error("Bạn hãy mô tả sự việc rõ hơn một chút nhé.");
                  return;
                }
                submit.mutate();
              }}
            >
              <div className="space-y-2">
                <Label>Loại sự việc</Label>
                <Select value={incidentType} onValueChange={setIncidentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INCIDENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="when">Thời gian xảy ra</Label>
                  <Input
                    id="when"
                    value={occurredAt}
                    onChange={(e) => setOccurredAt(e.target.value)}
                    placeholder="Ví dụ: sáng thứ Ba tuần này"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="where">Địa điểm</Label>
                  <Input
                    id="where"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ví dụ: sân trường, lớp học"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Nội dung mô tả</Label>
                <Textarea
                  id="desc"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Bạn hãy kể lại sự việc đã xảy ra..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Mức độ cần hỗ trợ</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SEVERITIES).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-muted p-3">
                <Switch id="anon" checked={anonymous} onCheckedChange={setAnonymous} />
                <div>
                  <Label htmlFor="anon">Gửi ẩn danh</Label>
                  <p className="text-xs text-muted-foreground">
                    Thầy cô sẽ không biết ai gửi. Lưu ý: báo cáo ẩn danh sẽ không hiện trong danh sách theo
                    dõi của bạn.
                  </p>
                </div>
              </div>

              <Button type="submit" disabled={submit.isPending}>
                {submit.isPending ? "Đang gửi..." : "Gửi báo cáo"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Báo cáo bạn đã gửi</CardTitle>
            <CardDescription>Chỉ hiển thị các báo cáo gửi bằng tài khoản của bạn.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!mine || mine.length === 0 ? (
              <p className="text-sm text-muted-foreground">Bạn chưa gửi báo cáo nào.</p>
            ) : (
              mine.map((r) => (
                <div key={r.id} className="rounded-2xl border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{r.incident_type}</p>
                    <Badge variant="secondary" className={REPORT_STATUS[r.status]?.className ?? ""}>
                      {REPORT_STATUS[r.status]?.label ?? r.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Gửi ngày {new Date(r.created_at).toLocaleDateString("vi-VN")} ·{" "}
                    {SEVERITIES[r.severity]?.label ?? r.severity}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm">{r.description}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
