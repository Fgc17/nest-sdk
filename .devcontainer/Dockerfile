FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bookworm

RUN npm install -g pnpm

RUN npm install -g @nestjs/cli

RUN echo 'export PNPM_HOME="/home/node/.local/share/pnpm"' >> /home/node/.bashrc && \
    echo 'case ":$PATH:" in' >> /home/node/.bashrc && \
    echo '  *":$PNPM_HOME:"*) ;;' >> /home/node/.bashrc && \
    echo '  *) export PATH="$PNPM_HOME:$PATH" ;;' >> /home/node/.bashrc && \
    echo 'esac' >> /home/node/.bashrc

RUN sudo apt-get update