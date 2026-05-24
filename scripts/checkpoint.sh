#!/bin/bash

# Load environment variables from .env.local if it exists
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Check if SUPABASE_PROJECT_ID is set
if [ -z "$SUPABASE_PROJECT_ID" ]; then
  echo "Error: SUPABASE_PROJECT_ID is not set in .env.local"
  exit 1
fi

TIMESTAMP=$(date +%m-%d-%Y-%H-%M)
FILENAME="supabase/backups/schema-$TIMESTAMP.sql"

echo "--------------------------------------------------------"
echo "[CHECKPOINT] ${NEXT_PUBLIC_SITE_NAME:-DANNFLOW} READY"
echo "--------------------------------------------------------"
echo ""
echo "Copy and paste the message below to your AI Agent:"
echo ""
echo "---"
echo "Hey Antigravity (or AI Agent), please perform a 'Vibe Checkpoint'."
echo "1. Verify Supabase MCP is connected."
echo "2. Read the live schema (Tables, Enums, RLS, Triggers) for project: $SUPABASE_PROJECT_ID"
echo "3. Save the full DDL to: $FILENAME"
echo "---"
echo ""
echo "Target path: $FILENAME"
echo "--------------------------------------------------------"
