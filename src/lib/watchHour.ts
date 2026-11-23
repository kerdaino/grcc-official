export const WATCH_HOUR_TABLE = "grcc_watch_hour_registrations";
export const EVENT_NAME = "GRCC December Watch-Hour Camp Meeting 2026";
export const EVENT_DATES = "1–21 December 2026";
export const VENUE = "266, Balogun Bus Stop, Along Ope-Ilu Road, Agbado, Ogun State, Nigeria.";
export const SESSION_TIMES = ["12:00 AM – 6:00 AM WAT", "12:00 PM – 6:00 PM WAT"];
export const ARRIVAL = "Arrival is 1 December at 12:00 PM WAT.";
export const FIRST_MIDNIGHT_NOTICE = "GRCC will confirm the date of the first midnight session.";
export const ONLINE_NOTICE = "Online access details will be shared through official GRCC channels when available.";
export const WELFARE_NOTICE = "Your request has been received and is awaiting confirmation. Please do not interpret registration as guaranteed sleeping-space allocation.";
export const LODGING_NOTICE = "Church accommodation will be basic, shared camp-style lodging, subject to available space and confirmation by the Welfare Team. It does not automatically include private rooms, bedding, meals, or transport. Please prepare your personal essentials. Our team will communicate confirmed arrangements before your arrival.";
export const DAYS = Array.from({ length: 21 }, (_, index) => `2026-12-${String(index + 1).padStart(2, "0")}`);
export const MODES = { physical: "Physical", online: "Online", both: "Both physical and online" };
export const DURATIONS = { entire: "Entire camp", selected: "Selected days", uncertain: "Not yet certain" };
export const LODGING = {
  church: "I would like basic church accommodation",
  hotel: "I will arrange my own hotel/guesthouse",
  commute: "I will commute from home",
  undecided: "Not yet decided",
};
export const LODGING_STATUS = { pending: "Awaiting confirmation", confirmed: "Confirmed", declined: "Unable to accommodate" };
export const WELFARE_STATUS = { pending: "Needs follow-up", contacted: "Contacted", resolved: "Resolved", none: "No follow-up requested" };
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function hasOption<T extends object>(options: T, value: unknown): value is keyof T {
  return typeof value === "string" && Object.hasOwn(options, value);
}

function integer(value: unknown) {
  return typeof value === "number" ? value :
    typeof value === "string" && /^\d+$/.test(value) ? Number(value) : NaN;
}

