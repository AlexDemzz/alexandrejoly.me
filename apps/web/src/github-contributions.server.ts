import { levelScale } from "@/contribution-levels";
import { ENV } from "@/env.server";

const GITHUB_LOGIN = "AlexDemzz";
const CACHE_NAME = "github-contributions";
// Bump the version whenever `Contributions` changes shape.
const CACHE_KEY = `https://alexandrejoly.me/__cache/${CACHE_NAME}/v2`;
export const CACHE_TTL_SECONDS = 60 * 60 * 6;

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

// The graph barely moves within a day, so GitHub is asked at most every few
// hours per Cloudflare location; a failure hides the graph instead of the page.
export const loadContributions = async (): Promise<Contributions | null> => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(CACHE_KEY);
    if (cached !== undefined) {
      return (await cached.json()) as Contributions;
    }

    const contributions = await fetchContributions();
    if (contributions !== null) {
      await cache.put(
        CACHE_KEY,
        Response.json(contributions, {
          headers: { "cache-control": `max-age=${CACHE_TTL_SECONDS}` },
        })
      );
    }
    return contributions;
  } catch {
    return null;
  }
};
