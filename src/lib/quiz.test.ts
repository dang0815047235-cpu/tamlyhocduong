import { describe, expect, it } from "vitest";
import {
  DASS_MAX_SCORE,
  DASS_QUESTIONS,
  evaluateDASS,
  evaluateQuiz,
  QUIZ_QUESTIONS,
  TEACHER_QUIZ_QUESTIONS,
} from "./quiz";

describe("DASS-21", () => {
  it("có đúng 21 câu, mỗi thang 7 câu", () => {
    expect(DASS_QUESTIONS).toHaveLength(21);
    const counts = { depression: 0, anxiety: 0, stress: 0 };
    for (const q of DASS_QUESTIONS) counts[q.subscale] += 1;
    expect(counts).toEqual({ depression: 7, anxiety: 7, stress: 7 });
  });

  it("trả lời 0 hết cho mức Ổn định, không khủng hoảng", () => {
    const r = evaluateDASS(DASS_QUESTIONS.map(() => 0));
    expect(r.level).toBe("Ổn định");
    expect(r.tone).toBe("good");
    expect(r.crisis).toBe(false);
    expect(r.subscales).toHaveLength(3);
    for (const s of r.subscales) expect(s.score).toBe(0);
  });

  it("nhân đôi điểm mỗi thang theo chuẩn DASS-21", () => {
    // Câu 3, 5, 10, 13, 16, 17, 21 thuộc thang Trầm cảm.
    const answers = DASS_QUESTIONS.map((q) => (q.subscale === "depression" ? 2 : 0));
    const r = evaluateDASS(answers);
    const dep = r.subscales.find((s) => s.key === "depression");
    expect(dep?.score).toBe(28); // 7 câu × 2 điểm × 2 (nhân đôi) = 28
    expect(dep?.level).toBe("Rất nặng");
    expect(r.crisis).toBe(true);
  });

  it("điểm 12 trầm cảm (nhân đôi 24) là mức Nặng theo bảng chuẩn", () => {
    // 6 câu đầu thang trầm cảm được 2 điểm, câu cuối 0: tổng 12, nhân đôi = 24
    const depIdx = DASS_QUESTIONS.map((q, i) => (q.subscale === "depression" ? i : -1)).filter(
      (i) => i >= 0,
    );
    const answers = DASS_QUESTIONS.map(() => 0);
    depIdx.forEach((i, k) => {
      answers[i] = k === 6 ? 0 : 2;
    });
    const r = evaluateDASS(answers);
    const dep = r.subscales.find((s) => s.key === "depression");
    expect(dep?.score).toBe(24);
    expect(dep?.level).toBe("Nặng");
  });

  it("điểm tối đa 126 (tổng ba thang, mỗi thang tối đa 42)", () => {
    const r = evaluateDASS(DASS_QUESTIONS.map(() => 3));
    expect(r.subscales.reduce((s, x) => s + x.score, 0)).toBe(DASS_MAX_SCORE);
    expect(r.total).toBe(DASS_MAX_SCORE);
    expect(r.level).toBe("Nên tìm hỗ trợ");
  });
});

describe("Bài 20 câu hiện tại", () => {
  it("giữ nguyên 20 câu cho học sinh và giáo viên", () => {
    expect(QUIZ_QUESTIONS).toHaveLength(20);
    expect(TEACHER_QUIZ_QUESTIONS).toHaveLength(20);
  });

  it("câu an toàn được đánh dấu khi có ý làm hại bản thân", () => {
    const answers = QUIZ_QUESTIONS.map(() => 0);
    const safetyIdx = QUIZ_QUESTIONS.findIndex((q) => q.safety);
    answers[safetyIdx] = 1;
    const r = evaluateQuiz(answers);
    expect(r.safetyFlag).toBe(true);
  });
});
