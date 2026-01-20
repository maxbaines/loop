# syntax=docker/dockerfile:1

# Base image with common development tools
FROM ubuntu:22.04

# Avoid prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install essential packages and SSH server
RUN apt-get update && apt-get install -y \
    openssh-server \
    curl \
    wget \
    git \
    vim \
    nano \
    htop \
    unzip \
    sudo \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# Configure SSH
RUN mkdir /var/run/sshd \
    && echo 'root:loop' | chpasswd \
    && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config \
    && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

# SSH port
EXPOSE 22

# Create workspace directory
RUN mkdir -p /workspace
WORKDIR /workspace

# Copy loop application
COPY package.json bun.lockb /app/
WORKDIR /app
RUN bun install --frozen-lockfile --production
COPY src /app/src
COPY tsconfig.json /app/

# Add loop to PATH
RUN echo 'alias loop="bun run /app/src/index.ts"' >> /root/.bashrc

# Set workspace as default directory
WORKDIR /workspace

# Start SSH daemon
CMD ["/usr/sbin/sshd", "-D"]
