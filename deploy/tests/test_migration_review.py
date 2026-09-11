import importlib.util
import os
from pathlib import Path
import subprocess
import tempfile
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

    def test_posix_shell_approval_fails_closed_and_is_idempotent(self):
        script = module.approval_script(self.review, "d" * 40, "c" * 64, "b" * 64)
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for path in ["/srv/sub9api", "/opt/sub9api/config", "/run"]:
                (root / path.lstrip("/")).mkdir(parents=True)
                script = script.replace(path, str(root / path.lstrip("/")))
            flock = root / "flock"
            flock.write_text('#!/bin/sh\nexit "${LOCK_RESULT:-0}"\n')
            flock.chmod(0o700)
            env = {**os.environ, "PATH": f"{root}:{os.environ['PATH']}", "LOCK_RESULT": "0"}
            revision = root / "srv/sub9api/current-revision"
            revision.write_text("e" * 40)
            (root / "srv/sub9api/current-migrations").write_text("b" * 64)
            approvals = root / "opt/sub9api/config/migration-approvals"
            command = ["sh", "-eu", "-c", script]
            self.assertNotEqual(subprocess.run(command, env=env).returncode, 0)
            self.assertFalse(approvals.exists())
            revision.write_text("a" * 40)
            self.assertNotEqual(subprocess.run(command, env={**env, "LOCK_RESULT": "1"}).returncode, 0)
            self.assertFalse(approvals.exists())
            for _ in range(2):
                subprocess.run(command, env=env, check=True)
            self.assertEqual(approvals.read_text(), "b" * 64 + " " + "c" * 64 + " " + "d" * 40 + "\n")


if __name__ == "__main__":
    unittest.main()
