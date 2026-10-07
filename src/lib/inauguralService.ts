export const INAUGURAL_SESSIONS = [
  "Thursday — Pre-Conference",
  "Friday",
  "Saturday",
  "Sunday",
  "All Sessions",
] as const;

export const ACCOMMODATION_NIGHTS = ["Thursday", "Friday", "Saturday"] as const;

export const TRANSPORT_MODES = [
  "Private car",
  "Public transport",
  "Ride-hailing service",
  "Church/group bus",
  "Not yet decided",
] as const;

export type InauguralSession = (typeof INAUGURAL_SESSIONS)[number];
export type AccommodationNight = (typeof ACCOMMODATION_NIGHTS)[number];
export type TransportMode = (typeof TRANSPORT_MODES)[number];

export type InauguralRegistration = {
  id: string;
  registration_reference: string;
  full_name: string;
  phone: string;
  email: string | null;
  location: string;
  church_ministry: string | null;
  expected_sessions: InauguralSession[];
  party_size: number;
  needs_accommodation: boolean;
  accommodation_nights: AccommodationNight[];
  accommodation_people: number | null;
  needs_travel_guidance: boolean;
  transport_mode: TransportMode | null;
  referral_source: string | null;
  communication_consent: boolean;
  created_at: string;
};

export type ValidatedRegistration = Omit<
  InauguralRegistration,
  "id" | "registration_reference" | "created_at"
> & { idempotency_key: string };

export type InauguralRegistrationFilters = {
  query?: string;
  session?: string;
  accommodation?: "" | "true" | "false";
  travel?: "" | "true" | "false";
};

export function registrationIncludesSession(row: InauguralRegistration, session: string) {
  return row.expected_sessions.includes("All Sessions") ||
    row.expected_sessions.some((value) => value === session);
}

export function summarizeInauguralRegistrations(rows: InauguralRegistration[]) {
  const attendance = (session: string) => rows
    .filter((row) => registrationIncludesSession(row, session))
    .reduce((sum, row) => sum + row.party_size, 0);

  return {
    registrations: rows.length,
    people: rows.reduce((sum, row) => sum + row.party_size, 0),
    thursday: attendance("Thursday — Pre-Conference"),
    friday: attendance("Friday"),
    saturday: attendance("Saturday"),
    sunday: attendance("Sunday"),
    accommodation: rows.filter((row) => row.needs_accommodation).length,
    accommodationPeople: rows.reduce((sum, row) => sum + (row.accommodation_people ?? 0), 0),
    travel: rows.filter((row) => row.needs_travel_guidance).length,
  };
}

export function filterInauguralRegistrations(
  rows: InauguralRegistration[],
  filters: InauguralRegistrationFilters
) {
  const needle = filters.query?.trim().toLowerCase() ?? "";
  return rows.filter((row) => {
    const matchesQuery = !needle || row.full_name.toLowerCase().includes(needle) ||
      row.phone.toLowerCase().includes(needle) ||
      row.registration_reference.toLowerCase().includes(needle);
    const matchesSession = !filters.session || registrationIncludesSession(row, filters.session);
    const matchesAccommodation = !filters.accommodation ||
      String(row.needs_accommodation) === filters.accommodation;
    const matchesTravel = !filters.travel || String(row.needs_travel_guidance) === filters.travel;
    return matchesQuery && matchesSession && matchesAccommodation && matchesTravel;
  });
}

function csvCell(value: unknown) {
  const valueText = Array.isArray(value) ? value.join("; ") : value == null ? "" : String(value);
  return `"${valueText.replace(/"/g, '""')}"`;
}

export function registrationsToCsv(rows: InauguralRegistration[]) {
  const headers = ["Reference", "Full name", "Phone", "Email", "Location", "Church/Ministry", "Sessions", "Party size", "Accommodation required", "Accommodation nights", "Accommodation persons", "Travel guidance required", "Transport mode", "Referral source", "Communication consent", "Registered at"];
  const lines = rows.map((row) => [row.registration_reference, row.full_name, row.phone, row.email, row.location, row.church_ministry, row.expected_sessions, row.party_size, row.needs_accommodation ? "Yes" : "No", row.accommodation_nights, row.accommodation_people, row.needs_travel_guidance ? "Yes" : "No", row.transport_mode, row.referral_source, row.communication_consent ? "Yes" : "No", row.created_at].map(csvCell).join(","));
  return `${headers.map(csvCell).join(",")}\n${lines.join("\n")}`;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";
}

function isOversized(value: unknown, max: number) {
  return typeof value === "string" && value.length > max;
}

function isOneOf<T extends readonly string[]>(value: unknown, values: T): value is T[number] {
  return typeof value === "string" && values.includes(value as T[number]);
}

function positiveInteger(value: unknown, max: number) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isInteger(number) && number >= 1 && number <= max ? number : null;
}

