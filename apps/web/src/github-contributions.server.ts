import { env, waitUntil } from "cloudflare:workers";

import { levelScale } from "@/contribution-levels";
import { ENV } from "@/env.server";

const GITHUB_LOGIN = "AlexDemzz";
// Bump the version whenever the stored entry changes shape.
const STORE_KEY = "github-contributions/v1";
export const CACHE_TTL_SECONDS = 60 * 60 * 6;
const FRESH_FOR_MS = CACHE_TTL_SECONDS * 1000;

const QUERY = `query ($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { contributionCount } }
      }
    }
  }
}`;

interface CalendarResponse {
  data?: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: {
            contributionDays: {
              contributionCount: number;
            }[];
          }[];
        };
      };
    } | null;
  };
}

export interface Contributions {
  total: number;
  /**
   * Each day's level, from 0 (no contributions) to 4 (top quartile of active
   * days), in GitHub's Sunday-to-Saturday weeks.
   */
  weeks: number[][];
}

const fetchContributions = async (): Promise<Contributions | null> => {
  const response = await fetch("https://api.github.com/graphql", {
    body: JSON.stringify({ query: QUERY, variables: { login: GITHUB_LOGIN } }),
    headers: {
      authorization: `bearer ${ENV.GITHUB_TOKEN}`,
      "user-agent": "alexandrejoly.me",
    },
    method: "POST",
  });
  if (!response.ok) {
    return null;
  }

  const { data } = (await response.json()) as CalendarResponse;
  const calendar = data?.user?.contributionsCollection.contributionCalendar;
  if (calendar === undefined) {
    return null;
  }

  const toLevel = levelScale(
    calendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => day.contributionCount)
    )
  );

  return {
    total: calendar.totalContributions,
    weeks: calendar.weeks.map((week) =>
      week.contributionDays.map(({ contributionCount }) =>
        toLevel(contributionCount)
      )
    ),
  };
};

interface StoredContributions {
  contributions: Contributions;
  fetchedAt: number;
}

const storeContributions = async (contributions: Contributions) => {
  const stored: StoredContributions = { contributions, fetchedAt: Date.now() };
  try {
    await env.CONTRIBUTIONS.put(STORE_KEY, JSON.stringify(stored));
  } catch {
    // Concurrent refreshes may hit KV's one-write-per-second limit.
  }
};

const refreshContributions = async (): Promise<Contributions | null> => {
  const contributions = await fetchContributions();
  if (contributions !== null) {
    await storeContributions(contributions);
  }
  return contributions;
};

const refreshInBackground = async (): Promise<void> => {
  try {
    await refreshContributions();
  } catch {
    // The stored copy keeps being served until GitHub answers again.
  }
};

// KV holds one copy for every Cloudflare location, so GitHub is only awaited
// before the very first copy exists. Past a few hours the stored copy is still
// served while GitHub refreshes it in the background; a failure hides the graph
// instead of the page.
export const loadContributions = async (): Promise<Contributions | null> => {
  try {
    const stored = await env.CONTRIBUTIONS.get<Partial<StoredContributions>>(
      STORE_KEY,
      "json"
    );
    if (stored?.contributions === undefined) {
      return await refreshContributions();
    }

    // A missing date reads as `NaN`, which is stale too.
    const fresh = Date.now() - Number(stored.fetchedAt) < FRESH_FOR_MS;
    if (!fresh) {
      waitUntil(refreshInBackground());
    }
    return stored.contributions;
  } catch {
    return null;
  }
};
