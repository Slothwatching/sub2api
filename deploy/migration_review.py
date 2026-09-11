"""Prepare an exact, reviewed forward transition for the existing deploy gate."""

import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess


def git(*args):
    return subprocess.check_output(["git", *args])


def fingerprint(revision):
    paths = git("ls-tree", "-r", "--name-only", revision, "backend/migrations").decode().splitlines()
    rows = []
    for path in sorted(paths):
        digest = hashlib.sha256(git("show", f"{revision}:{path}")).hexdigest()
        rows.append(f"{digest}  {path}\n")
    return hashlib.sha256("".join(rows).encode()).hexdigest()


def approval_script(review, source_sha, source_fingerprint, baseline_fingerprint):
    for value, length in [(source_sha, 40), (review.get("baseline_sha"), 40),
                          (review.get("baseline_fingerprint"), 64),
                          (review.get("target_fingerprint"), 64)]:
        if not isinstance(value, str) or not re.fullmatch(f"[a-f0-9]{{{length}}}", value):
            raise ValueError("Invalid migration review identifier")
    if review.get("direction") != "forward":
        raise ValueError("Only reviewed forward transitions are supported")
    if review["target_fingerprint"] != source_fingerprint:
        raise ValueError("Requested source has unreviewed migration changes")
    if review["baseline_fingerprint"] != baseline_fingerprint:
        raise ValueError("Baseline migration fingerprint does not match its commit")
    baseline = review["baseline_sha"]
    before = review["baseline_fingerprint"]
    after = review["target_fingerprint"]
    return f'''# Reviewed schema transition; the deployment script still takes a backup.
(
  flock -w 1200 9
  current=$(cat /srv/sub9api/current-migrations 2>/dev/null || true)
  if [ "$current" = '{before}' ]; then
    test "$(cat /srv/sub9api/current-revision)" = '{baseline}'
    approval='{before} {after} {source_sha}'
    touch /opt/sub9api/config/migration-approvals
    chmod 600 /opt/sub9api/config/migration-approvals
    grep -Fxq "$approval" /opt/sub9api/config/migration-approvals || printf '%s\\n' "$approval" >> /opt/sub9api/config/migration-approvals
  fi
) 9>/run/sub9api-deploy.lock
'''


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source_sha")
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    if not re.fullmatch("[a-f0-9]{40}", args.source_sha):
        parser.error("source_sha must be a full commit SHA")
    manifest = f"{args.source_sha}:deploy/migration-compatibility.json"
    present = subprocess.run(["git", "cat-file", "-e", manifest], capture_output=True).returncode == 0
    script = ""
    if present:
        review = json.loads(git("show", manifest))
        script = approval_script(review, args.source_sha, fingerprint(args.source_sha), fingerprint(review["baseline_sha"]))
        subprocess.run(["git", "merge-base", "--is-ancestor", review["baseline_sha"], args.source_sha], check=True)
    args.output.write_text(script)


if __name__ == "__main__":
    main()
