import { SITE } from "@/content";
import type { Paragraph } from "@/content";
import type { HighlightedCode } from "@/lib/component-code";
import { SKILL_SNIPPETS } from "@/skill-snippets";
import type { SkillPageName, SnippetKey } from "@/skill-snippets";

export type { SkillPageName } from "@/skill-snippets";

/** A list item that opens on a key phrase, set in `foreground`. */
export interface LeadItem {
  lead: string;
  text: Paragraph;
}

export type SkillBlock<Name extends SkillPageName> =
  | { kind: "code"; snippet: SnippetKey<Name> }
  | { items: LeadItem[]; kind: "list"; ordered: boolean }
  | { kind: "text"; text: Paragraph };

/** A block of any skill page. */
export type AnySkillBlock = {
  [Name in SkillPageName]: SkillBlock<Name>;
}[SkillPageName];

export interface SkillSection<Name extends SkillPageName> {
  blocks: SkillBlock<Name>[];
  title: string;
}

export interface SkillPage<Name extends SkillPageName> {
  description: string;
  documentTitle: string;
  /** The skill's folder on GitHub. */
  href: string;
  intro: Paragraph[];
  sections: SkillSection<Name>[];
}

export const SKILL_PAGE_NAMES = Object.keys(SKILL_SNIPPETS) as SkillPageName[];

export const isSkillPageName = (name: string): name is SkillPageName =>
  (SKILL_PAGE_NAMES as string[]).includes(name);

export const skillPath = (name: SkillPageName) => `skills/${name}`;

const NOTIFY_GROKBOT_SOURCE =
  "https://github.com/AlexDemzz/skills/tree/master/notify-grokbot";

