# FROM --platform=linux/x86_64 ubuntu:22.04
FROM ubuntu:22.04

# replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Prepare workdir
WORKDIR /root/dfx

ENV NVM_DIR=/root/.nvm
ENV NVM_VERSION=v0.39.5
ENV NODE_VERSION=18

ENV RUSTUP_HOME=/opt/rustup
ENV CARGO_HOME=/opt/cargo
ENV RUST_VERSION=1.62.0

ENV DFX_VERSION=0.14.1

RUN apt -yq update && \
    apt -yqq install --no-install-recommends curl ca-certificates \
    build-essential pkg-config libssl-dev llvm-dev liblmdb-dev clang cmake rsync \
    libunwind8

RUN apt install -y nginx
COPY ./nginx/dfx-proxy.conf /etc/nginx/conf.d/default.conf

ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin:${PATH}"
RUN curl --fail -sSf https://raw.githubusercontent.com/creationix/nvm/${NVM_VERSION}/install.sh | bash
RUN . "${NVM_DIR}/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "${NVM_DIR}/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "${NVM_DIR}/nvm.sh" && nvm alias default v${NODE_VERSION}
# RUN npm install -g npm@latest TODO: Install a specific npm version

ENV PATH=/opt/cargo/bin:${PATH}
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y && \
    rustup target add wasm32-unknown-unknown && \
    cargo install ic-wasm

RUN sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Install dfx
RUN sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"

CMD ["nginx", "-g", "daemon off;"]
# SHELL ["/bin/bash", "-c"]
