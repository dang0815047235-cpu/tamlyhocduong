import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/thu-vien")({
  head: () => ({
    meta: [
      { title: "Thư viện kỹ năng và sức khỏe tinh thần | THCS & THPT Phạm Văn Đồng" },
      {
        name: "description",
        content:
          "Bài viết ngắn về giảm căng thẳng trước kỳ thi, quản lý thời gian, kiểm soát cảm xúc, giao tiếp và phòng chống bắt nạt học đường.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:title", content: "Thư viện kỹ năng và sức khỏe tinh thần" },
      {
        property: "og:description",
        content: "Bài viết đã được thầy cô duyệt dành cho học sinh THCS & THPT Phạm Văn Đồng.",
      },
    ],
  }),
  component: Library,
});

type Article = {
  id: string;
  title: string;
  topic: string;
  summary: string;
  content: string;
  source: string | null;
};

function Library() {
  const [open, setOpen] = useState<Article | null>(null);
  const [topic, setTopic] = useState<string>("Tất cả");

  const { data, isLoading } = useQuery({
    queryKey: ["articles", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, topic, summary, content, source")
        .eq("is_published", true)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Article[];
    },
  });

  const topics = ["Tất cả", ...Array.from(new Set((data ?? []).map((a) => a.topic)))];
  const list = (data ?? []).filter((a) => topic === "Tất cả" || a.topic === topic);

  return (
    <PageShell
      title="Thư viện kiến thức"
      description="Những bài viết ngắn về kỹ năng học đường và chăm sóc sức khỏe tinh thần, đã được thầy cô duyệt."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {topics.map((t) => (
          <Button
            key={t}
            size="sm"
            variant={t === topic ? "default" : "outline"}
            onClick={() => setTopic(t)}
            className="rounded-full"
          >
            {t}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Đang tải bài viết...</p>
      ) : list.length === 0 ? (
        <p className="text-muted-foreground">Chưa có bài viết nào trong mục này.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <Card key={a.id} className="flex flex-col">
              <CardHeader>
                <Badge variant="secondary" className="w-fit">
                  {a.topic}
                </Badge>
                <CardTitle className="mt-2 text-lg">{a.title}</CardTitle>
                <CardDescription>{a.summary}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button variant="secondary" size="sm" onClick={() => setOpen(a)}>
                  Đọc bài viết
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{open?.title}</DialogTitle>
            <DialogDescription>{open?.topic}</DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-line text-sm leading-relaxed">{open?.content}</div>
          {open?.source && (
            <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
              Nguồn tham khảo: {open.source}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
