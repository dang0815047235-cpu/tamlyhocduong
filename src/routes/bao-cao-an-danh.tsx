import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INCIDENT_TYPES, SEVERITIES } from "@/lib/constants";
import { submitAnonymousReport } from "@/lib/anonymous-report.functions";

export const Route = createFileRoute("/bao-cao-an-danh")({
  head: () => ({
    meta: [
      { title: "Báo cáo ẩn danh | THCS & THPT Phạm Văn Đồng" },
      {
        name: "description",
        content: "Gửi báo cáo sự việc ẩn danh tới thầy cô tư vấn mà không cần đăng nhập.",
      },
    ],
  }),
  component: AnonymousReportPage,
});

function AnonymousReportPage() {
  const submitReport = useServerFn(submitAnonymousReport);
  const [incidentType, setIncidentType] = useState(INCIDENT_TYPES[0]!);
  const [occurredAt, setOccurredAt] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (description.trim().length < 10) {
      toast.error("Bạn hãy mô tả sự việc rõ hơn một chút nhé.");
      return;
    }

    setPending(true);
    try {
      await submitReport({
        data: {
          incidentType,
          occurredAt: occurredAt.trim() || undefined,
          location: location.trim() || undefined,
          description: description.trim(),
          severity: severity as "low" | "medium" | "high",
        },
      });

      toast.success("Đã gửi báo cáo ẩn danh tới thầy cô. Cảm ơn bạn đã lên tiếng!");
      setDescription("");
      setLocation("");
      setOccurredAt("");
      setSeverity("medium");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không gửi được báo cáo.");
    } finally {
      setPending(false);
    }
  };

  return (
    <PageShell
      title="Báo cáo sự việc ẩn danh"
      description="Bạn không cần đăng nhập. Nội dung sẽ được gửi tới thầy cô tư vấn để hỗ trợ kịp thời."
    >
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-primary" /> Gửi báo cáo ẩn danh
            </CardTitle>
            <CardDescription>
              Không lưu tài khoản người gửi. Nếu đang gặp nguy hiểm ngay lúc này, hãy tìm người lớn ở gần hoặc gọi 111 / 113.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Loại sự việc</Label>
                <Select value={incidentType} onValueChange={setIncidentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INCIDENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="anonymous-when">Thời gian xảy ra</Label>
                  <Input
                    id="anonymous-when"
                    value={occurredAt}
                    onChange={(event) => setOccurredAt(event.target.value)}
                    placeholder="Ví dụ: sáng thứ Ba tuần này"
                    maxLength={200}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anonymous-where">Địa điểm</Label>
                  <Input
                    id="anonymous-where"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Ví dụ: sân trường, lớp học"
                    maxLength={200}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="anonymous-description">Nội dung mô tả</Label>
                <Textarea
                  id="anonymous-description"
                  rows={6}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Bạn hãy kể lại sự việc đã xảy ra..."
                  minLength={10}
                  maxLength={5000}
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
                    {Object.entries(SEVERITIES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-2xl border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
                Ẩn danh với thầy cô: không yêu cầu tài khoản và không lưu <code>reporter_id</code>. Không nên nhập tên, số điện thoại hoặc thông tin nhận dạng nếu không cần thiết.
              </div>

              <Button type="submit" disabled={pending}>
                {pending ? "Đang gửi..." : "Gửi báo cáo ẩn danh"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
