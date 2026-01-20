#!/bin/bash
# Terminal control script for ttyd web terminal

TTYD_PORT=${TTYD_PORT:-7681}
TTYD_USER=${TTYD_USER:-admin}
TTYD_PASSWORD=${TTYD_PASSWORD:-loop}
TTYD_PID_FILE="/var/run/ttyd.pid"

start_terminal() {
    if pgrep -x ttyd > /dev/null; then
        echo "✓ Web terminal is already running on port $TTYD_PORT"
        return 0
    fi
    
    echo "Starting web terminal on port $TTYD_PORT..."
    echo "  Username: $TTYD_USER"
    echo "  Password: $TTYD_PASSWORD"
    ttyd -W -p $TTYD_PORT -c "$TTYD_USER:$TTYD_PASSWORD" /bin/bash -l &
    echo $! > $TTYD_PID_FILE
    sleep 1
    
    if pgrep -x ttyd > /dev/null; then
        echo "✓ Web terminal started successfully"
        echo "  Access at: http://localhost:$TTYD_PORT"
    else
        echo "✗ Failed to start web terminal"
        return 1
    fi
}

stop_terminal() {
    if ! pgrep -x ttyd > /dev/null; then
        echo "✓ Web terminal is not running"
        return 0
    fi
    
    echo "Stopping web terminal..."
    pkill -x ttyd
    rm -f $TTYD_PID_FILE
    sleep 1
    
    if ! pgrep -x ttyd > /dev/null; then
        echo "✓ Web terminal stopped"
    else
        echo "✗ Failed to stop web terminal"
        return 1
    fi
}

restart_terminal() {
    stop_terminal
    start_terminal
}

status_terminal() {
    if pgrep -x ttyd > /dev/null; then
        echo "✓ Web terminal is RUNNING on port $TTYD_PORT"
        echo "  PID: $(pgrep -x ttyd)"
    else
        echo "✗ Web terminal is STOPPED"
    fi
}

case "$1" in
    start)
        start_terminal
        ;;
    stop)
        stop_terminal
        ;;
    restart)
        restart_terminal
        ;;
    status)
        status_terminal
        ;;
    *)
        echo "Usage: terminal.sh {start|stop|restart|status}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the web terminal"
        echo "  stop    - Stop the web terminal"
        echo "  restart - Restart the web terminal"
        echo "  status  - Check if web terminal is running"
        exit 1
        ;;
esac
