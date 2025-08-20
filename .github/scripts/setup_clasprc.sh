#!/bin/sh

CLASPRC=$(cat << EOF
  {
    "tokens": {
      "default": {
        "client_id": "$CLIENT_ID",
        "client_secret": "$CLIENT_SECRET",
        "type": "authorized_user",
        "refresh_token": "$REFRESH_TOKEN",
        "access_token": "$ACCESS_TOKEN"
      }
    }
  }
EOF
)

echo $CLASPRC > ~/.clasprc.json
