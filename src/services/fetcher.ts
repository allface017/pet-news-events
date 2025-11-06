const USER_AGENT =
  "Pet-News-Events-Bot/1.0 (+https://github.com/allface017/pet-news-events)";
const TIMEOUT_MS = 10000;
const MAX_RETRIES = 3;

export async function fetchPageHtml(
  url: string,
  retries = 0
): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } catch (err) {
    if (retries < MAX_RETRIES) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (retries + 1))
      );
      return fetchPageHtml(url, retries + 1);
    }
    throw err;
  }
}
