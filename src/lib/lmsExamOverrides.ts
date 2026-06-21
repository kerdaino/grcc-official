import { supabaseServer } from "@/lib/supabaseServer";

export const DEFAULT_EXAM_OVERRIDE_HOURS = 72;

export function getDefaultExamOverrideExpiresAt() {
  return new Date(
    Date.now() + DEFAULT_EXAM_OVERRIDE_HOURS * 60 * 60 * 1000
  ).toISOString();
}

export async function getActiveExamOverrideForStudent(studentId: string) {
  const now = new Date().toISOString();

  return supabaseServer
    .from("sod_exam_overrides")
    .select("id, exam_id, student_id, available_until")
    .eq("student_id", studentId)
    .gt("available_until", now)
    .order("available_until", { ascending: false })
    .limit(1)
    .maybeSingle<{
      id: string;
      exam_id: string;
      student_id: string;
      available_until: string;
    }>();
}

export async function hasActiveExamOverride(studentId: string, examId: string) {
  const now = new Date().toISOString();

  const { data, error } = await supabaseServer
    .from("sod_exam_overrides")
    .select("id")
    .eq("student_id", studentId)
    .eq("exam_id", examId)
    .gt("available_until", now)
    .maybeSingle<{ id: string }>();

  if (error) {
    return { allowed: false, error };
  }

  return { allowed: !!data, error: null };
}
