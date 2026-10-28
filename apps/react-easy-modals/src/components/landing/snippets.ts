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
    code: `function StepModal({ close, step, onNext }) {
  return (
    <Modal>
      <ModalContent>
        <ModalTitle>Step {step}</ModalTitle>
        <Button onClick={() => close()}>Back</Button>
        <Button onClick={onNext}>Next step</Button>
      </ModalContent>
    </Modal>
  );
}

// Each step waits underneath the next one until it closes
const openStep = (step: number) =>
  modals.open(StepModal, {
    step,
    onNext: () => openStep(step + 1),
  });`,
    lang: "tsx",
  },
  nested: {
    code: `function NestedModal({ close, open, nested, depth }) {
  const root = useModalAt("root");

  return (
    <Modal>
      <ModalContent>
        {nested}
        <ModalTitle>
          {depth === 0 ? "Parent" : \`Nested level \${depth}\`}
        </ModalTitle>
        {depth > 0 && (
          <Button onClick={() => root.close()}>Close all</Button>
        )}
        <Button onClick={() => close()}>Close</Button>
        <Button onClick={() => open(NestedModal, { depth: depth + 1 })}>
          Open nested
        </Button>
      </ModalContent>
    </Modal>
  );
}`,
    lang: "tsx",
  },
  guards: {
    code: `function DraftModal({ close }) {
  const [draft, setDraft] = useState("");
  const [empty, setEmpty] = useState(false);

  useBeforeClose((answer) => {
    if (answer === "saved" && draft.trim() === "") {
      setEmpty(true);
      return false;
    }
    // Escape, outside clicks and the close button give no answer
    return answer !== undefined;
  });

  return (
    <Modal>
      <ModalContent>
        <ModalTitle>New note</ModalTitle>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          aria-invalid={empty}
        />
        {empty && <p>Write something before you save.</p>}
        <Button onClick={() => close("discarded")}>Discard</Button>
        <Button onClick={() => close("saved")}>Save</Button>
      </ModalContent>
    </Modal>
  );
}`,
    lang: "tsx",
  },
  transitions: {
    code: `function FadeModal({ close }) {
  return (
    <Modal>
      <ModalContent>
        <ModalTitle>Watch it leave</ModalTitle>
        <Button onClick={() => close()}>Close</Button>
      </ModalContent>
    </Modal>
  );
}

// Resolves once the exit animation ends, not on the click
await modals.open(FadeModal);
setResolved((count) => count + 1);`,
    lang: "tsx",
  },
  lazy: {
    code: `<ModalProvider loading={LazyLoading}>
  <App />
</ModalProvider>

// SettingsModal's code is fetched on click; LazyLoading shows meanwhile
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
  caller: `const modals = useModals();

async function deleteProject() {
  const answer = await modals.open(ConfirmDelete, {
    project: "acme-web",
  });
  if (answer === "delete") removeProject();
}`,
  modal: `const ConfirmDelete = ({ close, project }) => (
  <Modal>
    <ModalContent>
      <ModalTitle>Delete {project}?</ModalTitle>
      <Button onClick={() => close("cancel")}>Cancel</Button>
      <Button onClick={() => close("delete")}>Delete</Button>
    </ModalContent>
  </Modal>
);`,
};
