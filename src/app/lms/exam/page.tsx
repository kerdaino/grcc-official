"use client";

import { useCallback, useEffect, useState } from "react";
import LMSLayout from "@/components/lms/LMSLayout";
import LMSHeader from "@/components/lms/LMSHeader";

type Exam = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
};

type SubmissionState = {
  started_at: string | null;
  submitted_at: string | null;
  score: number | null;
  total: number | null;
  malpractice_flags?: number | null;
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
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submission, setSubmission] = useState<SubmissionState | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [malpracticeFlags, setMalpracticeFlags] = useState(0);
  const [malpracticeWarning, setMalpracticeWarning] = useState("");

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
      setSubmission(data.submission || null);
      setAlreadySubmitted(!!data.already_submitted);
      setMalpracticeFlags(Math.max(0, Number(data.submission?.malpractice_flags) || 0));

      if (data.submission?.submitted_at) {
        setResult({
          score: data.submission.score || 0,
          total: data.submission.total || (data.questions || []).length,
        });
      } else {
        setResult(null);
      }

      if (!data.submission?.submitted_at && data.submission?.started_at && data.exam) {
        const durationMinutes =
          typeof data.exam.duration_minutes === "number" && data.exam.duration_minutes > 0
            ? data.exam.duration_minutes
            : 60;
        const startedAt = new Date(data.submission.started_at).getTime();
        const deadline = startedAt + durationMinutes * 60 * 1000;
        setTimeLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
      } else {
        setTimeLeft(null);
      }

      setLoading(false);
    }

    load();
  }, []);

  const submitExam = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
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
        malpractice_flags: malpracticeFlags,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      if (data?.already_submitted) {
        setAlreadySubmitted(true);
        setSubmission((prev) => ({
          started_at: prev?.started_at || null,
          submitted_at: new Date().toISOString(),
          score: data.score || 0,
          total: data.total || questions.length,
          malpractice_flags: data.malpractice_flags || malpracticeFlags,
        }));
        setResult({
          score: data.score || 0,
          total: data.total || questions.length,
        });
      } else {
        setMsg(data?.message || "Failed to submit final exam");
      }
      setSubmitting(false);
      return;
    }

    setResult({
      score: data.score,
      total: data.total,
    });
    setAlreadySubmitted(true);
    setSubmission((prev) => ({
      started_at: prev?.started_at || null,
      submitted_at: data.submitted_at || new Date().toISOString(),
      score: data.score,
      total: data.total,
      malpractice_flags: data.malpractice_flags || malpracticeFlags,
    }));
    setTimeLeft(null);
    setSubmitting(false);
  }, [answers, exam, malpracticeFlags, questions.length]);

  const persistMalpracticeFlags = useCallback(
    async (count: number) => {
      if (!exam) return;

      await fetch("/api/lms/exam/malpractice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exam_id: exam.id,
          malpractice_flags: count,
        }),
        keepalive: true,
      }).catch(() => null);
    },
    [exam]
  );

  useEffect(() => {
    if (!exam || alreadySubmitted || !submission?.started_at) return;

    const durationMinutes =
      typeof exam.duration_minutes === "number" && exam.duration_minutes > 0
        ? exam.duration_minutes
        : 60;
    const startedAt = new Date(submission.started_at).getTime();

    if (Number.isNaN(startedAt)) {
      const timeout = window.setTimeout(() => {
        setTimeLeft(null);
      }, 0);

      return () => window.clearTimeout(timeout);
    }

    const deadline = startedAt + durationMinutes * 60 * 1000;

    const updateTimeLeft = () => {
      setTimeLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    };

    updateTimeLeft();

    const timer = window.setInterval(updateTimeLeft, 1000);

    return () => window.clearInterval(timer);
  }, [exam, alreadySubmitted, submission?.started_at]);

  useEffect(() => {
    if (!exam || alreadySubmitted || !submission?.started_at || timeLeft !== 0 || submitting) return;

    const timeout = window.setTimeout(() => {
      void submitExam();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [exam, alreadySubmitted, submission?.started_at, timeLeft, submitting, submitExam]);

  useEffect(() => {
    if (!exam || alreadySubmitted || !submission?.started_at) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [exam, alreadySubmitted, submission?.started_at]);

  useEffect(() => {
    if (!exam || alreadySubmitted || !submission?.started_at) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) return;

      setMalpracticeFlags((prev) => {
        const next = prev + 1;

        setMalpracticeWarning(
          next >= 3
            ? "Final warning: repeated tab switching was detected. Your final exam is being submitted now."
            : next === 2
              ? "Final warning: this is your second tab switch. One more tab switch will auto-submit your final exam."
              : "Warning: tab switching was detected. This has been recorded. A third tab switch will auto-submit your final exam."
        );

        void persistMalpracticeFlags(next);

        if (next >= 3) {
          window.setTimeout(() => {
            void submitExam();
          }, 0);
        }

        return next;
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [exam, alreadySubmitted, submission?.started_at, persistMalpracticeFlags, submitExam]);

  const minutes = timeLeft !== null ? Math.floor(timeLeft / 60) : null;
  const seconds = timeLeft !== null ? timeLeft % 60 : null;

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
        ) : alreadySubmitted && result ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
            <h2 className="text-2xl font-extrabold text-slate-900">Final Exam Already Completed</h2>
            <p className="mt-3 text-slate-700">
              Your score: <strong>{result.score}</strong> / {result.total}
            </p>
            <p className="mt-2 text-slate-600">This final exam has already been submitted and cannot be retaken.</p>
          </div>
        ) : result ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
            <h2 className="text-2xl font-extrabold text-slate-900">Final Exam Submitted ✅</h2>
            <p className="mt-3 text-slate-700">
              Your score: <strong>{result.score}</strong> / {result.total}
            </p>
            <p className="mt-2 text-slate-600">This final exam is now closed for your account.</p>
          </div>
        ) : (
          <form onSubmit={submitExam} className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">{exam.title}</h2>
              {exam.description ? (
                <p className="mt-2 text-slate-600">{exam.description}</p>
              ) : null}
              <p className="mt-3 text-sm font-semibold text-slate-700">
                Time allowed: {exam.duration_minutes || 60} minutes
                {minutes !== null && seconds !== null
                  ? ` • Time left: ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
                  : ""}
              </p>
              <p className="mt-2 text-sm font-semibold text-amber-700">
                Do not leave this tab. Hidden-tab events are recorded, and the third tab switch will auto-submit this final exam.
              </p>
              {malpracticeWarning ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  {malpracticeWarning}
                </div>
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
