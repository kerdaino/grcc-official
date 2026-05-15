"use client";

export default function PrintCertificateButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white hover:bg-purple-800 print:hidden"
    >
      Download / Print Certificate
    </button>
  );
}

