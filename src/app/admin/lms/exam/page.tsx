"use client";

import PageHero from "@/components/PageHero";
import { useCallback, useEffect, useState } from "react";

type ExamRow = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  is_published: boolean | null;
};

type QuestionRow = {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  correct_option: string;
};

export default function AdminLMSExamPage() {
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [msg, setMsg] = useState("");

  const [examForm, setExamForm] = useState({
    title: "",
    description: "",
    duration_minutes: "60",
  });

  const [questionForm, setQuestionForm] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "A",
  });

  const loadExams = useCallback(async function loadExams() {
    const res = await fetch("/api/admin/lms/exam/list", { cache: "no-store" });
    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to load exams");
      return;
    }

    setExams(data.rows || []);
    if (!selectedExamId && data.rows?.[0]?.id) {
      setSelectedExamId(data.rows[0].id);
    }
  }, [selectedExamId]);

  async function loadQuestions(examId: string) {
    if (!examId) return;

    const res = await fetch("/api/admin/lms/exam/questions/list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ exam_id: examId }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to load questions");
      return;
    }

    setQuestions(data.rows || []);
  }

  useEffect(() => {
    async function init() {
      await loadExams();
    }

    void init();
  }, [loadExams]);

  useEffect(() => {
    if (selectedExamId) {
      void Promise.resolve().then(() => loadQuestions(selectedExamId));
    }
  }, [selectedExamId]);

  async function createExam(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    const res = await fetch("/api/admin/lms/exam/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(examForm),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to create exam");
      return;
    }

    setExamForm({ title: "", description: "", duration_minutes: "60" });
    await loadExams();
  }

  async function createQuestion(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!selectedExamId) {
      setMsg("Select an exam first.");
      return;
    }

    const res = await fetch("/api/admin/lms/exam/questions/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        exam_id: selectedExamId,
        ...questionForm,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to add question");
      return;
    }

    setQuestionForm({
      question: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "A",
    });

    await loadQuestions(selectedExamId);
  }

  async function deleteExam(id: string) {
    const ok = confirm("Delete this exam?");
    if (!ok) return;

    const res = await fetch("/api/admin/lms/exam/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      alert(data?.message || "Delete failed");
      return;
    }

    setSelectedExamId("");
    setQuestions([]);
    await loadExams();
  }

  async function togglePublishExam(id: string, isPublished: boolean) {
    const confirmed = confirm(
      isPublished
        ? "Unpublish this final exam? Students will no longer see it."
        : "Publish this final exam? Students will be able to see it."
    );

    if (!confirmed) return;

    setMsg("");

    const res = await fetch("/api/admin/lms/exam/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        is_published: !isPublished,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to update final exam status");
      return;
    }

    setMsg(
      !isPublished
        ? "Final exam published successfully. Students can now see it."
        : "Final exam unpublished successfully. It is now hidden from students."
    );
    await loadExams();
  }

  return (
    <main>
      <PageHero
        title="Admin — LMS Final Exam"
        subtitle="Create final exams and add questions for students."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12">
          {msg ? (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {msg}
            </div>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-[360px_1fr_1fr]">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900">Create Final Exam</h2>

              <form onSubmit={createExam} className="mt-5 space-y-4">
                <input
                  value={examForm.title}
                  onChange={(e) => setExamForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Exam title"
                  className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />

                <textarea
                  value={examForm.description}
                  onChange={(e) =>
                    setExamForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Exam description"
                  className="min-h-[110px] w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />

                <input
                  type="number"
                  min="1"
                  value={examForm.duration_minutes}
                  onChange={(e) =>
                    setExamForm((p) => ({ ...p, duration_minutes: e.target.value }))
                  }
                  placeholder="Duration in minutes"
                  className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />

                <button
                  type="submit"
                  className="w-full rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
                >
                  Create Final Exam
                </button>
              </form>

              <p className="mt-4 text-sm text-slate-500">
                New final exams are created as unpublished until you explicitly
                publish them.
              </p>

              <div className="mt-8">
                <h3 className="font-bold text-slate-900">Available Exams</h3>
                <div className="mt-4 space-y-3">
                  {exams.map((exam) => (
                    <div
                      key={exam.id}
                      className={`rounded-xl border p-4 ${
                        selectedExamId === exam.id ? "bg-slate-50" : "bg-white"
                      }`}
                    >
                      <button
                        onClick={() => setSelectedExamId(exam.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-slate-900">{exam.title}</p>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              exam.is_published
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {exam.is_published ? "Published" : "Draft"}
                          </span>
                        </div>
                        {exam.description ? (
                          <p className="mt-1 text-sm text-slate-600">{exam.description}</p>
                        ) : null}
                        <p className="mt-1 text-sm text-slate-500">
                          Duration: {exam.duration_minutes || 60} minutes
                        </p>
                      </button>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => togglePublishExam(exam.id, !!exam.is_published)}
                          className={`rounded-lg px-3 py-2 text-sm font-semibold text-white ${
                            exam.is_published
                              ? "bg-amber-600 hover:bg-amber-700"
                              : "bg-emerald-600 hover:bg-emerald-700"
                          }`}
                        >
                          {exam.is_published ? "Unpublish" : "Publish"}
                        </button>

                        <button
                          onClick={() => deleteExam(exam.id)}
                          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {exams.length === 0 ? (
                    <p className="text-sm text-slate-600">No exams yet.</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900">Add Question</h2>

              <form onSubmit={createQuestion} className="mt-5 space-y-4">
                <textarea
                  value={questionForm.question}
                  onChange={(e) =>
                    setQuestionForm((p) => ({ ...p, question: e.target.value }))
                  }
                  placeholder="Question"
                  className="min-h-[100px] w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />

                <input
                  value={questionForm.option_a}
                  onChange={(e) =>
                    setQuestionForm((p) => ({ ...p, option_a: e.target.value }))
                  }
                  placeholder="Option A"
                  className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />

                <input
                  value={questionForm.option_b}
                  onChange={(e) =>
                    setQuestionForm((p) => ({ ...p, option_b: e.target.value }))
                  }
                  placeholder="Option B"
                  className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />

                <input
                  value={questionForm.option_c}
                  onChange={(e) =>
                    setQuestionForm((p) => ({ ...p, option_c: e.target.value }))
                  }
                  placeholder="Option C"
                  className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />

                <input
                  value={questionForm.option_d}
                  onChange={(e) =>
                    setQuestionForm((p) => ({ ...p, option_d: e.target.value }))
                  }
                  placeholder="Option D"
                  className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />

                <select
                  value={questionForm.correct_option}
                  onChange={(e) =>
                    setQuestionForm((p) => ({
                      ...p,
                      correct_option: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                >
                  <option value="A">Correct Option: A</option>
                  <option value="B">Correct Option: B</option>
                  <option value="C">Correct Option: C</option>
                  <option value="D">Correct Option: D</option>
                </select>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
                >
                  Add Question
                </button>
              </form>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900">Questions</h2>

              {!selectedExamId ? (
                <p className="mt-4 text-slate-600">Select an exam to view questions.</p>
              ) : questions.length === 0 ? (
                <p className="mt-4 text-slate-600">No questions yet.</p>
              ) : (
                <div className="mt-5 space-y-4">
                  {questions.map((q, index) => (
                    <div key={q.id} className="rounded-xl border bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">
                        {index + 1}. {q.question}
                      </p>
                      <div className="mt-3 space-y-1 text-sm text-slate-700">
                        <p>A. {q.option_a}</p>
                        <p>B. {q.option_b}</p>
                        {q.option_c ? <p>C. {q.option_c}</p> : null}
                        {q.option_d ? <p>D. {q.option_d}</p> : null}
                      </div>
                      <p className="mt-3 text-sm font-semibold text-emerald-700">
                        Correct: {q.correct_option}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
