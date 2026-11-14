"use client";

const MODIFIER_KEYS = new Set(["Alt", "Control", "Meta", "Shift"]);
const INSTALLED = "__formulaInputModality";

function installInputModality() {
  if (typeof document === "undefined") {
    return;
  }

  const scope = window as typeof window & { [INSTALLED]?: boolean };
  if (scope[INSTALLED]) {
    return;
  }
  scope[INSTALLED] = true;

  const root = document.documentElement;
  document.addEventListener(
    "keydown",
    (event) => {
      if (!MODIFIER_KEYS.has(event.key)) {
        root.dataset.formulaInput = "keyboard";
      }
    },
    true
  );
  document.addEventListener(
    "pointerdown",
    () => {
      root.dataset.formulaInput = "pointer";
    },
    true
  );
}

installInputModality();

export { installInputModality };
