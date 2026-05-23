#!/bin/sh
set -e

if [ -n "$CLIENT_APP_URL" ] && ! echo "$CLIENT_APP_URL" | grep -qE '^https?://[a-zA-Z0-9._-]+(:[0-9]+)?$'; then
  echo "[warn] CLIENT_APP_URL looks invalid: $CLIENT_APP_URL"
fi

exec nginx -g 'daemon off;'
