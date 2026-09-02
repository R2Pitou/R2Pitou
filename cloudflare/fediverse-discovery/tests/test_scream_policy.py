import unittest

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
from scream_policy import inspect_text


class ScreamPolicyTests(unittest.TestCase):
    def test_allows_a_profane_vent(self):
        accepted, reason, text = inspect_text("Windows quoting can get absolutely fucked.")
        self.assertTrue(accepted, reason)
        self.assertEqual(text, "Windows quoting can get absolutely fucked.")

    def test_rejects_credentials(self):
        accepted, _, _ = inspect_text("api_key = definitely-not-a-real-key")
        self.assertFalse(accepted)

    def test_rejects_personal_data(self):
        accepted, _, _ = inspect_text("Please call +1 (212) 555-0199")
        self.assertFalse(accepted)

    def test_rejects_payment_cards(self):
        accepted, _, _ = inspect_text("My card is 4242 4242 4242 4242")
        self.assertFalse(accepted)

    def test_allows_provocative_ranting(self):
        accepted, reason, _ = inspect_text("I committed to a political rant: this government is a circus.")
        self.assertTrue(accepted, reason)

    def test_neutralizes_slack_mass_mentions(self):
        accepted, reason, text = inspect_text("@channel, this build is cursed. <!here>")
        self.assertTrue(accepted, reason)
        self.assertEqual(text, "@\u200bchannel, this build is cursed. ‹\u200b!here›")

    def test_removes_browseable_urls(self):
        accepted, reason, text = inspect_text(
            "Read https://example.org/poison, www.example.com, example.ai/docs, and <https://example.net|this>."
        )
        self.assertTrue(accepted, reason)
        self.assertEqual(text, "Read [URL removed], [URL removed], [URL removed], and [URL removed].")

    def test_neutralizes_other_slack_injection_syntax(self):
        accepted, reason, text = inspect_text(
            "#channel :deploy_bomb: 😀 <!subteam^S123|@operators> ?token=abc123&mode=steal"
        )
        self.assertTrue(accepted, reason)
        self.assertEqual(
            text,
            "＃channel [emoji removed]  [Slack control removed] [query removed]",
        )

    def test_neutralizes_malformed_query_strings(self):
        accepted, reason, text = inspect_text("Track this ?=UTM_campaign&=whatever")
        self.assertTrue(accepted, reason)
        self.assertEqual(text, "Track this [query removed]")

    def test_rejects_ip_addresses(self):
        accepted, _, _ = inspect_text("The server at 192.0.2.44 is screaming too.")
        self.assertFalse(accepted)

    def test_rejects_other_required_sensitive_structures(self):
        cases = (
            "https://hooks.slack.com/services/T000/B000/secret-value",
            "mail me at bot@example.test",
            "cookie: session-value-12345",
            "-----BEGIN PRIVATE KEY-----",
            "SSN 123-45-6789",
            "Come to 123 Example Street right now.",
        )
        for text in cases:
            with self.subTest(text=text):
                accepted, _, _ = inspect_text(text)
                self.assertFalse(accepted)

    def test_rejects_unknown_or_extra_json_shape_at_the_worker_boundary(self):
        accepted, reason, _ = inspect_text(None)
        self.assertFalse(accepted)
        self.assertIn("string", reason)


if __name__ == "__main__":
    unittest.main()
