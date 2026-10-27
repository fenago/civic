import { describe, expect, it } from "vitest";
import type { Contest, VoterInfo } from "../shared/civic";
import { candidatesInOrder, contestKey, groupContests, inBallotOrder, levelGroup } from "../src/lib/ballot";
import testFixture from "../fixtures/voterinfo-test-2000.json";

describe("ballot ordering", () => {
  it("sorts by ballotPlacement numerically and keeps unplaced contests last in original order", () => {
    const contests: Contest[] = [
      { office: "C", ballotPlacement: "10" },
      { office: "X" },
      { office: "A", ballotPlacement: "2" },
      { office: "Y" },
    ];
    expect(inBallotOrder(contests).map((c) => c.office)).toEqual(["A", "C", "X", "Y"]);
  });

  it("orders candidates by orderOnBallot without otherwise reordering", () => {
    const c: Contest = {
      candidates: [
        { name: "Second", orderOnBallot: "2" },
        { name: "First", orderOnBallot: "1" },
        { name: "Unplaced" },
      ],
    };
    expect(candidatesInOrder(c).map((x) => x.name)).toEqual(["First", "Second", "Unplaced"]);
  });
});

describe("level grouping", () => {
  it("uses level, then district scope, then school keywords", () => {
    expect(levelGroup({ level: ["country"] })).toBe("federal");
    expect(levelGroup({ district: { scope: "stateLower" } })).toBe("state");
    expect(levelGroup({ district: { scope: "countywide" } })).toBe("county");
    expect(levelGroup({ office: "Governing Board, Oakland Unified School District" })).toBe("school");
    expect(levelGroup({ office: "Mystery" })).toBe("other");
  });

  it("groups a real response in fixed level order", () => {
    const groups = groupContests((testFixture as VoterInfo).contests!);
    expect(groups.map((g) => g.group)).toEqual(["federal", "state", "county", "city"].filter((g) => groups.some((x) => x.group === g)));
    const total = groups.reduce((n, g) => n + g.contests.length, 0);
    expect(total).toBe((testFixture as VoterInfo).contests!.length);
  });

  it("gives every contest in a real response a unique key", () => {
    const contests = (testFixture as VoterInfo).contests!;
    expect(new Set(contests.map(contestKey)).size).toBe(contests.length);
  });
});
