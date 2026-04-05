import LMSLayout from "@/components/lms/LMSLayout";
import LMSHeader from "@/components/lms/LMSHeader";

export default function LMSOverviewPage() {
  return (
    <LMSLayout>
      <LMSHeader
        title="Course Overview"
        subtitle="Understand the purpose, structure, and expectations of School of Discovery."
      />

      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <p className="leading-relaxed text-slate-700">
          School of Discovery is designed to build spiritually grounded believers,
          strengthen biblical foundations, and equip students to represent Christ
          effectively in every sphere of life.
        </p>
      </div>
    </LMSLayout>
  );
}