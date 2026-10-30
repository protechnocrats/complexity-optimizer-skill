#!/usr/bin/env bash
# Runs the test suite with the standard library only.
set -euo pipefail
cd "$(dirname "$0")"
python3 -m unittest discover -s tests -t . "$@"
