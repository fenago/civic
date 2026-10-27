export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM, local time
  end: string; // HH:MM, local time
}

const compact = (date: string, time: string) => `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;

function escapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** RFC 5545 lines must be folded at 75 octets. */
function fold(line: string): string {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = " " + rest.slice(74);
  }
  out.push(rest);
  return out.join("\r\n");
}

/**
 * An .ics file with alerts the day before and two hours before.
 * Times are "floating" local times, so the event lands at the voter's wall-clock time.
 */
export function buildIcs(e: CalendarEvent, now = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const uid = `${compact(e.date, e.start)}-${Math.random().toString(36).slice(2)}@voter-guide`;
  const alarm = (trigger: string, text: string) => [
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText(text)}`,
    `TRIGGER:${trigger}`,
    "END:VALARM",
  ];
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Voter Guide//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${compact(e.date, e.start)}`,
    `DTEND:${compact(e.date, e.end)}`,
    `SUMMARY:${escapeText(e.title)}`,
    `DESCRIPTION:${escapeText(e.description)}`,
    `LOCATION:${escapeText(e.location)}`,
    ...alarm("-P1D", `Tomorrow: ${e.title}`),
    ...alarm("-PT2H", `In two hours: ${e.title}`),
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(fold)
    .join("\r\n");
}

export function googleCalendarUrl(e: CalendarEvent): string {
  const url = new URL("https://calendar.google.com/calendar/render");
  url.search = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${compact(e.date, e.start)}/${compact(e.date, e.end)}`,
    details: e.description,
    location: e.location,
  }).toString();
  return url.toString();
}

export function downloadIcs(e: CalendarEvent): void {
  const blob = new Blob([buildIcs(e)], { type: "text/calendar;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = "voting-plan.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
