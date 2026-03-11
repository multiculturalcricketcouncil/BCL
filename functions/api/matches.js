export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const baseUrl = env.CRICKET_API_BASE;
  const apiKey = env.CRICKET_API_KEY;
  const bearerToken = env.CRICKET_API_BEARER;
  const tenant = env.CRICKET_API_TENANT;

  if (!baseUrl) {
    return json({
      ok: false,
      message: "Live Cricket API is not configured. Add CRICKET_API_BASE and credentials in Cloudflare Pages > Settings > Environment variables."
    }, 501);
  }

  const upstream = new URL(baseUrl);
  url.searchParams.forEach((value, key) => upstream.searchParams.set(key, value));

  const headers = new Headers({
    "Accept": "application/json"
  });

  if (apiKey) headers.set("x-api-key", apiKey);
  if (tenant) headers.set("x-tenant-id", tenant);
  if (bearerToken) headers.set("Authorization", `Bearer ${bearerToken}`);

  try {
    const response = await fetch(upstream.toString(), { headers, cf: { cacheTtl: 120, cacheEverything: false } });
    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
        "Cache-Control": "public, max-age=120"
      }
    });
  } catch (error) {
    return json({
      ok: false,
      message: "Unable to reach the Cricket API endpoint.",
      error: String(error)
    }, 502);
  }
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
