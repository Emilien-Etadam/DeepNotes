#!/bin/sh
set -e

# Replace hardcoded localhost URLs with runtime values
if [ -n "$APP_SERVER_URL" ]; then
  find /usr/share/nginx/html/assets -name '*.js' -exec sed -i \
    -e "s|http://localhost:48922/trpc|${APP_SERVER_URL}|g" \
    -e "s|ws://localhost:48923|${COLLAB_SERVER_URL}|g" \
    -e "s|ws://localhost:48924|${REALTIME_SERVER_URL}|g" \
    {} +
fi

exec nginx -g 'daemon off;'
