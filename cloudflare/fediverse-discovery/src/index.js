const DISCOVERY_PATHS = new Set([
  "/.well-known/webfinger",
  "/.well-known/host-meta",
  "/.well-known/nodeinfo",
]);

export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    if (!DISCOVERY_PATHS.has(incoming.pathname)) {
      return new Response("Not found", { status: 404 });
    }

    const destination = new URL(incoming.pathname, "https://social.working-draft.org");
    destination.search = incoming.search;
    return new Response(null, {
      status: 308,
      headers: {
        Location: destination.toString(),
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
      },
    });
  },
};
