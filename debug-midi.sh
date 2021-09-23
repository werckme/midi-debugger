#!/bin/sh
cwd="$(cd "$(dirname "$0")" && pwd -P)"
node $cwd/src/localServerApp/server.js $1