// All user-facing text lives here. es.ts mirrors this shape exactly (enforced by its type).
import type { StatusCode } from "../../shared/civic";

export const en = {
  /** BCP 47 tag for dates, numbers, and <html lang>. */
  locale: "en-US",
  lang: "en" as "en" | "es",
  appName: "Voter Guide",
  tagline: "Everything you need to vote, from one address.",
  skipToContent: "Skip to main content",

  language: {
    /** Label of the button that switches to the *other* language, written in that language. */
    switchLabel: "Español",
    switchLang: "es" as "en" | "es",
    switchAria: "Ver esta página en español",
  },

  address: {
    label: "Your home address",
    hint: "Use the address where you're registered to vote. Include city and state, or ZIP code.",
    placeholder: "123 Main St, Springfield, IL 62701",
    submit: "Look up my ballot",
    loading: "Looking up your election…",
    useLocation: "Use my location",
    locating: "Finding your address…",
    locationError: "We couldn't get your location. Please type your address instead.",
    locationNote:
      "Your location is sent to OpenStreetMap only to fill in the address field. It isn't stored.",
    privacyNote: "We never store your address. It stays in this page's link and your browser.",
    change: "Change address",
  },

  pickElection: {
    title: "Which election?",
    intro: "More than one election is available for this address. Choose one to see its details.",
    choose: "Show this election",
  },

  status: {
    noStreetSegmentFound:
      "We found your address, but election officials haven't published voting details for it yet.",
    addressUnparseable:
      "We couldn't understand that address. Try the full street address with city and state, like “123 Main St, Springfield, IL”.",
    electionOver: "That election is over, so its voting details are no longer available.",
    electionUnknown: "There's no upcoming election with published details for this address.",
    multipleStreetSegmentsFound:
      "That address matches more than one location. Add an apartment number, ZIP code, or the full street name.",
    noAddressParameter: "Please enter your home address.",
    badRequest: "Something about that request didn't look right. Please try again.",
    rateLimited: "A lot of people are looking up their ballots right now. Please try again in a minute.",
    upstreamUnavailable:
      "The election data service isn't responding right now. Your election office can help in the meantime.",
    aiUnavailable: "The plain-English summary isn't available right now. The official text is below.",
    unknown: "Something went wrong. Please try again.",
  } satisfies Record<StatusCode, string>,

  fallback: {
    title: "Get help from an official source",
    stateLookup: "Find your state or local election office",
    voteGov: "Vote.gov: official U.S. voting information",
  },

  noElection: {
    title: "No upcoming election for this address",
    intro:
      "Election details appear here once officials publish them, usually a few weeks before election day.",
    listTitle: "Elections with data right now",
    listEmpty: "No elections are listed right now.",
    districtsTitle: "Your districts",
  },

  districts: {
    title: "Your districts",
    intro: "Every political district that contains your address.",
    showId: "Show OCD ID",
    hideId: "Hide OCD ID",
    loading: "Loading districts…",
    representedBy: "Who holds this office now",
    noOfficeholders: "No current officeholders listed for this district.",
    officeholdersLoading: "Loading officeholders…",
    officeholdersSource: "Officeholder data: BallotReady",
    lookupTitle: "Find who represents you",
    lookupUsaGov: "USA.gov: find your elected officials",
    lookupOpenStates: "Open States: find your state legislators",
    yearRound: "District information works year-round, even when there's no election.",
  },

  tabs: {
    label: "Sections",
    vote: "Where to vote",
    ballot: "My ballot",
    plan: "My plan",
    office: "Election office",
    districts: "Districts",
  },

  results: {
    electionDay: (date: string) => `Election day: ${date}`,
    checkBack:
      "Officials often update details in the final days. Check back before you vote.",
    lastUpdated: (time: string) => `Data last updated ${time}`,
    official: "Official",
    unofficial: "Not marked official",
    sourceLabel: (names: string) => `Source: ${names}`,
  },

  vote: {
    title: "Where do I vote?",
    filters: "Show",
    types: {
      election: "Election Day",
      early: "Early voting",
      dropoff: "Drop box",
    },
    mapLabel: "Map of voting locations",
    mapNote: "Locations without map coordinates are listed below but not shown on the map.",
    none: "No locations of this type have been published for your address yet.",
    directions: "Get directions",
    hours: "Hours",
    showAllHours: (n: number) => `Show all ${n} days`,
    showFewerHours: "Show fewer days",
    dates: (start: string, end: string) => `Open ${start} – ${end}`,
    distance: (miles: string) => `${miles} mi away`,
    sortedByDistance: "Sorted by distance from your location.",
    sortHint: "Tip: use “Use my location” above to sort by distance.",
    sortedFromPolling: "Sorted by distance from your assigned polling place.",
    mailOnlyTitle: "Your area votes by mail",
    mailOnlyBody:
      "Your ballot comes in the mail. Fill it out, sign the envelope, and return it to a drop box, a voting location, or by mail so it's postmarked by election day. Check your state's rules for exact deadlines.",
    count: (n: number) => `${n} location${n === 1 ? "" : "s"}`,
    showMore: (n: number) => `Show ${n} more location${n === 1 ? "" : "s"}`,
  },

  ballot: {
    title: "Your sample ballot",
    intro:
      "Races and measures are shown in the order they appear on your ballot. Candidates are listed exactly as the ballot lists them.",
    marksNote:
      "Any choices you mark stay only in this browser. Check your local rules before bringing notes to the polls.",
    print: "Print or save as PDF",
    clearMarks: "Clear my marks",
    voteFor: (n: string) => `Vote for ${n}`,
    groups: {
      federal: "Federal",
      state: "State",
      county: "County",
      city: "City",
      school: "School board",
      special: "Special district",
      other: "On your ballot",
    },
    untitled: "Untitled contest (see your official ballot)",
    noContests: "No races or measures have been published for your address yet.",
    measure: "Ballot measure",
    readMeasure: "Read about this measure",
    research: "Candidate info",
    tooMany: (n: string) => `You've marked more than ${n}. On the real ballot that could void your vote for this race.`,
    yes: "Yes",
    no: "No",
  },

  measure: {
    officialTitle: "Official information",
    subtitle: "Subtitle",
    threshold: "Needed to pass",
    abstain: "If you skip this measure",
    pro: "Official statement for",
    con: "Official statement against",
    fullText: "Full official text",
    showFullText: "Show full official text",
    hideFullText: "Hide full official text",
    moreInfo: "More information from officials",
    aiTitle: "Plain-English summary",
    aiLabel: "AI-generated summary, may contain errors",
    aiLoading: "Writing a plain-English summary…",
    aiNoText:
      "Officials haven't published the text of this measure in our data source yet, so there's no summary. Check your official voter guide.",
    q: {
      whatItDoes: "What does it do?",
      ifPasses: "What changes if it passes?",
      ifFails: "What stays the same if it fails?",
      whoIsAffected: "Who is affected?",
    },
    report: "Report a problem with this summary",
    back: "Back to my ballot",
  },

  candidate: {
    intro:
      "Details come from election officials. Anything a candidate didn't provide is left out, never guessed.",
    party: "Party",
    website: "Campaign website",
    phone: "Phone",
    email: "Email",
    social: "Social media",
    searchNews: "Search news",
    newsNote: "Opens a web search for the candidate's name and office. We don't choose or rank the results.",
    noParty: "No party listed",
    noDetails: "Officials haven't published contact details for this candidate.",
    photoAlt: (name: string) => `Photo of ${name}`,
    back: "Back to my ballot",
    channels: {
      Facebook: "Facebook",
      Twitter: "X (Twitter)",
      YouTube: "YouTube",
      Instagram: "Instagram",
      LinkedIn: "LinkedIn",
      GooglePlus: "Google+",
    } as Record<string, string>,
  },

  plan: {
    title: "My voting plan",
    intro: "Make a plan, add it to your calendar, and share it. Your plan is saved only in this browser.",
    method: "How will you vote?",
    methods: {
      election: "On Election Day",
      early: "Early, in person",
      mail: "By mail or drop box",
    },
    location: "Where?",
    chooseLocation: "Choose a location",
    noLocations: "No locations of this type are published yet. You can still save a date and time.",
    mailByPost: "I'll mail it back",
    date: "Day",
    from: "From",
    to: "To",
    save: "Save my plan",
    edit: "Edit plan",
    saved: "Plan saved in this browser.",
    myPlan: "My plan",
    empty: "You haven't made a plan yet.",
    addCalendar: "Add to calendar (.ics)",
    googleCalendar: "Add to Google Calendar",
    share: "Share my plan",
    copied: "Plan copied. Paste it in a message to share.",
    remove: "Delete plan",
    reminderNote: "Calendar reminders go off the day before and two hours before.",
    eventTitle: (election: string) => `Vote: ${election}`,
    summary: (method: string, where: string, when: string) => `${method}${where ? ` at ${where}` : ""}, ${when}`,
    invalidTime: "End time must be after start time.",
    pastDate: "Choose a day between today and election day.",
  },

  office: {
    title: "Your election office",
    state: "State election office",
    local: "Local election office",
    hours: "Hours",
    physical: "Office address",
    mailing: "Mailing address",
    officials: "Contacts",
    call: "Call",
    emailAction: "Email",
    links: {
      electionRegistrationUrl: "Register to vote",
      electionRegistrationConfirmationUrl: "Check my registration",
      absenteeVotingInfoUrl: "Absentee voting",
      ballotInfoUrl: "Ballot info",
      electionRulesUrl: "Election rules",
      votingLocationFinderUrl: "Find my polling place",
      electionInfoUrl: "Election information",
    },
    none: "Contact details for your election office haven't been published yet.",
  },

  notice: {
    label: "Notice from election officials",
    more: "More details",
  },

  footer: {
    attribution: "Voting information powered by the Civic Information API",
    nonpartisan: "Free and nonpartisan. We don't endorse candidates or positions.",
    notOfficial:
      "This app helps you get ready to vote. Registering and voting happen only through official state and county systems.",
    privacy: "Privacy",
  },

  privacy: {
    title: "Privacy",
    back: "Back",
    body: [
      "We don't have accounts, and we don't store your address. It lives only in this page's link and your own browser.",
      "Your voting plan and any choices you mark on your sample ballot are saved only in this browser (localStorage). Clearing your browser data removes them.",
      "We use no analytics on addresses and no third-party trackers.",
      "To look up your election, our server sends your address to Google's Civic Information API. Our server never logs it.",
      "If you tap “Use my location,” your browser sends your coordinates to OpenStreetMap to find your address. We don't keep them.",
      "Map images come from OpenStreetMap. Candidate photos, when shown, load from the address officials provided.",
      "Plain-English measure summaries are generated by Anthropic's Claude from the official measure text. Your address is not sent to Anthropic.",
      "When officeholder information is shown, our server sends only your district IDs (not your address) to our data partner, BallotReady.",
    ],
  },

  common: {
    loading: "Loading…",
    retry: "Try again",
    close: "Close",
    opensNewTab: "(opens in a new tab)",
  },
};

export type Strings = typeof en;
