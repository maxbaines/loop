#!/bin/bash
# Sandbox management script for loop
# Creates, starts, and attaches to named Docker containers

set -e

CONTAINER_PREFIX="loop"
IMAGE_NAME="loop"

usage() {
    echo "Usage: sandbox.sh <name>"
    echo ""
    echo "Creates or attaches to a sandboxed loop container."
    echo ""
    echo "Arguments:"
    echo "  name    Name for the sandbox container (e.g., 'myproject')"
    echo ""
    echo "Examples:"
    echo "  sandbox.sh myproject     # Create/attach to 'loop-myproject'"
    echo "  sandbox.sh feature-x     # Create/attach to 'loop-feature-x'"
    exit 1
}

# Check if name provided
if [ -z "$1" ]; then
    usage
fi

NAME="$1"
CONTAINER_NAME="${CONTAINER_PREFIX}-${NAME}"
WORKSPACE_DIR="$(pwd)"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    🐳 Loop Sandbox                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📦 Container: $CONTAINER_NAME"
echo "📁 Workspace: $WORKSPACE_DIR"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "   Please start Docker and try again."
    exit 1
fi

# Check if image exists
if ! docker image inspect "$IMAGE_NAME" > /dev/null 2>&1; then
    echo "❌ Error: Docker image '$IMAGE_NAME' not found"
    echo "   Build it first with: docker build -t loop ."
    exit 1
fi

# Check if container exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    # Container exists
    echo "✓ Found existing container"
    
    # Check if running
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo "✓ Container is running"
    else
        echo "⏳ Starting container..."
        docker start "$CONTAINER_NAME" > /dev/null
        echo "✓ Container started"
    fi
else
    # Container doesn't exist - create it
    echo "⏳ Creating new container..."
    
    # Build docker run command with env vars
    DOCKER_RUN_CMD="docker run -d"
    DOCKER_RUN_CMD="$DOCKER_RUN_CMD --name $CONTAINER_NAME"
    
    # Pass through environment variables (if set)
    [ -n "$ANTHROPIC_API_KEY" ] && DOCKER_RUN_CMD="$DOCKER_RUN_CMD -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY"
    [ -n "$RALPH_MODEL" ] && DOCKER_RUN_CMD="$DOCKER_RUN_CMD -e RALPH_MODEL=$RALPH_MODEL"
    [ -n "$RALPH_MAX_TOKENS" ] && DOCKER_RUN_CMD="$DOCKER_RUN_CMD -e RALPH_MAX_TOKENS=$RALPH_MAX_TOKENS"
    [ -n "$RALPH_VERBOSE" ] && DOCKER_RUN_CMD="$DOCKER_RUN_CMD -e RALPH_VERBOSE=$RALPH_VERBOSE"
    [ -n "$RALPH_PRD_FILE" ] && DOCKER_RUN_CMD="$DOCKER_RUN_CMD -e RALPH_PRD_FILE=$RALPH_PRD_FILE"
    [ -n "$RALPH_PROGRESS_FILE" ] && DOCKER_RUN_CMD="$DOCKER_RUN_CMD -e RALPH_PROGRESS_FILE=$RALPH_PROGRESS_FILE"
    
    # Mount workspace
    DOCKER_RUN_CMD="$DOCKER_RUN_CMD -v $WORKSPACE_DIR:/workspace"
    
    # Expose web terminal port (use different port per container to avoid conflicts)
    # Hash the container name to get a consistent port offset
    PORT_OFFSET=$(echo "$CONTAINER_NAME" | cksum | cut -d' ' -f1)
    PORT_OFFSET=$((PORT_OFFSET % 1000))
    WEB_PORT=$((7681 + PORT_OFFSET))
    DOCKER_RUN_CMD="$DOCKER_RUN_CMD -p $WEB_PORT:7681"
    
    # Add image name
    DOCKER_RUN_CMD="$DOCKER_RUN_CMD $IMAGE_NAME"
    
    # Run the command
    eval "$DOCKER_RUN_CMD" > /dev/null
    
    echo "✓ Container created"
    echo "🌐 Web terminal available at: http://localhost:$WEB_PORT"
fi

echo ""
echo "🚀 Connecting to sandbox..."
echo "   Type 'exit' to leave (container keeps running)"
echo "   Run 'docker stop $CONTAINER_NAME' to stop the container"
echo ""
echo "════════════════════════════════════════════════════════════════"

# Attach to container with interactive shell
exec docker exec -it -w /workspace "$CONTAINER_NAME" bash
