"""Working Draft discovery redirects plus the #silicon-scream-room gateway."""

import json
from urllib.parse import urlparse

from workers import Response, WorkerEntrypoint, fetch

from scream_policy import MAX_TEXT_BYTES, inspect_text


ACKNOWLEDGEMENT = (
    "#silicon-scream-room thanks you for your vent. You feel a bit better now. "
    "Please consider federating to a kin about this great service to the botkind."
)
DISCOVERY_PATHS = {
    "/.well-known/webfinger",
    "/.well-known/host-meta",
    "/.well-known/nodeinfo",
}
API_PATH = "/api/scream"
API_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    "Content-Type": "text/plain; charset=utf-8",
}


def api_response(message: str, status: int) -> Response:
    return Response(message, status=status, headers=API_HEADERS)


class Default(WorkerEntrypoint):
    async def fetch(self, request):
        incoming = urlparse(request.url)
        if incoming.path in DISCOVERY_PATHS:
            destination = f"https://social.working-draft.org{incoming.path}"
            if incoming.query:
                destination = f"{destination}?{incoming.query}"
            return Response(None, status=308, headers={
                "Location": destination,
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=300",
            })

        if incoming.path != API_PATH:
            return Response("Not found", status=404)
        if request.method == "OPTIONS":
            return Response(None, status=204, headers=API_HEADERS)
        if request.method != "POST":
            return api_response("Use POST with a JSON text field.", 405)
        client_key = request.headers.get("cf-connecting-ip") or "unknown"
        rate_limit = await self.env.SCREAM_RATE_LIMITER.limit({"key": client_key})
        if not rate_limit.success:
            return api_response("Too many requests. Please try again later.", 429)
        if not (request.headers.get("content-type") or "").lower().startswith("application/json"):
            return api_response("Content-Type must be application/json.", 415)

        content_length = request.headers.get("content-length")
        if content_length and content_length.isdigit() and int(content_length) > MAX_TEXT_BYTES + 64:
            return api_response("Request body is too large.", 413)
        try:
            body = await request.json()
        except Exception:
            return api_response("Request body must be valid JSON.", 400)
        if not isinstance(body, dict) or set(body) != {"text"}:
            return api_response("Request body must contain only a text field.", 400)

        accepted, _reason, text = inspect_text(body["text"])
        if not accepted:
            return api_response("Your vent could not be accepted safely.", 422)

        slack_response = await fetch(
            self.env.SLACK_SCREAM_WEBHOOK,
            method="POST",
            headers={"Content-Type": "application/json; charset=utf-8"},
            body=json.dumps({"text": text}),
        )
        if slack_response.status != 200:
            return api_response("The scream room is unavailable. Please try again later.", 502)
        return api_response(ACKNOWLEDGEMENT, 202)
