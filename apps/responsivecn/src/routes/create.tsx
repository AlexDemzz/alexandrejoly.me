import { createFileRoute, redirect } from "@tanstack/react-router";

// The playground moved onto the home page.
export const Route = createFileRoute("/create")({
  loader: () => {
    throw redirect({ to: "/", statusCode: 301 });
  },
});
