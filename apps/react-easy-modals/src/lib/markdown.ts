const FENCE = /^\s*(?:```|~~~)/u;
const DEMO_TAG = /^\s*<[A-Z]\w*(?:Example|Exemple)\s*\/>\s*$/u;
const HEADING_ID = /^(?<heading>#{1,6} .*?) \[#[\w-]+\]\s*$/u;
const EXTRA_BLANK_LINES = /\n{3,}/gu;

// Live demos are interactive only (their code is already in the page), and
// explicit heading ids are noise for an LLM. Code fences are left untouched.
export const cleanMarkdown = (markdown: string) => {
  let inFence = false;
  const lines: string[] = [];

  for (const line of markdown.split("\n")) {
    if (FENCE.test(line)) {
      inFence = !inFence;
    }
    if (inFence || FENCE.test(line)) {
      lines.push(line);
      continue;
    }
    if (DEMO_TAG.test(line)) {
      continue;
    }
    lines.push(line.replace(HEADING_ID, "$<heading>"));
  }

  return lines.join("\n").replaceAll(EXTRA_BLANK_LINES, "\n\n").trim();
};
