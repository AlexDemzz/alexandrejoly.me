import { createServerFn } from "@tanstack/react-start";

import { loadContributions } from "@/github-contributions.server";

export const getContributions = createServerFn({ method: "GET" }).handler(
  loadContributions
);
