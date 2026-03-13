#!/bin/sh
set -e

# Replace hardcoded localhost URLs with paths served by this nginx (single port)
if [ -n "$APP_SERVER_URL" ]; then
  find /usr/share/nginx/html/assets -name '*.js' -exec sed -i \
    -e "s|http://localhost:48922/trpc|/trpc|g" \
    -e "s|ws://localhost:48923|/collab|g" \
    -e "s|ws://localhost:48924|/realtime|g" \
    {} +
fi

exec nginx -g 'daemon off;'
