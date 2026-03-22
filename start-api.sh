#!/bin/bash
export BUN_INSTALL="/root/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
cd /root/localprint
exec bun run server/index.ts
