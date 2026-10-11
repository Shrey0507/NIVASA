// NIVASA — Hostel presence demonstration data
//
// ⚠️ DEMONSTRATION DATA ONLY.
// There is no live gate/turnstile integration in this project yet, so the
// entry/exit events below are fictional. They are derived in two parts:
//
//   1. The real record shape already used by the app (the in/out register in
//      `adminMockData.movementRecords`) is converted into entry/exit events.
//   2. A deterministic (seeded) generator fills in the remaining residents so
//      the dashboard can demonstrate presence at hostel scale.
//
// Because the generator is seeded, the numbers are stable between reloads and
// the calculation is testable. Replace this module with a real events query
// once a backend exists — `calculatePresence` in `@/lib/presence` stays as is.

import { movementRecords } from "./adminMockData.js";

export const PRESENCE_DATA_NOTE =
  "Demonstration data — no live gate register is connected yet.";

/** Residents assigned to a hostel bed (matches dashboardStats.totalStudents). */
export const ASSIGNED_STUDENT_COUNT = 342;

/** Students intentionally left without any register entry (unknown status). */
const UNKNOWN_TAIL_COUNT = 12;

const KNOWN_STUDENTS = [
  { id: 1, fullName: "Aarav Kumar", usn: "1MS22CS001", room: "B-101", hostel: "boys" },
  { id: 2, fullName: "Priya Sharma", usn: "1MS22CS089", room: "G-201", hostel: "girls" },
  { id: 3, fullName: "Rahul Verma", usn: "1MS22EC034", room: "B-204", hostel: "boys" },
  { id: 4, fullName: "Ananya Desai", usn: "1MS22ME015", room: "G-305", hostel: "girls" },
  { id: 5, fullName: "Vikram Singh", usn: "1MS22CS078", room: "B-312", hostel: "boys" },
];

const SECOND = 1000;
const HOUR = 60 * 60 * SECOND;

/** Small deterministic PRNG (mulberry32) so demo data never flickers. */
function createRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Assigned residents. Known demo students keep their real names; everyone
 * else is a generic "Resident #NNN" placeholder — we never invent identities.
 */
export const demoAssignedStudents = Array.from(
  { length: ASSIGNED_STUDENT_COUNT },
  (_, index) => {
    const id = index + 1;
    const known = KNOWN_STUDENTS.find((s) => s.id === id);
    if (known) return { ...known };
    return {
      id,
      fullName: null,
      usn: null,
      room: null,
      hostel: id % 2 === 0 ? "girls" : "boys",
    };
  },
);

/** Convert register rows into entry/exit events. */
function eventsFromRegister() {
  const events = [];

  for (const record of movementRecords) {
    const studentId = record.studentId;
    const hostel = record.hostel?.toLowerCase().includes("girl") ? "girls" : "boys";

    events.push({
      id: `reg-${record.id}-out`,
      studentId,
      type: "exit",
      timestamp: record.departureTime,
      source: "register",
      hostel,
    });

    if (record.actualReturn) {
      events.push({
        id: `reg-${record.id}-in`,
        studentId,
        type: "entry",
        timestamp: record.actualReturn,
        source: "register",
        hostel,
      });
    }
  }

  return events;
}

/** Build the full, seeded demonstration event log. */
export function buildDemoPresenceEvents(referenceDate = new Date()) {
  const now = referenceDate.getTime();
  const events = eventsFromRegister();
  const random = createRandom(20261011);
  const eventIdRef = { value: events.length + 1 };

  const knownIds = new Set(KNOWN_STUDENTS.map((s) => s.id));
  // Rahul Verma (id 3) is a real record but has no register entry, so he stays
  // "unknown" — a deliberate demonstration of the unknown bucket.
  const unknownIds = new Set([3]);
  const firstSyntheticId = KNOWN_STUDENTS.length + 1;
  const lastSyntheticId = ASSIGNED_STUDENT_COUNT - UNKNOWN_TAIL_COUNT;

  for (let id = firstSyntheticId; id <= lastSyntheticId; id += 1) {
    if (knownIds.has(id) || unknownIds.has(id)) continue;

    const inside = random() < 0.75;
    const lastType = inside ? "entry" : "exit";
    const otherType = inside ? "exit" : "entry";
    const hostel = id % 2 === 0 ? "girls" : "boys";

    // Latest event within the last 8 hours.
    let time = now - Math.floor(random() * 8 * HOUR) - 5 * 60 * SECOND;

    events.push({
      id: `gen-${eventIdRef.value++}`,
      studentId: id,
      type: lastType,
      timestamp: new Date(time).toISOString(),
      source: "demo",
      hostel,
    });

    // 0-2 earlier events so the "latest valid event wins" rule is exercised.
    const extra = Math.floor(random() * 3);
    for (let i = 0; i < extra; i += 1) {
      time -= (1 + Math.floor(random() * 6)) * HOUR;
      events.push({
        id: `gen-${eventIdRef.value++}`,
        studentId: id,
        type: i % 2 === 0 ? otherType : lastType,
        timestamp: new Date(time).toISOString(),
        source: "demo",
        hostel,
      });
    }
  }

  return events;
}

/** Static event log used by the dashboards. */
export const demoPresenceEvents = buildDemoPresenceEvents();

/** Newest-first slice of the event log for the activity feed. */
export function getRecentPresenceEvents(events = demoPresenceEvents, limit = 6) {
  return [...events]
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, limit);
}

/** Friendliest available label for a resident id. */
export function presenceEventLabel(studentId) {
  const known = KNOWN_STUDENTS.find((s) => s.id === studentId);
  if (known) return { name: known.fullName, usn: known.usn, room: known.room };
  return {
    name: `Resident #${String(studentId).padStart(3, "0")}`,
    usn: null,
    room: null,
  };
}

/** Used by the login "data freshness" hint. */
export const PRESENCE_LAST_SYNC = new Date();
