"use client";

import PageHero from "@/components/PageHero";
import { useEffect, useState } from "react";

type QuizRow = {
  id: string;
  title: string;
  description: string | null;
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

export default function AdminLMSQuizPage() {
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [msg, setMsg] = useState("");

  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
  });

  const [questionForm, setQuestionForm] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "A",
  });

  async function loadQuizzes() {
    const res = await fetch("/api/admin/lms/quiz/list", { cache: "no-store" });
    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to load quizzes");
      return;
    }

    setQuizzes(data.rows || []);
    if (!selectedQuizId && data.rows?.[0]?.id) {
      setSelectedQuizId(data.rows[0].id);
    }
  }

  async function loadQuestions(quizId: string) {
    if (!quizId) return;

    const res = await fetch("/api/admin/lms/quiz/questions/list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quiz_id: quizId }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to load questions");
      return;
    }

    setQuestions(data.rows || []);
  }

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    if (selectedQuizId) loadQuestions(selectedQuizId);
  }, [selectedQuizId]);

  async function createQuiz(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    const res = await fetch("/api/admin/lms/quiz/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quizForm),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to create quiz");
      return;
    }

    setQuizForm({ title: "", description: "" });
    await loadQuizzes();
  }

  async function createQuestion(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!selectedQuizId) {
      setMsg("Select a quiz first.");
      return;
    }

    const res = await fetch("/api/admin/lms/quiz/questions/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quiz_id: selectedQuizId,
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

    await loadQuestions(selectedQuizId);
  }

  async function deleteQuiz(id: string) {
    const ok = confirm("Delete this quiz?");
    if (!ok) return;

    const res = await fetch("/api/admin/lms/quiz/delete", {
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

    setSelectedQuizId("");
    setQuestions([]);
    await loadQuizzes();
  }

  return (
    <main>
      <PageHero
        title="Admin — LMS Quiz"
        subtitle="Create quizzes and add questions for students."
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
              <h2 className="text-xl font-extrabold text-slate-900">Create Quiz</h2>

              <form onSubmit={createQuiz} className="mt-5 space-y-4">
                <input
                  value={quizForm.title}
                  onChange={(e) => setQuizForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Quiz title"
                  className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />

                <textarea
                  value={quizForm.description}
                  onChange={(e) =>
                    setQuizForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Quiz description"
                  className="min-h-[110px] w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />

                <button
                  type="submit"
                  className="w-full rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
                >
                  Create Quiz
                </button>
              </form>

              <div className="mt-8">
                <h3 className="font-bold text-slate-900">Available Quizzes</h3>
                <div className="mt-4 space-y-3">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className={`rounded-xl border p-4 ${
                        selectedQuizId === quiz.id ? "bg-slate-50" : "bg-white"
                      }`}
                    >
                      <button
                        onClick={() => setSelectedQuizId(quiz.id)}
                        className="w-full text-left"
                      >
                        <p className="font-semibold text-slate-900">{quiz.title}</p>
                        {quiz.description ? (
                          <p className="mt-1 text-sm text-slate-600">{quiz.description}</p>
                        ) : null}
                      </button>

                      <button
                        onClick={() => deleteQuiz(quiz.id)}
                        className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  ))}

                  {quizzes.length === 0 ? (
                    <p className="text-sm text-slate-600">No quizzes yet.</p>
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

              {!selectedQuizId ? (
                <p className="mt-4 text-slate-600">Select a quiz to view questions.</p>
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