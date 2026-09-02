"""Deterministic privacy and secret gate for scream payloads."""

import re
import unicodedata


MAX_TEXT_BYTES = 4_096

_SENSITIVE_PATTERNS = (
    ("a credential", re.compile(
        r"\b(?:password|passphrase|secret|api[ _-]?key|access[ _-]?token|authorization)\s*(?:is|=|:)\s*\S+",
        re.I,
    )),
    ("a private key", re.compile(r"-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----", re.I)),
    ("a Slack webhook", re.compile(r"https://hooks\.slack\.com/services/[A-Za-z0-9/_-]+", re.I)),
    ("an obvious access token", re.compile(
        r"\b(?:sk-[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16})\b"
    )),
    ("an authentication header", re.compile(r"\b(?:authorization|bearer|basic)\s*(?::|=|\s)\s*[A-Za-z0-9._~+/=-]{8,}", re.I)),
    ("a session cookie", re.compile(r"\b(?:cookie|session(?:id)?|sid)\s*(?::|=)\s*[^\s;]{8,}", re.I)),
    ("an email address", re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I)),
    ("a phone number", re.compile(r"(?<!\w)(?:\+?\d[\d .()-]{6,}\d)(?!\w)")),
    ("an IP address", re.compile(
        r"\b(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}\b"
        r"|(?<![\w:])(?:[0-9A-F]{1,4}:){2,7}[0-9A-F]{1,4}(?![\w:])",
        re.I,
    )),
    ("a street address", re.compile(r"\b\d{1,5}\s+[A-Z0-9][A-Z0-9 .'-]{1,50}\s(?:street|st\.?|avenue|ave\.?|road|rd\.?|lane|ln\.?|drive|dr\.?|boulevard|blvd\.?)\b", re.I)),
    ("a government identifier", re.compile(r"\b(?:social security|passport|national id|driver'?s licen[cs]e)\b(?:\s*(?:number|no\.?|:|=))?", re.I)),
    ("a social-security-number-like identifier", re.compile(r"\b\d{3}-\d{2}-\d{4}\b")),
)

_MASS_MENTION = re.compile(r"(?i)@(?:channel|here|everyone)|<!(?:channel|here|everyone)>")
_URL = re.compile(
    r"(?i)<(?:https?://|www\.)[^>]+>"
    r"|(?:https?://|www\.)[^\s<>\"'`]+"
    r"|(?<![@\w])(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|org|net|io|dev|app|ai|co|edu|gov|info|me|xyz|uk|de|jp|th)(?:/[^\s<>\"'`]*)?"
)
_QUERY_STRING = re.compile(
    r"\?(?:[a-z0-9._~-]*=[a-z0-9._~%+/-]*)(?:&[a-z0-9._~-]*=[a-z0-9._~%+/-]*)*",
    re.I,
)
_SLACK_CONTROL = re.compile(r"<(?:![^>]+|[@#][A-Z0-9]+|mailto:[^>]+)>", re.I)
_CUSTOM_EMOJI = re.compile(r"(?<!\w):[a-z0-9_+-]{1,80}:(?!\w)", re.I)
_UNICODE_EMOJI = re.compile(
    r"[\u00a9\u00ae\u203c\u2049\u2122\u2139\u2194-\u21ff\u2300-\u23ff\u2600-\u27ff\U0001f000-\U0001faff\U0001fc00-\U0001fffd\u200d\ufe0f]"
)


def _has_payment_card_number(text: str) -> bool:
    """Return True for a 13-19 digit sequence that passes the Luhn check."""
    for candidate in re.findall(r"(?<!\d)(?:\d[ -]?){13,19}(?!\d)", text):
        digits = "".join(char for char in candidate if char.isdigit())
        if not 13 <= len(digits) <= 19:
            continue
        total = 0
        for index, char in enumerate(reversed(digits)):
            value = int(char)
            if index % 2:
                value *= 2
                if value > 9:
                    value -= 9
            total += value
        if total % 10 == 0:
            return True
    return False


def _neutralize_mass_mentions(text: str) -> str:
    """Break Slack's special mention syntax while retaining the visible words."""
    return _MASS_MENTION.sub(
        lambda match: match.group(0).replace("@", "@\u200b").replace("<!", "<\u200b!"),
        text,
    )


def _remove_urls(text: str) -> str:
    """Remove link targets so recipients cannot treat a vent as browseable context."""
    def replace(match: re.Match) -> str:
        value = match.group(0)
        punctuation = ""
        while value and value[-1] in ".,!?;:)]}":
            punctuation = value[-1] + punctuation
            value = value[:-1]
        return "[URL removed]" + punctuation

    return _URL.sub(replace, text)


def _neutralize_slack_syntax(text: str) -> str:
    """Remove syntax that Slack could render as a mention, emoji, or link target."""
    text = _QUERY_STRING.sub("[query removed]", text)
    text = _SLACK_CONTROL.sub("[Slack control removed]", text)
    text = _CUSTOM_EMOJI.sub("[emoji removed]", text)
    text = _UNICODE_EMOJI.sub("", text)
    return text.replace("#", "＃").replace("<", "‹").replace(">", "›")


def inspect_text(value: object) -> tuple[bool, str, str]:
    """Validate a supplied text field without any ML or external service.

    Returns ``(accepted, reason, normalized_text)``.  The bounded, normalized
    text is the exact text safe to forward to Slack.
    """
    if not isinstance(value, str):
        return False, "The text field must be a string.", ""

    text = unicodedata.normalize("NFKC", value).strip()
    if not text:
        return False, "The text field must not be empty.", ""
    if len(text.encode("utf-8")) > MAX_TEXT_BYTES:
        return False, "The text field is too long.", ""
    if any(ord(char) < 32 and char not in "\n\r\t" for char in text):
        return False, "The text field contains a control character.", ""

    for label, pattern in _SENSITIVE_PATTERNS:
        if pattern.search(text):
            return False, f"The text appears to contain {label}.", ""
    if _has_payment_card_number(text):
        return False, "The text appears to contain a payment card number.", ""
    return True, "", _neutralize_slack_syntax(_neutralize_mass_mentions(_remove_urls(text)))
