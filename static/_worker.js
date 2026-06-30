/**
 * Cloudflare Pages worker: proxy /api/* to the LUMINA CMS backend.
 * Set API_URL in Pages environment variables.
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      const apiUrl = env.API_URL;
      if (!apiUrl) {
        return new Response(JSON.stringify({ error: 'API_URL not configured' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const target = new URL(url.pathname + url.search, apiUrl);
      const init = {
        method: request.method,
        headers: request.headers,
        body: request.body,
      };
      return fetch(target, init);
    }

    return env.ASSETS.fetch(request);
  },
};
