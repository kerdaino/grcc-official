"use client";

import { useEffect, useState } from "react";
import LMSLayout from "@/components/lms/LMSLayout";
import LMSHeader from "@/components/lms/LMSHeader";

type Exam = {
  id: string;
  title: string;
  description: string | null;
};

type Question = {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
};

export default function LMSExamPage() {
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/lms/exam/current", {
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setMsg(data?.message || "Failed to load final exam");
        setLoading(false);
        return;
      }

      setExam(data.exam || null);
      setQuestions(data.questions || []);
      setLoading(false);
    }

    load();
  }, []);

  async function submitExam(e: React.FormEvent) {
    e.preventDefault();
    if (!exam) return;

    setSubmitting(true);
    setMsg("");

    const res = await fetch("/api/lms/exam/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        exam_id: exam.id,
        answers,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to submit final exam");
      setSubmitting(false);
      return;
    }

    setResult({
      score: data.score,
      total: data.total,
    });
    setSubmitting(false);
  }

  return (
    <LMSLayout>
      <LMSHeader
        title="Final Exam"
        subtitle="Complete your final course assessment here."
      />

      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-slate-600">Loading final exam...</p>
        ) : msg ? (
          <p className="text-red-700">{msg}</p>
        ) : !exam ? (
          <p className="text-slate-600">No final exam has been published yet.</p>
        ) : result ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
            <h2 className="text-2xl font-extrabold text-slate-900">Final Exam Submitted ✅</h2>
            <p className="mt-3 text-slate-700">
              Your score: <strong>{result.score}</strong> / {result.total}
            </p>
          </div>
        ) : (
          <form onSubmit={submitExam} className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">{exam.title}</h2>
              {exam.description ? (
                <p className="mt-2 text-slate-600">{exam.description}</p>
              ) : null}
            </div>

            {questions.map((q, index) => (
              <div key={q.id} className="rounded-xl border bg-slate-50 p-5">
                <p className="font-semibold text-slate-900">
                  {index + 1}. {q.question}
                </p>

                <div className="mt-4 space-y-3 text-slate-700">
                   {(
  [
    { letter: "A", value: q.option_a },
    { letter: "B", value: q.option_b },
    { letter: "C", value: q.option_c },
    { letter: "D", value: q.option_d },
  ] as { letter: "A" | "B" | "C" | "D"; value: string | null }[]
)
  .filter(
    (option): option is { letter: "A" | "B" | "C" | "D"; value: string } =>
      !!option.value
  )
  .map((option) => (
    <label key={option.letter} className="flex items-start gap-3">
      <input
        type="radio"
        name={q.id}
        value={option.letter}
        checked={answers[q.id] === option.letter}
        onChange={(e) =>
          setAnswers((prev) => ({
            ...prev,
            [q.id]: e.target.value,
          }))
        }
      />
      <span>
        <strong>{option.letter}.</strong> {option.value}
      </span>
    </label>
  ))}
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Final Exam"}
            </button>
          </form>
        )}
      </div>
    </LMSLayout>
  );
}