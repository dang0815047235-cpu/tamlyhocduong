import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  DASS_MAX_SCORE,
  DASS_OPTIONS,
  DASS_QUESTIONS,
  evaluateDASS,
  evaluateQuiz,
  MAX_SCORE,
  QUIZ_OPTIONS,
  QUIZ_QUESTIONS,
  TEACHER_QUIZ_QUESTIONS,
  type DassResult,
  type QuizResult,
} from "@/lib/quiz";

export const Route = createFileRoute("/_authenticated/kiem-tra-cam-xuc")({
  head: () => ({
    meta: [
      { title: "Bài kiểm tra cảm xúc ngắn | Tâm lý học đường THCS & THPT Phạm Văn Đồng" },
      {
        name: "description",
        content:
          "Chọn bài ngắn 20 câu hoặc thang chuẩn DASS-21 (21 câu) để tự nhìn lại cảm xúc gần đây và nhận lời khuyên phù hợp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:title", content: "Bài kiểm tra cảm xúc ngắn" },
      { property: "og:description", content: "Kết quả chỉ mang tính tham khảo, không phải chẩn đoán y khoa." },
    ],
  }),
  component: QuizPage,
});

type QuizMode = "quick" | "dass";

function QuizPage() {
  const { user, accountType } = useAuth();
  const [mode, setMode] = useState<QuizMode>("quick");
  const questions =
    mode === "dass"
      ? DASS_QUESTIONS.map((q) => q.text)
      : (accountType === "teacher" ? TEACHER_QUIZ_QUESTIONS : QUIZ_QUESTIONS).map((q) => q.text);
  const [answers, setAnswers] = useState<(number | null)[]>(QUIZ_QUESTIONS.map(() => null));
  const [score, setScore] = useState<number | null>(null);
  const [quickResult, setQuickResult] = useState<QuizResult | null>(null);
  const [dassResult, setDassResult] = useState<DassResult | null>(null);
  const [saving, setSaving] = useState(false);

  const answered = answers.filter((a) => a !== null).length;
  const result = mode === "dass" ? dassResult : quickResult;
  const maxScore = mode === "dass" ? DASS_MAX_SCORE : MAX_SCORE;

  const switchMode = (m: QuizMode) => {
    if (m === mode) return;
    setMode(m);
    setAnswers(Array(m === "dass" ? DASS_QUESTIONS.length : QUIZ_QUESTIONS.length).fill(null));
    setScore(null);
    setQuickResult(null);
    setDassResult(null);
  };

  const submit = async () => {
    if (answered < questions.length) {
      toast.error("Bạn hãy trả lời hết tất cả câu hỏi nhé.");
      return;
    }
    const values = answers.map((a) => a ?? 0);
    const kind = accountType === "teacher" ? "teacher" : "student";
    const dassEval = mode === "dass" ? evaluateDASS(values, kind) : null;
    const quickEval = mode === "dass" ? null : evaluateQuiz(values, kind);
    // DASS-21 lưu tổng điểm chuẩn (tổng ba thang đã nhân đôi), bài ngắn giữ tổng thô.
    const total = dassEval ? dassEval.total : (values.reduce((s, a) => s + a, 0));
    const level = dassEval ? dassEval.level : (quickEval?.level ?? "");
    setScore(total);
    if (dassEval) setDassResult(dassEval);
    if (quickEval) setQuickResult(quickEval);
    if (user) {
      setSaving(true);
      const { error } = await supabase
        .from("checkins")
        .insert({ user_id: user.id, score: total, level });
      setSaving(false);
      if (error) toast.error("Không lưu được kết quả, nhưng bạn vẫn xem được lời khuyên bên dưới.");
    }
  };

  const reset = () => {
    setAnswers(Array(questions.length).fill(null));
    setScore(null);
    setQuickResult(null);
    setDassResult(null);
  };

  const options = mode === "dass" ? DASS_OPTIONS : QUIZ_OPTIONS;

  return (
    <PageShell
      title={
        accountType === "teacher"
          ? "Kiểm tra cảm xúc dành cho giáo viên"
          : "Kiểm tra cảm xúc dành cho học sinh"
      }
      description={
        mode === "dass"
          ? "Thang DASS-21 chuẩn khoa học gồm 21 câu, mất khoảng 7 phút. Hãy chọn phương án đúng nhất với bạn trong tuần gần đây."
          : "Hãy chọn phương án đúng nhất với bạn trong hai tuần gần đây. Bài gồm 20 câu, mất khoảng 5 phút."
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border bg-muted/40 p-2">
        <Button
          variant={mode === "quick" ? "default" : "ghost"}
          className="rounded-full"
          onClick={() => switchMode("quick")}
        >
          Bài ngắn 20 câu
        </Button>
        <Button
          variant={mode === "dass" ? "default" : "ghost"}
          className="rounded-full"
          onClick={() => switchMode("dass")}
        >
          Thang DASS-21 chuẩn
        </Button>
        <p className="ml-1 text-xs text-muted-foreground">
          {mode === "quick"
            ? "Nhanh, gọn — phù hợp tự nhìn lại hằng tuần."
            : "Thang đo khoa học DASS-21 tách riêng mức Trầm cảm, Lo âu, Căng thẳng."}
        </p>
      </div>

      <Card className="mb-6 border-accent bg-accent/30">
        <CardContent className="flex gap-3 pt-6 text-sm">
          <Info className="mt-0.5 size-5 shrink-0 text-accent-foreground" />
          <p>
            <strong>Lưu ý:</strong> Đây không phải kết quả chẩn đoán y khoa. Bài kiểm tra chỉ giúp bạn tự
               nhìn lại cảm xúc của mình. Nếu bạn thấy lo lắng, hãy trao đổi với người tin cậy hoặc chuyên
               gia.
          </p>
        </CardContent>
      </Card>

      {result === null ? (
        <div className="space-y-4">
          <div>
            <Progress value={(answered / questions.length) * 100} />
            <p className="mt-2 text-sm text-muted-foreground">
               Đã trả lời {answered}/{questions.length} câu
            </p>
          </div>

           {questions.map((q, qi) => (
            <Card key={q}>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Câu {qi + 1}. {q}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {options.map((o) => (
                  <Button
                    key={o.label}
                    variant={answers[qi] === o.value ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() =>
                      setAnswers((prev) => prev.map((a, i) => (i === qi ? o.value : a)))
                    }
                  >
                    {o.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          ))}

          <Button size="lg" onClick={submit} disabled={saving}>
            {saving ? "Đang lưu..." : "Xem kết quả"}
          </Button>
        </div>
      ) : mode === "dass" && dassResult !== null ? (
        <Card
          className={
            dassResult.tone === "alert"
              ? "border-destructive/40 bg-destructive/5"
              : dassResult.tone === "warn"
                ? "border-primary/40"
                : "border-accent"
          }
        >
          <CardHeader>
            <CardDescription>
              Điểm của bạn: {score}/{maxScore}
            </CardDescription>
            <CardTitle className="text-xl">
              {dassResult.level} — {dassResult.headline}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold">Mức độ theo từng thang</p>
              {dassResult.subscales.map((s) => (
                <div key={s.key}>
                  <div className="flex justify-between text-xs">
                    <span>
                      {s.label} — {s.level}
                    </span>
                    <span>
                      {s.score}/42 ({s.percent}%)
                    </span>
                  </div>
                  <Progress value={s.percent} />
                </div>
              ))}
            </div>
            <ul className="space-y-2 text-sm">
              {dassResult.advice.map((a) => (
                <li key={a}>• {a}</li>
              ))}
            </ul>
            <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
              Kết quả theo Thang DASS-21 (Lovibond &amp; Lovibond, 1995), tính theo bảng điểm chuẩn
              quốc tế. Kết quả chỉ mang tính tham khảo và không thay thế chẩn đoán của chuyên gia y tế.
            </p>
            <div className="flex flex-wrap gap-2">
               {accountType !== "teacher" && <Button asChild>
                 <Link to="/dat-lich">Đặt lịch gặp thầy cô</Link>
               </Button>}
              <Button asChild variant="secondary">
                <Link to="/thu-vien">Đọc bài viết gợi ý</Link>
              </Button>
              <Button variant="outline" onClick={reset}>
                Làm lại
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        quickResult !== null && (
          <Card
            className={
              quickResult.tone === "alert"
                ? "border-destructive/40 bg-destructive/5"
                : quickResult.tone === "warn"
                  ? "border-primary/40"
                  : "border-accent"
            }
          >
            <CardHeader>
              <CardDescription>
                Điểm của bạn: {score}/{maxScore}
              </CardDescription>
              <CardTitle className="text-xl">
                {quickResult.level} — {quickResult.headline}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold">Mức độ theo từng nhóm</p>
                {quickResult.categories.map((c) => (
                  <div key={c.key}>
                    <div className="flex justify-between text-xs">
                      <span>{c.label}</span>
                      <span>{c.percent}%</span>
                    </div>
                    <Progress value={c.percent} />
                  </div>
                ))}
              </div>
              <ul className="space-y-2 text-sm">
                {quickResult.advice.map((a) => (
                  <li key={a}>• {a}</li>
                ))}
              </ul>
              <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
                Kết quả này chỉ mang tính tham khảo và không thay thế chẩn đoán của chuyên gia y tế.
              </p>
              <div className="flex flex-wrap gap-2">
                 {accountType !== "teacher" && <Button asChild>
                   <Link to="/dat-lich">Đặt lịch gặp thầy cô</Link>
                 </Button>}
                <Button asChild variant="secondary">
                  <Link to="/thu-vien">Đọc bài viết gợi ý</Link>
                </Button>
                <Button variant="outline" onClick={reset}>
                  Làm lại
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      )}
    </PageShell>
  );
}
