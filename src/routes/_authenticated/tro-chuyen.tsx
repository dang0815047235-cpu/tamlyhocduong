import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, AlertTriangle, Bot, User as UserIcon } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { answerMessage, CHAT_RULES, linksFor } from "@/lib/chatbot-rules";
import { useServerFn } from "@tanstack/react-start";
import { askCounselorAI, logRuleChat } from "@/lib/ai-chat.functions";

export const Route = createFileRoute("/_authenticated/tro-chuyen")({
  head: () => ({
    meta: [
      { title: "Trò chuyện cùng trợ lý | Tâm lý học đường THCS & THPT Phạm Văn Đồng" },
      {
        name: "description",
        content:
          "Trò chuyện với trợ lý ảo về học tập, công việc, cảm xúc, các mối quan hệ và an toàn học đường.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
    isError?: boolean;
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
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [typingMessageId, setTypingMessageId] = useState<number | null>(null);
  const [revealedLength, setRevealedLength] = useState(0);
  const [composerFocused, setComposerFocused] = useState(false);
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    const updateViewportHeight = () => {
      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty("--chat-viewport-height", `${height}px`);
    };
    const visualViewport = window.visualViewport;
    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight);
    visualViewport?.addEventListener("resize", updateViewportHeight);
    return () => {
      window.removeEventListener("resize", updateViewportHeight);
      visualViewport?.removeEventListener("resize", updateViewportHeight);
      document.documentElement.style.removeProperty("--chat-viewport-height");
    };
  }, []);

  useEffect(() => {
    const message = messages.find((item) => item.id === typingMessageId && item.from === "bot");
    if (!message || typingMessageId === null) return;

    const characters = Array.from(message.text);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealedLength(characters.length);
      setTypingMessageId(null);
      return;
    }

    let visible = 0;
    const timer = window.setInterval(() => {
      visible = Math.min(visible + 2, characters.length);
      setRevealedLength(visible);
      if (visible >= characters.length) {
        window.clearInterval(timer);
        setTypingMessageId(null);
      }
    }, 36);

    return () => window.clearInterval(timer);
  }, [typingMessageId, messages]);

  useEffect(() => {
    const chatScroll = chatScrollRef.current;
    if (!chatScroll) return;
    chatScroll.scrollTo({
      top: chatScroll.scrollHeight,
      behavior: typingMessageId === null ? "smooth" : "auto",
    });
  }, [messages, revealedLength, thinking, typingMessageId]);

  const askAI = useServerFn(askCounselorAI);
  const logRule = useServerFn(logRuleChat);

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || thinking || typingMessageId !== null) return;
    const answer = answerMessage(clean);
    setInput("");
    inputRef.current?.focus();

    // 1) Khẩn cấp hoặc khớp đúng một nhóm → trả câu viết sẵn, không tốn lượt AI.
    if (answer.matched) {
      const botId = Date.now();
      setMessages((prev) => [
        ...prev,
        { id: prev.length, from: "me", text: clean },
        {
          id: botId,
          from: "bot",
          text: answer.reply,
          emergency: answer.isEmergency,
          ...(answer.links ? { links: answer.links } : {}),
        },
      ]);
      // Câu thường: gõ chữ dần như câu của AI. Câu khẩn cấp: hiện ngay lập tức.
      if (!answer.isEmergency) {
        setRevealedLength(0);
        setTypingMessageId(botId);
      }
      // Lưu log ở nền (không chặn giao diện) để báo cáo tuần của giáo viên vẫn đủ dữ liệu.
      void logRule({ data: { message: clean.slice(0, 1000) } }).catch((err) =>
        console.error("logRuleChat failed", err),
      );
      return;
    }

    // 2) Không khớp rule (hoặc nhiều chủ đề) → hỏi AI, giữ ngữ cảnh hội thoại.
    // Bỏ lời chào ban đầu (id === 0) và các tin báo lỗi để lịch sử hợp lệ với Gemini.
    const history = messages
      .filter((m) => m.id !== 0 && !m.isError)
      .map((m) => ({
        role: m.from === "me" ? ("user" as const) : ("assistant" as const),
        content: m.text,
      }));
    setMessages((prev) => [...prev, { id: prev.length, from: "me", text: clean }]);
    setThinking(true);
    try {
      const res = await askAI({ data: { message: clean, history } });
      if (res.ok) {
        const responseId = Date.now();
        setRevealedLength(0);
        setTypingMessageId(responseId);
        setMessages((prev) => [
          ...prev,
          { id: responseId, from: "bot", text: res.text, links: linksFor(clean, res.text) },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length,
            from: "bot",
            text: res.error,
            links: linksFor(clean),
          },
        ]);
      }
    } catch (err) {
      console.error("askCounselorAI request failed", err);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length,
          from: "bot",
          text: "Mình chưa kết nối được với máy chủ. Bạn thử tải lại trang hoặc đăng nhập lại nhé.",
        },
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
      fullViewport
    >
      <div className="grid min-h-0 flex-1 gap-4 lg:flex-none lg:grid-cols-[1fr_18rem] lg:gap-6">
        <Card className="flex min-h-0 flex-col overflow-hidden p-0 lg:h-[32rem]">
          <div ref={chatScrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
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
                  <p className="whitespace-pre-line leading-relaxed">
                    {m.id === typingMessageId ? Array.from(m.text).slice(0, revealedLength).join("") : m.text}
                    {m.id === typingMessageId && <span aria-hidden="true" className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-current align-middle" />}
                  </p>
                  {m.links && m.id !== typingMessageId && (
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

          <div className="shrink-0 border-t border-border p-3">
            <div className={composerFocused ? "mb-2 hidden flex-wrap gap-2 sm:flex" : "mb-2 flex flex-wrap gap-2"}>
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => void send(s)}
                  disabled={thinking || typingMessageId !== null}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
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
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setComposerFocused(true)}
                onBlur={() => setComposerFocused(false)}
                placeholder="Nhập điều bạn muốn chia sẻ..."
              />
              <Button type="submit" size="icon" aria-label="Gửi" disabled={thinking || typingMessageId !== null}>
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </Card>

        <div className="hidden space-y-4 lg:block">
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