export function validateWatchHour(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { error: "Enter valid registration details." } as const;
  const fields = input as Record<string, unknown>;

  function field(name: string, max: number) {
    const value = fields[name];
    if (value == null) return "";
    if (typeof value !== "string" || value.length > max || [...value].some((character) => {
      const code = character.charCodeAt(0);
      return code < 32 && code !== 9 && code !== 10 && code !== 13 || code === 127;
    })) return null;
    return value.trim();
  }

  const fullName = field("full_name", 120);
  const phone = field("phone", 30);
  const email = field("email", 160);
  const location = field("location", 160);
  const mode = fields.attendance_mode;
  const duration = fields.attendance_duration;
  const party = integer(fields.party_size);
  const key = fields.idempotency_key;
  if (!fullName || fullName.length < 2) return { error: "Enter your full name (2–120 characters)." } as const;
  if (!phone || !/^\+?[\d ()-]+$/.test(phone) || !/^\+?\d{7,15}$/.test(phone.replace(/[ ()-]/g, ""))) {
    return { error: "Enter a valid WhatsApp or phone number with 7–15 digits." } as const;
  }
  if (email === null || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return { error: "Enter a valid email address." } as const;
  if (!location || location.length < 2) return { error: "Enter your city, state and country of residence." } as const;
  if (!hasOption(MODES, mode) || !hasOption(DURATIONS, duration)) return { error: "Choose your attendance mode and duration." } as const;
  if (!Number.isInteger(party) || party < 1 || party > 100) return { error: "Enter a whole party size between 1 and 100." } as const;
  if (typeof key !== "string" || !UUID.test(key)) return { error: "Refresh the page and try again." } as const;
  if (fields.communication_consent !== true) return { error: "Consent to event updates is required." } as const;

  const selected = fields.attendance_dates;
  if (duration === "selected" && (!Array.isArray(selected) || !selected.length ||
      selected.length > DAYS.length || selected.some((date) => !DAYS.includes(date)))) {
    return { error: "Select at least one camp date between 1 and 21 December." } as const;
  }
  const attendanceDates = duration === "entire" ? DAYS :
    duration === "selected" && Array.isArray(selected) ? DAYS.filter((date) => selected.includes(date)) : [];
  const physical = mode === "both" ? integer(fields.physical_count) : mode === "physical" ? party : 0;
  const online = mode === "both" ? integer(fields.online_count) : mode === "online" ? party : 0;
  if (mode === "both" && (![physical, online].every((count) => Number.isInteger(count) && count >= 1 && count <= party) ||
      physical + online < party)) {
    return { error: "Enter physical and online counts within the party size that cover everyone in your group." } as const;
  }

  const preference = mode === "online" ? null : fields.accommodation_preference;
  const travel = mode === "online" ? false : fields.needs_travel_guidance;
  const arrivalInfo = mode === "online" ? "" : field("arrival_info", 300);
  const accessibility = mode === "online" ? "" : field("accessibility_request", 300);
  if (mode !== "online" && !hasOption(LODGING, preference)) return { error: "Choose your accommodation preference." } as const;
  if (typeof travel !== "boolean") return { error: "Indicate whether you need travel guidance." } as const;
  if (arrivalInfo === null || accessibility === null) return { error: "Keep logistical notes within 300 characters each." } as const;

  const church = preference === "church";
  const arrival = church ? field("accommodation_arrival", 10) : null;
  const departure = church ? field("accommodation_departure", 10) : null;
  const people = church ? integer(fields.accommodation_people) : null;
  const men = church ? integer(fields.accommodation_men) : 0;
  const women = church ? integer(fields.accommodation_women) : 0;
  const family = church ? integer(fields.accommodation_family) : 0;
  if (church && (!arrival || !departure || !DAYS.includes(arrival) || !DAYS.includes(departure) || arrival >= departure)) {
    return { error: "Choose camp lodging dates with departure after arrival, within 1–21 December." } as const;
  }
  if (church && (people === null || !Number.isInteger(people) || people < 1 || people > physical ||
      ![men, women, family].every((count) => Number.isInteger(count) && count >= 0 && count <= people) ||
      men + women + family !== people)) {
    return { error: "Lodging must be within the physical attendance count. The grouping counts must add up to the lodging total." } as const;
  }

  return {
    value: {
      idempotency_key: key.toLowerCase(),
      full_name: fullName, phone, email: email || null, location,
      attendance_mode: mode, attendance_duration: duration, attendance_dates: attendanceDates,
      party_size: party, physical_count: physical, online_count: online,
      accommodation_preference: hasOption(LODGING, preference) ? preference : null,
      accommodation_arrival: arrival, accommodation_departure: departure,
      accommodation_people: people, accommodation_men: men, accommodation_women: women, accommodation_family: family,
      accessibility_request: accessibility || null, needs_travel_guidance: travel, arrival_info: arrivalInfo || null,
      communication_consent: true as const,
    },
  } as const;
}

type RegistrationInput = NonNullable<ReturnType<typeof validateWatchHour>["value"]>;
export type WatchHourRegistration = Omit<RegistrationInput, "idempotency_key"> & {
  id: string;
  registration_reference: string;
  accommodation_status: keyof typeof LODGING_STATUS | null;
  welfare_status: keyof typeof WELFARE_STATUS;
  created_at: string;
  updated_at: string;
};

export function summarizeWatchHour(rows: WatchHourRegistration[]) {
  const church = rows.filter((row) => row.accommodation_preference === "church");
  return {
    totals: {
      "Total registrations": rows.length,
      "Expected unique participants": rows.reduce((sum, row) => sum + row.party_size, 0),
      "Physical attendees": rows.reduce((sum, row) => sum + row.physical_count, 0),
      "Online attendees": rows.reduce((sum, row) => sum + row.online_count, 0),
      "Hybrid registrations": rows.filter((row) => row.attendance_mode === "both").length,
      "Church accommodation requests": church.length,
      "Total persons needing sleeping space": church.reduce((sum, row) => sum + (row.accommodation_people ?? 0), 0),
      "Hotel/self-arranged registrations": rows.filter((row) => row.accommodation_preference === "hotel").length,
      "Transportation guidance requests": rows.filter((row) => row.needs_travel_guidance).length,
    },
    uncertain: rows.filter((row) => row.attendance_duration === "uncertain").reduce((sum, row) => sum + row.party_size, 0),
    daily: DAYS.map((date) => {
      const attending = rows.filter((row) => row.attendance_dates.includes(date));
      const overnight = church.filter((row) => row.accommodation_arrival && row.accommodation_departure &&
        row.accommodation_arrival <= date && date < row.accommodation_departure);
      return {
        date,
        unique: attending.reduce((sum, row) => sum + row.party_size, 0),
        physical: attending.reduce((sum, row) => sum + row.physical_count, 0),
        online: attending.reduce((sum, row) => sum + row.online_count, 0),
        pending: overnight.filter((row) => row.accommodation_status === "pending").reduce((sum, row) => sum + (row.accommodation_people ?? 0), 0),
        confirmed: overnight.filter((row) => row.accommodation_status === "confirmed").reduce((sum, row) => sum + (row.accommodation_people ?? 0), 0),
      };
    }),
  };
}

export function filterWatchHour(rows: WatchHourRegistration[], filters: URLSearchParams) {
  const query = filters.get("q")?.trim().toLowerCase() ?? "";
  const mode = filters.get("mode");
  const date = filters.get("date");
  const accommodation = filters.get("accommodation");
  const followUp = filters.get("followUp");
  return rows.filter((row) =>
    (!query || [row.full_name, row.phone, row.email, row.registration_reference, row.location].some((value) => value?.toLowerCase().includes(query))) &&
    (!mode || row.attendance_mode === mode) &&
    (!date || row.attendance_dates.includes(date)) &&
    (!accommodation || (row.accommodation_preference ?? "none") === accommodation) &&
    (!followUp || row.welfare_status === followUp));
}

const CSV_COLUMNS: (keyof WatchHourRegistration)[] = [
  "registration_reference", "full_name", "phone", "email", "location", "attendance_mode", "attendance_duration",
  "attendance_dates", "party_size", "physical_count", "online_count", "accommodation_preference",
  "accommodation_arrival", "accommodation_departure", "accommodation_people", "accommodation_men",
  "accommodation_women", "accommodation_family", "accommodation_status", "accessibility_request",
  "needs_travel_guidance", "arrival_info", "welfare_status", "communication_consent", "created_at", "updated_at",
];

export function watchHourCsv(rows: WatchHourRegistration[]) {
  const cell = (value: unknown) => {
    const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
    const safe = /^[\s\uFEFF]*[=+\-@＝＋－＠]|^[\t\r\n]/u.test(text) ? `'${text}` : text;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  return [CSV_COLUMNS.map(cell).join(","), ...rows.map((row) => CSV_COLUMNS.map((key) => cell(row[key])).join(","))].join("\r\n");
}
