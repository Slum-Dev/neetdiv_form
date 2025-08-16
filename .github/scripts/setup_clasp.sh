#!/bin/sh

CLASP=$(cat << EOF
  {
    "scriptId": "$SCRIPT_ID",
    "rootDir": "dist/",
    "scriptExtensions": [
      ".js",
      ".gs"
    ],
    "htmlExtensions": [
      ".html"
    ],
    "jsonExtensions": [
      ".json"
    ],
    "filePushOrder": [],
    "skipSubdirectories": false
  }
EOF
)

echo $CLASP > .clasp.json
