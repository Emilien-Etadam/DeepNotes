#!/bin/sh
set -e

if ! echo "$CLIENT_APP_URL" | grep -qE '^https?://[a-zA-Z0-9._-]+(:[0-9]+)?$'; then
  echo "[warn] CLIENT_APP_URL looks invalid: $CLIENT_APP_URL"
fi

# Build absolute WebSocket URLs from CLIENT_APP_URL
if [ -n "$CLIENT_APP_URL" ]; then
  # Convert http(s)://host to ws(s)://host
  WS_BASE=$(echo "$CLIENT_APP_URL" | sed 's|^http|ws|')
  
  echo "Injecting URLs: APP=$CLIENT_APP_URL, WS_BASE=$WS_BASE"
  
  find /usr/share/nginx/html/assets -name '*.js' -exec sed -i \
    -e "s|http://localhost:48922/trpc|${CLIENT_APP_URL}/trpc|g" \
    -e "s|ws://localhost:48923|${WS_BASE}/collab|g" \
    -e "s|ws://localhost:48924|${WS_BASE}/realtime|g" \
    {} +
fi

exec nginx -g 'daemon off;'
