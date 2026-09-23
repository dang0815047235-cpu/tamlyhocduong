import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, AlertTriangle, Bot, User as UserIcon } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { answerMessage, CHAT_RULES } from "@/lib/chatbot-rules";

export const Route = createFileRoute("/_authenticated/tro-chuyen")({
  head: () => ({
    meta: [
      { title: "Trò chuyện cùng trợ lý | Tâm lý học đường THPT Phạm Văn Đồng" },
      {
        name: "description",
        content:
          "Chatbot theo kịch bản từ khóa hỗ trợ học sinh về học tập, bạn bè, an toàn học đường và đặt lịch tư vấn.",
      },
      { property: "og:title", content: "Trò chuyện cùng trợ lý tâm lý học đường" },
      { property: "og:description", content: "Trợ lý trả lời theo kịch bản đã được thầy cô chuẩn bị trước." },
    ],
  }),
  component: ChatPage,
});

type Msg = {
  id: number;
  from: "bot" | "me";
  text: string;
  emergency?: boolean;
  links?: { label: string; to: string }[];
};

const suggestions = [
  "Em thấy rất áp lực chuyện thi cử",
  "Em vừa cãi nhau với bạn thân",
  "Có bạn hay dọa nạt em ở trường",
  "Em muốn đặt lịch gặp thầy cô",
];

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 0,
      from: "bot",
      text: "Chào em! Mình là trợ lý ảo hỗ trợ tư vấn tâm lý học đường. Em có thể kể cho mình nghe điều em đang gặp phải, hoặc chọn nhanh một gợi ý bên dưới.",
    },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const answer = answerMessage(clean);
    setMessages((prev) => [
      ...prev,
      { id: prev.length, from: "me", text: clean },
      {
        id: prev.length + 1,
        from: "bot",
        text: answer.reply,
        emergency: answer.isEmergency,
        ...(answer.links ? { links: answer.links } : {}),
      },
    ]);
    setInput("");
    inputRef.current?.focus();
  };

  return (
    <PageShell
      title="Trò chuyện cùng trợ lý"
      description="Trợ lý trả lời theo kịch bản từ khóa đã được thầy cô chuẩn bị trước, không tự tạo câu trả lời."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <Card className="flex h-[32rem] flex-col overflow-hidden p-0">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((m) => (
              <div key={m.id} className={m.from === "me" ? "flex justify-end" : "flex gap-2"}>
                {m.from === "bot" && (
                  <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                    <Bot className="size-4" />
                  </span>
                )}
                <div
                  className={
                    m.from === "me"
                      ? "max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                      : m.emergency
                        ? "max-w-[85%] rounded-2xl rounded-bl-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm"
                        : "max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-3 text-sm"
                  }
                >
                  {m.emergency && (
                    <p className="mb-2 flex items-center gap-2 font-semibold text-destructive">
                      <AlertTriangle className="size-4" /> Cần hỗ trợ khẩn cấp
                    </p>
                  )}
                  <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                  {m.links && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.links.map((l) => (
                        <Button key={l.to + l.label} asChild size="sm" variant="secondary">
                          <Link to={l.to}>{l.label}</Link>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                {m.from === "me" && (
                  <span className="ml-2 mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <UserIcon className="size-4" />
                  </span>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <Input
                ref={inputRef}
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập điều em muốn chia sẻ..."
              />
              <Button type="submit" size="icon" aria-label="Gửi">
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-2 pt-6 text-sm">
              <p className="font-semibold">Trợ lý hiểu các nhóm chủ đề</p>
              <ul className="space-y-1 text-muted-foreground">
                {CHAT_RULES.filter((r) => r.group !== "Chào hỏi").map((r) => (
                  <li key={r.id}>• {r.group}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="space-y-1 pt-6 text-sm">
              <p className="font-semibold text-destructive">Lưu ý an toàn</p>
              <p className="text-muted-foreground">
                Nếu em đang gặp nguy hiểm hoặc có ý nghĩ làm hại bản thân, hãy nói ngay với người lớn, hoặc gọi
                Tổng đài 111.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
