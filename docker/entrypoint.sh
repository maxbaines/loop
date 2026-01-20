#!/bin/bash
# Entrypoint script for loop container

echo "================================================"
echo "  Loop - Autonomous AI Coding Agent"
echo "================================================"
echo ""
echo "Available commands:"
echo "  loop              - Run the AI coding agent"
echo "  terminal.sh start - Start web terminal"
echo "  terminal.sh stop  - Stop web terminal"
echo ""
echo "Container is ready!"
echo "================================================"

# Run ttyd in foreground (keeps container alive and handles reconnects properly)
TTYD_PORT=${TTYD_PORT:-7681}
TTYD_USER=${TTYD_USER:-admin}
TTYD_PASSWORD=${TTYD_PASSWORD:-loop}

echo ""
echo "Starting web terminal on port $TTYD_PORT..."
echo "  Username: $TTYD_USER"
echo "  Password: $TTYD_PASSWORD"
echo ""

exec ttyd -W -p $TTYD_PORT -c "$TTYD_USER:$TTYD_PASSWORD" /bin/bash -l
