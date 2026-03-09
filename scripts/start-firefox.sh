#!/bin/bash

# We use --firefox-profile to point to our custom folder
# --keep-profile-changes ensures that once we "accept" the notice, it's saved there.
web-ext run \
  --source-dir ./dist \
  --firefox=firefoxdeveloperedition \
  --start-url https://chat.mistral.ai/chat \
  --firefox-profile=./.firefox-dev-profile \
  --keep-profile-changes