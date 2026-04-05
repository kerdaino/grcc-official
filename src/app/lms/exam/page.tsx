import LMSLayout from "@/components/lms/LMSLayout";
import LMSHeader from "@/components/lms/LMSHeader";

export default function LMSExamPage() {
  return (
    <LMSLayout>
      <LMSHeader
        title="Final Exam"
        subtitle="Complete your final course assessment here."
      />

      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-slate-700">Final exam section will appear here.</p>
      </div>
    </LMSLayout>
  );
}