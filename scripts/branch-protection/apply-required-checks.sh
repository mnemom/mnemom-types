#!/usr/bin/env bash
# Applies scripts/branch-protection/required-checks.json to mnemom-types'
# main-branch protection via the GitHub API.
#
# NOT run by CI and NOT run automatically by this PR landing — GitHub branch
# protection is a repo admin setting, not something a PR merge can change.
# This script is the reviewable, explicit "here is exactly what will change"
# artifact (MNE-492): a human runs it deliberately after reviewing the diff
# between the current live config (printed first, for comparison) and
# required-checks.json.
#
# Requires: gh CLI authenticated with admin rights on mnemom/mnemom-types.
set -euo pipefail

REPO="mnemom/mnemom-types"
BRANCH="main"
CONFIG_FILE="$(dirname "$0")/required-checks.json"

echo "== Current live required_status_checks for ${REPO}@${BRANCH} =="
gh api "repos/${REPO}/branches/${BRANCH}/protection/required_status_checks" 2>/dev/null \
  --jq '{strict, contexts}' || echo "(none set, or protection missing required_status_checks)"

echo
echo "== Target (from ${CONFIG_FILE}) =="
jq '.required_status_checks' "$CONFIG_FILE"

echo
read -r -p "Apply this as the new required_status_checks for ${REPO}@${BRANCH}? [y/N] " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborted — no changes made."
  exit 1
fi

STRICT=$(jq '.required_status_checks.strict' "$CONFIG_FILE")
CONTEXTS_JSON=$(jq -c '.required_status_checks.contexts' "$CONFIG_FILE")

gh api \
  --method PATCH \
  "repos/${REPO}/branches/${BRANCH}/protection/required_status_checks" \
  --input - <<EOF
{"strict": ${STRICT}, "contexts": ${CONTEXTS_JSON}}
EOF

echo
echo "Applied. Verifying:"
gh api "repos/${REPO}/branches/${BRANCH}/protection/required_status_checks" --jq '{strict, contexts}'
