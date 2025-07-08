#!/bin/bash

cd "$(dirname "$0")/.."

~/.bun/bin/bun --bun scripts/check-apis.ts 