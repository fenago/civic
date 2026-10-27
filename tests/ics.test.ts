import { describe, expect, it } from "vitest";
import { buildIcs, googleCalendarUrl } from "../src/lib/ics";

const event = {
  title: "Vote: 2026 General Midterm Election",
  description: "On Election Day at Lakeside Park Garden, 8–9am",
  location: "Lakeside Park Garden, 666 Bellevue Ave, Oakland, CA 94610",
  date: "2026-11-03",
  start: "08:00",
  end: "09:00",
};

describe("calendar", () => {
  it("builds an ics event with day-before and two-hour alerts", () => {
    const ics = buildIcs(event, new Date("2026-10-27T12:00:00Z"));
    expect(ics).toContain("DTSTART:20261103T080000");
    expect(ics).toContain("DTEND:20261103T090000");
    expect(ics).toContain("TRIGGER:-P1D");
    expect(ics).toContain("TRIGGER:-PT2H");
    expect(ics).toContain("LOCATION:Lakeside Park Garden\\, 666 Bellevue Ave");
    for (const line of ics.split("\r\n")) expect(line.length).toBeLessThanOrEqual(75);
  });

  it("builds a Google Calendar link", () => {
    const url = new URL(googleCalendarUrl(event));
    expect(url.searchParams.get("dates")).toBe("20261103T080000/20261103T090000");
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
  });
});
