const REGISTRY_FILE = /^\/r\/(?<item>.+)\.json$/u;

interface Assets {
  fetch: (request: Request) => Promise<Response>;
}

interface FetchCounter {
  writeDataPoint: (point: { blobs: string[]; indexes: string[] }) => void;
}

/**
 * Serves a `/r/*.json` registry file and counts the fetch: item, user agent
 * and status, nothing that identifies the visitor. `undefined` for any other
 * path, or a file that doesn't exist, lets the app answer.
 */
export const registryFetch = async (
  request: Request,
  { assets, counter }: { assets: Assets; counter: FetchCounter }
): Promise<Response | undefined> => {
  const item = REGISTRY_FILE.exec(new URL(request.url).pathname)?.groups?.item;
  if (!item || request.method !== "GET") {
    return undefined;
  }
  const response = await assets.fetch(request);
  counter.writeDataPoint({
    blobs: [
      item,
      request.headers.get("user-agent") ?? "",
      String(response.status),
    ],
    indexes: [item],
  });
  return response.ok ? response : undefined;
};
