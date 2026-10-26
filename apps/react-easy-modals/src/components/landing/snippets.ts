// Every snippet the landing shows, highlighted on the server by
// `getLandingCode` with the docs' Shiki themes.

export const SNIPPETS = {
  install: { code: "npm install react-easy-modals", lang: "bash" },
  provider: {
    code: `<ModalProvider>
  <App />
</ModalProvider>`,
    lang: "tsx",
  },
  open: { code: "const ok = await modals.open(Confirm);", lang: "tsx" },
  shadcn: {
    code: "npx shadcn@latest add @alexandrejoly/easy-modal",
    lang: "bash",
  },
  stack: {
    code: `modals.open(Step1);
modals.open(Step2); // Step1 waits underneath
modals.close();     // back to Step1`,
    lang: "tsx",
  },
  nested: {
    code: `function Child() {
  const root = useModalAt("root");
  return <Button onClick={() => root.close()}>Done</Button>;
}`,
    lang: "tsx",
  },
  guards: {
    code: `useBeforeClose((answer) => {
  // Escape, outside clicks and the close button give no answer
  return answer !== undefined;
});`,
    lang: "tsx",
  },
  transitions: {
    code: `// Inside the registry’s shadcn Modal
useBeforeClose(() => {
  setOpen(false);               // play the exit animation
  return animationDone.current; // unmount once it ends
});`,
    lang: "tsx",
  },
  lazy: {
    code: `// The provider shows its loader meanwhile
modals.open(() => import("./settings-modal"));`,
    lang: "tsx",
  },
} as const;

export type SnippetName = keyof typeof SNIPPETS;

export const DIFF = {
  removed: `<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>…</DialogContent>
</Dialog>`,
  added: "const result = await modals.open(MyModal);",
};

export const HERO = {
  before: `const modals = useModals();

async function deleteProject() {
  const answer = await modals.open(ConfirmDelete, {
    project: "acme-web",
  });`,
  after: `  if (answer === "delete") removeProject();
}`,
};

export const HERO_ANSWERS = ["delete", "cancel", "undefined"] as const;

export type HeroAnswer = (typeof HERO_ANSWERS)[number];

export const heroAnswerComment = (answer: HeroAnswer) =>
  `  // answer: ${answer === "undefined" ? answer : `"${answer}"`}`;
