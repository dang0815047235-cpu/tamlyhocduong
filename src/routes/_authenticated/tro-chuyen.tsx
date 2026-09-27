import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, AlertTriangle, Bot, User as UserIcon } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { answerMessage, CHAT_RULES } from "@/lib/chatbot-rules";
import { useServerFn } from "@tanstack/react-start";
import { askCounselorAI } from "@/lib/ai-chat.functions";

export const Route = createFileRoute("/_authenticated/tro-chuyen")({
  head: () => ({
    meta: [
      { title: "Trò chuyện cùng trợ lý | Tâm lý học đường THPT Phạm Văn Đồng" },
      {
        name: "description",
        content:
          "Trò chuyện với trợ lý ảo về học tập, công việc, cảm xúc, các mối quan hệ và an toàn học đường.",
      },
      { property: "og:title", content: "Trò chuyện cùng trợ lý tâm lý học đường" },
      { property: "og:description", content: "Một nơi nhẹ nhàng để chia sẻ và tìm hướng hỗ trợ phù hợp." },
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
  "Mình thấy rất áp lực chuyện thi cử",
  "Mình vừa cãi nhau với bạn thân",
  "Có người hay dọa nạt mình ở trường",
  "Mình muốn đặt lịch gặp giáo viên tư vấn",
];

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 0,
      from: "bot",
      text: "Chào bạn! Mình ở đây để lắng nghe. Nếu hôm nay có điều gì khiến bạn nặng lòng, bạn có thể kể theo cách thoải mái nhất nhé.",
    },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const askAI = useServerFn(askCounselorAI);
  const [thinking, setThinking] = useState(false);

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || thinking) return;
    const answer = answerMessage(clean);
    setInput("");
    inputRef.current?.focus();

    if (answer.isEmergency) {
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
      return;
    }

    // Keep the full conversation so follow-up questions have their context.
    const history = messages.map((m) => ({
      role: m.from === "me" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));
    setMessages((prev) => [...prev, { id: prev.length, from: "me", text: clean }]);
    setThinking(true);
    try {
       const res = await askAI({ data: { message: clean, history } });
      setMessages((prev) => [
        ...prev,
        res.ok
          ? { id: prev.length, from: "bot", text: res.text + "\n\n(Trả lời bởi trợ lý AI - chỉ mang tính tham khảo)" }
          : { id: prev.length, from: "bot", text: res.error },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: prev.length, from: "bot", text: "Mình chưa thể trả lời lúc này. Bạn thử lại sau hoặc gặp giáo viên tư vấn nhé." },
      ]);
    } finally {
      setThinking(false);
      inputRef.current?.focus();
    }
  };

  return (
    <PageShell
      title="Trò chuyện cùng trợ lý"
      description="Bạn có thể chia sẻ về học tập, công việc, các mối quan hệ hoặc điều đang khiến mình bận lòng."
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
            {thinking && <p className="pl-10 text-sm text-muted-foreground animate-pulse">Trợ lý đang suy nghĩ...</p>}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => void send(s)}
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
                void send(input);
              }}
            >
              <Input
                ref={inputRef}
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập điều bạn muốn chia sẻ..."
              />
              <Button type="submit" size="icon" aria-label="Gửi" disabled={thinking}>
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
                Nếu bạn đang gặp nguy hiểm hoặc có ý nghĩ làm hại bản thân, hãy tìm người đáng tin cậy ở gần ngay, hoặc gọi
                Tổng đài 111.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
