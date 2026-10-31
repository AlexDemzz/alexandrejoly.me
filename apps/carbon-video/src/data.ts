// The Meetings of the SwiftUI mock (carbon/.scratch/carbon-v1/prototypes/
// ui-mock/Sources/CarbonMock/MockData.swift), dated as on Oct 27. When the real
// app ships, replace these with a Library exported from it.

export const PROVIDER = "Google Meet";
export const LANGUAGE = "English";
export const TITLE = "Weekly design sync";

export const ATTENDEES = ["Dana Whitfield", "Marcus Lee", "Priya Raman"];

export type Dot = "blue" | "orange" | "green" | "purple";

export const DOT_COLORS: Record<Dot, string> = {
  blue: "#0a84ff",
  green: "#30d158",
  orange: "#ff9f0a",
  purple: "#bf5af2",
};

export interface Row {
  title: string;
  metadata: string;
  /** Its Markdown file in ~/Carbon/2026: the day, then the title's slug. */
  file: string;
  dot?: Dot;
}

export const ROWS: Row[] = [
  {
    dot: "blue",
    file: "2026-10-27-weekly-design-sync.md",
    metadata: "Oct 27 at 10:00 AM · 42 min · Dana, Marcus +1",
    title: TITLE,
  },
  {
    metadata: "Oct 26 at 4:30 PM · 28 min · Tom",
    title: "1:1 Tom / Alex",
    file: "2026-10-26-1-1-tom-alex.md",
  },
  {
    dot: "orange",
    file: "2026-10-25-point-projet-lumen.md",
    metadata: "Oct 25 at 2:02 PM · 55 min · Claire",
    title: "Point projet Lumen",
  },
  {
    metadata: "Oct 23 at 9:15 AM · 12 min",
    title: "Meeting Oct 23, 9:15 AM",
    file: "2026-10-23-meeting-oct-23-9-15-am.md",
  },
  {
    dot: "green",
    file: "2026-10-21-acme-pricing-review.md",
    metadata: "Oct 21 at 11:00 AM · 61 min · Tom, Sam +1",
    title: "Acme pricing review",
  },
  {
    dot: "purple",
    file: "2026-10-18-interview-senior-ios-engineer.md",
    metadata: "Oct 18 at 3:00 PM · 47 min · Marcus",
    title: "Interview: senior iOS engineer",
  },
];

export const MARKDOWN_PATH = `~/Carbon/2026/${ROWS[0].file}`;

// The Meeting header above the Transcript, one labelled line each, like Mail.
export const HEADER_DETAILS = [
  { label: "Date", value: "Oct 27, 2026 at 10:00 AM" },
  { label: "Length", value: "42 min" },
  { label: "App", value: PROVIDER },
  { label: "Language", value: LANGUAGE },
];

export interface Line {
  speaker: string;
  elapsed: string;
  text: string;
}

export const TRANSCRIPT: Line[] = [
  {
    elapsed: "0:04",
    speaker: "Me",
    text: "Okay, I think everyone's here. Let's start with the onboarding question.",
  },
  {
    elapsed: "0:11",
    speaker: "Dana Whitfield",
    text: "I'd still argue for a single welcome screen, honestly.",
  },
  {
    elapsed: "0:19",
    speaker: "Speaker B",
    text: "We tested that last quarter and nobody read it.",
  },
  {
    elapsed: "0:27",
    speaker: "Speaker C",
    text: "The empty state can carry the explanation instead.",
  },
  {
    elapsed: "0:35",
    speaker: "Me",
    text: "Agreed. No onboarding, the empty state explains what Carbon does.",
  },
  {
    elapsed: "1:02",
    speaker: "Speaker B",
    text: "I'll draft the privacy page this week then.",
  },
];

export const isUnnamed = (speaker: string) =>
  speaker.startsWith("Speaker ") || speaker === "Them";

// The first Meeting's file as Carbon writes it: YAML frontmatter, then one
// "**Speaker** [elapsed] text" line per Turn.
export const MARKDOWN = [
  "---",
  `provider: ${PROVIDER}`,
  "id: 6F2A9C41-0B7E-4D5A-9E13-2C8B7F4D1A60",
  "date: 2026-10-27T10:00:00+01:00",
  `title: ${TITLE}`,
  "duration: 42:13",
  "language: en-US",
  "participants:",
  ...ATTENDEES.map((name) => `  - ${name}`),
  "---",
  "",
  ...TRANSCRIPT.map(
    ({ elapsed, speaker, text }) => `**${speaker}** [${elapsed}] ${text}`
  ),
].join("\n");