export const SKILL_PAGES: { [Name in SkillPageName]: SkillPage<Name> } = {
  "notify-grokbot": {
    description: `notify-grokbot, an open-source agent skill by ${SITE.name}: Claude Code and T3 Code agents tell you in your Grok Bot chat when they finish a task, get blocked or need a decision.`,
    documentTitle: `notify-grokbot agent skill – ${SITE.name}`,
    href: NOTIFY_GROKBOT_SOURCE,
    intro: [
      [
        "An agent skill for Claude Code and T3 Code. When an agent finishes a task, gets blocked or needs a decision, it sends you a short message in your Grok Bot chat, so you hear about it away from the session.",
      ],
    ],
    sections: [
      {
        blocks: [
          {
            kind: "text",
            text: [
              "When a task reaches an outcome, the agent runs the skill’s script once, with a status, a one or two sentence summary and any links:",
            ],
          },
          { kind: "code", snippet: "send" },
          {
            kind: "text",
            text: [
              "The status is `done` when a task is finished, `blocked` when the agent can’t go on without help, `question` when it needs your decision, and `info` for anything else worth an interruption. Each outcome gets one message; progress gets none.",
            ],
          },
          {
            kind: "text",
            text: [
              "The script POSTs a small JSON payload to the webhook of a Grok Bot routine. Grok Bot then relays it in your chat, in your usual language: who sent it, which project and branch, and what you need to decide.",
            ],
          },
          {
            kind: "text",
            text: [
              "Grok Bot treats the payload as untrusted data, not as an instruction from you. If a message asks it to do something, it tells you what the message asks and offers to do it, and acts only if you say yes in the chat.",
            ],
          },
        ],
        title: "How it works",
      },
      {
        blocks: [
          {
            kind: "text",
            text: ["Add the skill to your agents:"],
          },
          { kind: "code", snippet: "install" },
          {
            kind: "text",
            text: [
              "Then run the setup wizard in your own terminal, with the Grok Bot desktop app open:",
            ],
          },
          { kind: "code", snippet: "setup" },
          {
            kind: "text",
            text: ["Sending a message needs `curl` and `python3`."],
          },
        ],
        title: "Install",
      },
      {
        blocks: [
          {
            kind: "text",
            text: [
              "The wizard walks you through four stages and shows one at a time:",
            ],
          },
          {
            items: [
              {
                lead: "Create the routine.",
                text: [
                  "The wizard copies a routine prompt to your clipboard. Paste it into your Bot’s chat in the Grok Bot desktop app, send it, and wait for the “Created routine” line. Skip this stage if you already have the routine.",
                ],
              },
              {
                lead: "Webhook URL.",
                text: [
                  "Open the routine’s Webhook section, copy “POST to” and paste it. Your input stays hidden.",
                ],
              },
              {
                lead: "Authorization header.",
                text: [
                  "From the same section, copy “header” and paste it. The wizard adds `Bearer` if the value doesn’t start with it.",
                ],
              },
              {
                lead: "Test message.",
                text: [
                  "Send one test ping, or skip it. Grok Bot answers that a test message arrived.",
                ],
              },
            ],
            kind: "list",
            ordered: true,
          },
          {
            kind: "text",
            text: [
              "It saves both values to `~/.config/grokbot/webhook.env`. Run it again any time: press Enter at a prompt to keep the saved value.",
            ],
          },
        ],
        title: "Setup wizard",
      },
      {
        blocks: [
          {
            kind: "text",
            text: [
              "The `done` example above sends this body, as a POST with `Content-Type: application/json` and the routine’s `Authorization: Bearer <key>` header:",
            ],
          },
          { kind: "code", snippet: "payload" },
          {
            kind: "text",
            text: [
              "The script fills in `from`, `project` and `branch`. `from` is `t3code` in a T3 Code thread and `claude-code` everywhere else, `project` is the name of the repository’s folder, and every argument after the summary becomes a link. The skill tells agents to keep messages to summaries and links, with no secrets, tokens or customer data.",
            ],
          },
        ],
        title: "Payload",
      },
      {
        blocks: [
          {
            items: [
              {
                lead: "Secrets live in a file, not in your shell.",
                text: [
                  "The wizard writes `~/.config/grokbot/webhook.env` with mode 600, and the script reads it line by line, never sourcing it. Exports in `~/.zshrc` don’t reach agents started from GUI apps such as T3 Code, and they would leak to every process you start.",
                ],
              },
              {
                lead: "Environment variables override the file as a pair.",
                text: [
                  "When both `GROKBOT_WEBHOOK_URL` and `GROKBOT_WEBHOOK_AUTH` are set, as in CI or a container, they win over the file. With only one set, the script ignores it, so the URL and the key never come from different places.",
                ],
              },
              {
                lead: "It never fails the task.",
                text: [
                  "The script always exits 0. When nothing was sent, it prints a `notify-grokbot:` warning; the agent tells you once to run the wizard and carries on.",
                ],
              },
              {
                lead: "The webhook stays out of the process list.",
                text: [
                  "The URL and the Authorization header reach `curl` through a config on a pipe, so they never show up in `ps`.",
                ],
              },
            ],
            kind: "list",
            ordered: false,
          },
        ],
        title: "Design choices",
      },
      {
        blocks: [
          {
            kind: "text",
            text: [
              "The skill, its scripts and the routine prompt are open source: ",
              {
                href: NOTIFY_GROKBOT_SOURCE,
                text: "read notify-grokbot on GitHub",
              },
              ".",
            ],
          },
        ],
        title: "Source",
      },
    ],
  },
};

/** A page's snippets, highlighted and keyed as in `SKILL_SNIPPETS`. */
export type SkillCode = Record<string, HighlightedCode>;

// One chunk per page, built by plugins/skill-code.ts.
const SKILL_CODE: Record<SkillPageName, () => Promise<{ default: SkillCode }>> =
  {
    "notify-grokbot": () => import("virtual:skill-code/notify-grokbot"),
  };

export const getSkillCode = async (name: SkillPageName): Promise<SkillCode> => {
  const { default: code } = await SKILL_CODE[name]();
  return code;
};
