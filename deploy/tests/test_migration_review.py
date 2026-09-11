import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("migration_review", Path(__file__).parents[1] / "migration_review.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class MigrationReviewTest(unittest.TestCase):
    def setUp(self):
        self.review = {"direction": "forward", "baseline_sha": "a" * 40,
                       "baseline_fingerprint": "b" * 64, "target_fingerprint": "c" * 64}

    def test_exact_transition_checks_server_revision_and_takes_lock(self):
        script = module.approval_script(self.review, "d" * 40, "c" * 64, "b" * 64)
        self.assertIn("flock -w 1200", script)
        self.assertIn("current-revision)", script)
        self.assertIn("b" * 64 + " " + "c" * 64 + " " + "d" * 40, script)
        self.assertNotIn("docker", script)

    def test_unreviewed_source_is_rejected(self):
        with self.assertRaises(ValueError):
            module.approval_script(self.review, "d" * 40, "e" * 64, "b" * 64)

    def test_wrong_baseline_is_rejected(self):
        with self.assertRaises(ValueError):
            module.approval_script(self.review, "d" * 40, "c" * 64, "e" * 64)

    def test_reverse_transition_is_rejected(self):
        self.review["direction"] = "rollback"
        with self.assertRaises(ValueError):
            module.approval_script(self.review, "d" * 40, "c" * 64, "b" * 64)

    def test_identifiers_cannot_inject_shell(self):
        self.review["baseline_sha"] = "$(false)"
        with self.assertRaises(ValueError):
            module.approval_script(self.review, "d" * 40, "c" * 64, "b" * 64)


if __name__ == "__main__":
    unittest.main()
