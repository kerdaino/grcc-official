"use client";

import PageHero from "@/components/PageHero";
import { useEffect, useState } from "react";

type ToastType = "success" | "error";

const FORM_OPEN = false;

function Toast({
  open,
  type,
  message,
  onClose,
}: {
  open: boolean;
  type: ToastType;
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose(), 4500);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-[9999] flex justify-center px-4">
      <div
        className={`w-full max-w-xl rounded-xl border bg-white/95 p-4 shadow-lg backdrop-blur ${
          type === "success" ? "border-emerald-200" : "border-red-200"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              type === "success"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {type === "success" ? "✓" : "!"}
          </div>

          <div className="flex-1">
            <p className="font-semibold text-slate-900">
              {type === "success" ? "Submitted successfully" : "Submission failed"}
            </p>
            <p className="mt-1 text-sm text-slate-700">{message}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SchoolOfDiscoveryPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<ToastType>("success");
  const [toastMsg, setToastMsg] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    addressOrCountry: "",
    dateOfBirth: "",
    salvationExperience: "",
    churchAttending: "",
    hasSpiritualCovering: "",
    isWorker: "",
    expectation: "",
    attendedBibleSchoolBefore: "",
    bibleSchoolName: "",
    discipleshipInfo: "",
    email: "",
  });

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function showToast(type: ToastType, msg: string) {
    setToastType(type);
    setToastMsg(msg);
    setToastOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || !FORM_OPEN) return;

    setError("");
    setSubmitted(false);

    if (
      !form.fullName ||
      !form.email ||
      !form.addressOrCountry ||
      !form.dateOfBirth ||
      !form.salvationExperience ||
      !form.churchAttending ||
      !form.hasSpiritualCovering ||
      !form.isWorker ||
      !form.expectation ||
      !form.attendedBibleSchoolBefore ||
      !form.discipleshipInfo
    ) {
      const msg = "Please complete all fields before submitting the form.";
      setError(msg);
      showToast("error", msg);
      return;
    }

    if (
      form.attendedBibleSchoolBefore === "Yes" &&
      !form.bibleSchoolName.trim()
    ) {
      const msg =
        "Please enter the name of the Bible/Theology school you attended.";
      setError(msg);
      showToast("error", msg);
      return;
    }

    setLoading(true);

    const payload = {
      name: form.fullName.trim(),
      address: form.addressOrCountry.trim(),
      date_of_birth: form.dateOfBirth,
      salvation_experience: form.salvationExperience.trim(),
      church_attending: form.churchAttending.trim(),
      spiritual_covering: form.hasSpiritualCovering,
      is_worker: form.isWorker,
      expectation: form.expectation.trim(),
      attended_bible_school: form.attendedBibleSchoolBefore,
      bible_school_name:
        form.attendedBibleSchoolBefore === "Yes"
          ? form.bibleSchoolName.trim()
          : "",
      disciple_of: form.discipleshipInfo.trim(),
      email: form.email.trim(),
    };

    try {
      const res = await fetch("/api/school-of-discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        const msg = data?.message || "Submission failed. Please try again.";
        setError(msg);
        showToast("error", msg);
        setLoading(false);
        return;
      }

      setSubmitted(true);
      showToast(
        "success",
        "Your application was received. Please check your email for confirmation."
      );

      setForm({
        fullName: "",
        addressOrCountry: "",
        dateOfBirth: "",
        salvationExperience: "",
        churchAttending: "",
        hasSpiritualCovering: "",
        isWorker: "",
        expectation: "",
        attendedBibleSchoolBefore: "",
        bibleSchoolName: "",
        discipleshipInfo: "",
        email: "",
      });
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setError(msg);
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <Toast
        open={toastOpen}
        type={toastType}
        message={toastMsg}
        onClose={() => setToastOpen(false)}
      />

      <PageHero
        title="School of Discovery"
        subtitle={
          FORM_OPEN
            ? "Registration has been temporarily reopened for a short period for late applicants."
            : "Registration for this cohort is now closed. Stay connected for the next intake."
        }
        image="/images/sod.jpeg"
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 pt-10">
          <div className="relative overflow-hidden rounded-2xl border">
            <div
              className="h-44 bg-cover bg-center md:h-56"
              style={{ backgroundImage: "url(/images/school-of-discovery.jpg)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
            <div className="absolute inset-0 flex items-end p-6 md:p-8">
              <div className="max-w-2xl text-white">
                <p className="text-sm text-white/90 md:text-base">
                  School of Discovery
                </p>
                <h2 className="mt-1 text-xl font-extrabold md:text-2xl">
                  Application & Registration
                </h2>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border bg-white">
            <div
              className="h-56 bg-cover bg-center md:h-[320px]"
              style={{ backgroundImage: "url(/images/school-of-discovery.jpg)" }}
            />
            <div className="bg-slate-50 p-8">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Registration Information
              </h2>

              <ul className="mt-6 space-y-3 text-slate-700">
                {FORM_OPEN ? (
                  <>
                    <li className="flex gap-3">
                      <span className="mt-1 text-teal-600">
                        <i className="fa-solid fa-circle-check" />
                      </span>
                      Registration has been temporarily reopened for late applicants.
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 text-teal-600">
                        <i className="fa-solid fa-circle-check" />
                      </span>
                      Please complete the form accurately before submission.
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 text-teal-600">
                        <i className="fa-solid fa-circle-check" />
                      </span>
                      You will receive your admission update by email after review.
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex gap-3">
                      <span className="mt-1 text-teal-600">
                        <i className="fa-solid fa-circle-check" />
                      </span>
                      Applications for this cohort have now closed.
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 text-teal-600">
                        <i className="fa-solid fa-circle-check" />
                      </span>
                      Submitted applications are currently under review.
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 text-teal-600">
                        <i className="fa-solid fa-circle-check" />
                      </span>
                      Admitted applicants will receive further instructions by email.
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            {FORM_OPEN ? (
              <>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Register Now
                </h3>

                {error ? (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                  </div>
                ) : null}

                {submitted ? (
                  <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
                    ✅ Your application has been submitted successfully.
                    <p className="mt-2 text-sm text-emerald-900/90">
                      Please check your email for confirmation. Our team will
                      review your application and notify you of your admission
                      status.
                    </p>
                  </div>
                ) : null}

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900">
                      Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      value={form.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      className="mt-2 w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                      placeholder="Full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900">
                      Email Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="mt-2 w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                      placeholder="Email Address"
                      type="email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900">
                      Address or Country <span className="text-red-600">*</span>
                    </label>
                    <input
                      value={form.addressOrCountry}
                      onChange={(e) => updateField("addressOrCountry", e.target.value)}
                      className="mt-2 w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                      placeholder="Your address or country"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900">
                      Date of Birth <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => updateField("dateOfBirth", e.target.value)}
                      className="mt-2 w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900">
                      Salvation Experience <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={form.salvationExperience}
                      onChange={(e) => updateField("salvationExperience", e.target.value)}
                      className="mt-2 min-h-[110px] w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                      placeholder="Briefly share your salvation experience..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900">
                      Church Attending <span className="text-red-600">*</span>
                    </label>
                    <input
                      value={form.churchAttending}
                      onChange={(e) => updateField("churchAttending", e.target.value)}
                      className="mt-2 w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                      placeholder="Name of your church"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900">
                      Do you have spiritual covering? <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={form.hasSpiritualCovering}
                      onChange={(e) => updateField("hasSpiritualCovering", e.target.value)}
                      className="mt-2 w-full rounded-lg border bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900">
                      Are you a worker in your place of worship? <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={form.isWorker}
                      onChange={(e) => updateField("isWorker", e.target.value)}
                      className="mt-2 w-full rounded-lg border bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900">
                      What is your expectation? <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={form.expectation}
                      onChange={(e) => updateField("expectation", e.target.value)}
                      className="mt-2 min-h-[110px] w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                      placeholder="What do you expect from School of Discovery?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900">
                      Have you attended any theological, bible, or discipleship school before?{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={form.attendedBibleSchoolBefore}
                      onChange={(e) => {
                        updateField("attendedBibleSchoolBefore", e.target.value);
                        if (e.target.value !== "Yes") updateField("bibleSchoolName", "");
                      }}
                      className="mt-2 w-full rounded-lg border bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {form.attendedBibleSchoolBefore === "Yes" ? (
                    <div>
                      <label className="block text-sm font-semibold text-slate-900">
                        Name of the School Attended <span className="text-red-600">*</span>
                      </label>
                      <input
                        value={form.bibleSchoolName}
                        onChange={(e) => updateField("bibleSchoolName", e.target.value)}
                        className="mt-2 w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                        placeholder="e.g., GRCC Discipleship School"
                      />
                    </div>
                  ) : null}

                  <div>
                    <label className="block text-sm font-semibold text-slate-900">
                      Who is a disciple? <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={form.discipleshipInfo}
                      onChange={(e) => updateField("discipleshipInfo", e.target.value)}
                      className="mt-2 min-h-[110px] w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                      placeholder="In your understanding, who is a disciple?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
                  >
                    {loading ? "Submitting..." : "Submit Registration"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Registration Closed
                </h3>

                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <i className="fa-solid fa-lock text-xl" />
                  </div>

                  <h4 className="mt-4 text-xl font-extrabold text-slate-900">
                    This Cohort Is Closed
                  </h4>

                  <p className="mt-3 leading-relaxed text-slate-700">
                    Registration for the current School of Discovery cohort has now
                    closed. We appreciate your interest and encourage you to stay
                    connected for the next intake.
                  </p>

                  <p className="mt-4 text-sm text-slate-600">
                    If you already submitted your application, kindly check your
                    email for your admission update.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}