export function validateInauguralRegistration(body: unknown):
  | { ok: true; value: ValidatedRegistration }
  | { ok: false; message: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, message: "Please provide valid registration details." };
  }

  const input = body as Record<string, unknown>;
  const lengthLimits = [
    ["full_name", 120],
    ["phone", 30],
    ["email", 160],
    ["location", 160],
    ["church_ministry", 160],
    ["referral_source", 240],
  ] as const;
  if (lengthLimits.some(([field, max]) => isOversized(input[field], max))) {
    return { ok: false, message: "One or more fields exceed the allowed length." };
  }

  const fullName = text(input.full_name, 120);
  const phone = text(input.phone, 30);
  const email = text(input.email, 160).toLowerCase();
  const location = text(input.location, 160);
  const churchMinistry = text(input.church_ministry, 160);
  const referralSource = text(input.referral_source, 240);
  const partySize = positiveInteger(input.party_size, 100);

  if (fullName.length < 2) return { ok: false, message: "Please enter your full name." };
  if (phone.length < 7) return { ok: false, message: "Please enter a valid WhatsApp or phone number." };
  if (email && !EMAIL_PATTERN.test(email)) return { ok: false, message: "Please enter a valid email address." };
  if (location.length < 2) return { ok: false, message: "Please enter the town, city, or state you are coming from." };
  if (!partySize) return { ok: false, message: "Party size must be a whole number between 1 and 100." };

  const rawSessions = Array.isArray(input.expected_sessions) ? input.expected_sessions : [];
  if (rawSessions.length > INAUGURAL_SESSIONS.length) {
    return { ok: false, message: "Please choose valid programme sessions." };
  }
  if (!rawSessions.every((session) => isOneOf(session, INAUGURAL_SESSIONS))) {
    return { ok: false, message: "Please choose valid programme sessions." };
  }
  const sessions = [...new Set(rawSessions)] as InauguralSession[];
  if (sessions.length === 0) return { ok: false, message: "Please choose at least one session." };
  if (sessions.includes("All Sessions") && sessions.length !== 1) {
    return { ok: false, message: "Choose either All Sessions or individual sessions, not both." };
  }

  if (typeof input.needs_accommodation !== "boolean") {
    return { ok: false, message: "Please indicate whether you need accommodation assistance." };
  }
  const needsAccommodation = input.needs_accommodation;
  const rawNights = Array.isArray(input.accommodation_nights) ? input.accommodation_nights : [];
  if (rawNights.length > ACCOMMODATION_NIGHTS.length) {
    return { ok: false, message: "Please choose valid accommodation nights." };
  }
  if (!rawNights.every((night) => isOneOf(night, ACCOMMODATION_NIGHTS))) {
    return { ok: false, message: "Please choose valid accommodation nights." };
  }
  const nights = [...new Set(rawNights)] as AccommodationNight[];
  const accommodationPeople = needsAccommodation
    ? positiveInteger(input.accommodation_people, partySize)
    : null;
  if (needsAccommodation && nights.length === 0) {
    return { ok: false, message: "Please choose at least one accommodation night." };
  }
  if (needsAccommodation && !accommodationPeople) {
    return { ok: false, message: "Accommodation persons must be between 1 and the party size." };
  }
  if (!needsAccommodation && (nights.length > 0 || input.accommodation_people != null)) {
    return { ok: false, message: "Accommodation details can only be provided when assistance is requested." };
  }

  if (typeof input.needs_travel_guidance !== "boolean") {
    return { ok: false, message: "Please indicate whether you need directions or transportation guidance." };
  }
  const needsTravelGuidance = input.needs_travel_guidance;
  const transportMode = needsTravelGuidance && isOneOf(input.transport_mode, TRANSPORT_MODES)
    ? input.transport_mode
    : null;
  if (needsTravelGuidance && !transportMode) {
    return { ok: false, message: "Please tell us how you plan to come." };
  }
  if (!needsTravelGuidance && input.transport_mode != null && input.transport_mode !== "") {
    return { ok: false, message: "A transport mode can only be provided when travel guidance is requested." };
  }

  if (input.communication_consent !== true) {
    return { ok: false, message: "Communication consent is required to complete registration." };
  }
  if (typeof input.idempotency_key !== "string" || !UUID_PATTERN.test(input.idempotency_key)) {
    return { ok: false, message: "Please refresh the page and try again." };
  }

  return {
    ok: true,
    value: {
      full_name: fullName,
      phone,
      email: email || null,
      location,
      church_ministry: churchMinistry || null,
      expected_sessions: sessions,
      party_size: partySize,
      needs_accommodation: needsAccommodation,
      accommodation_nights: needsAccommodation ? nights : [],
      accommodation_people: accommodationPeople,
      needs_travel_guidance: needsTravelGuidance,
      transport_mode: transportMode,
      referral_source: referralSource || null,
      communication_consent: true,
      idempotency_key: input.idempotency_key,
    },
  };
}
