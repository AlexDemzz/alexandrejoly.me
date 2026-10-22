import { waitUntil } from "cloudflare:workers";

import { levelScale } from "@/contribution-levels";
import { ENV } from "@/env.server";

const GITHUB_LOGIN = "AlexDemzz";
const CACHE_NAME = "github-contributions";
// Bump the version whenever `Contributions` or the cached entry changes shape.
const CACHE_KEY = `https://alexandrejoly.me/__cache/${CACHE_NAME}/v3`;
export const CACHE_TTL_SECONDS = 60 * 60 * 6;
const CACHE_TTL_MS = CACHE_TTL_SECONDS * 1000;
// Kept well past freshness, so a stale graph can be served while GitHub answers.
const CACHE_RETENTION_SECONDS = 60 * 60 * 24 * 30;
const FETCHED_AT_HEADER = "x-fetched-at";

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

const refreshContributions = async (
  cache: Cache
): Promise<Contributions | null> => {
  const contributions = await fetchContributions();
  if (contributions !== null) {
    await cache.put(
      CACHE_KEY,
      Response.json(contributions, {
        headers: {
          "cache-control": `max-age=${CACHE_RETENTION_SECONDS}`,
          [FETCHED_AT_HEADER]: String(Date.now()),
        },
      })
    );
  }
  return contributions;
};

const refreshInBackground = async (cache: Cache): Promise<void> => {
  try {
    await refreshContributions(cache);
  } catch {
    // The stale copy keeps being served until GitHub answers again.
  }
};

// The graph barely moves within a day, so GitHub is asked at most every few
// hours per Cloudflare location, and in the background once a copy is cached;
// a failure keeps the stale graph, or hides the graph instead of the page.
export const loadContributions = async (): Promise<Contributions | null> => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(CACHE_KEY);
    if (cached === undefined) {
      return await refreshContributions(cache);
    }

    const ageMs = Date.now() - Number(cached.headers.get(FETCHED_AT_HEADER));
    // A missing header reads as `NaN`, which is stale too.
    const stale = !(ageMs < CACHE_TTL_MS);
    if (stale) {
      waitUntil(refreshInBackground(cache));
    }
    return (await cached.json()) as Contributions;
  } catch {
    return null;
  }
};
