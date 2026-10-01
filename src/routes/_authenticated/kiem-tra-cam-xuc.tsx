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
import { evaluateQuiz, MAX_SCORE, QUIZ_OPTIONS, QUIZ_QUESTIONS, TEACHER_QUIZ_QUESTIONS } from "@/lib/quiz";

export const Route = createFileRoute("/_authenticated/kiem-tra-cam-xuc")({
  head: () => ({
    meta: [
      { title: "Bài kiểm tra cảm xúc ngắn | Tâm lý học đường THPT Phạm Văn Đồng" },
      {
        name: "description",
        content: "20 câu hỏi giúp bạn tự nhìn lại cảm xúc gần đây và nhận lời khuyên phù hợp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:title", content: "Bài kiểm tra cảm xúc ngắn" },
      { property: "og:description", content: "Kết quả chỉ mang tính tham khảo, không phải chẩn đoán y khoa." },
    ],
  }),
  component: QuizPage,
});

function QuizPage() {
  const { user, accountType } = useAuth();
  const questions = accountType === "teacher" ? TEACHER_QUIZ_QUESTIONS : QUIZ_QUESTIONS;
  const [answers, setAnswers] = useState<(number | null)[]>(QUIZ_QUESTIONS.map(() => null));
  const [score, setScore] = useState<number | null>(null);
  const [result, setResult] = useState<ReturnType<typeof evaluateQuiz> | null>(null);
  const [saving, setSaving] = useState(false);

  const answered = answers.filter((a) => a !== null).length;

  const submit = async () => {
    if (answered < questions.length) {
      toast.error("Bạn hãy trả lời hết tất cả câu hỏi nhé.");
      return;
    }
    const values = answers.map((a) => a ?? 0);
    const total = values.reduce((s, a) => s + a, 0);
    const evaluated = evaluateQuiz(values, accountType === "teacher" ? "teacher" : "student");
    setScore(total);
    setResult(evaluated);
    if (user) {
      setSaving(true);
      const { error } = await supabase
        .from("checkins")
        .insert({ user_id: user.id, score: total, level: evaluated.level });
      setSaving(false);
      if (error) toast.error("Không lưu được kết quả, nhưng bạn vẫn xem được lời khuyên bên dưới.");
    }
  };

  const reset = () => {
    setAnswers(questions.map(() => null));
    setScore(null);
    setResult(null);
  };

  return (
    <PageShell
      title={accountType === "teacher" ? "Kiểm tra cảm xúc dành cho giáo viên" : "Kiểm tra cảm xúc dành cho học sinh"}
      description="Hãy chọn phương án đúng nhất với bạn trong hai tuần gần đây. Bài gồm 20 câu, mất khoảng 5 phút."
    >
      <Card className="mb-6 border-accent bg-accent/30">
        <CardContent className="flex gap-3 pt-6 text-sm">
          <Info className="mt-0.5 size-5 shrink-0 text-accent-foreground" />
          <p>
            <strong>Lưu ý:</strong> Đây không phải kết quả chẩn đoán y khoa. Bài kiểm tra chỉ giúp bạn tự nhìn
               lại cảm xúc của mình. Nếu bạn thấy lo lắng, hãy trao đổi với người tin cậy hoặc chuyên gia.
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
            <Card key={q.text}>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Câu {qi + 1}. {q.text}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {QUIZ_OPTIONS.map((o) => (
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
      ) : (
        <Card
          className={
            result.tone === "alert"
              ? "border-destructive/40 bg-destructive/5"
              : result.tone === "warn"
                ? "border-primary/40"
                : "border-accent"
          }
        >
          <CardHeader>
            <CardDescription>
              Điểm của bạn: {score}/{MAX_SCORE}
            </CardDescription>
            <CardTitle className="text-xl">
              {result.level} — {result.headline}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold">Mức độ theo từng nhóm</p>
              {result.categories.map((c) => (
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
              {result.advice.map((a) => (
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
      )}
    </PageShell>
  );
}
