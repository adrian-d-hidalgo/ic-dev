FROM --platform=linux/amd64 ubuntu

WORKDIR /root/dfx

RUN apt-get update

# Essentials
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    curl \
    ca-certificates

# Required by Azle
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    clang \
    build-essential \
    libssl-dev \
    pkg-config

# Additional? (Are required?)
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    libunwind8 \
    libdigest-sha-perl \
    cmake \
    git \
    rsync \
    ssh

# Prepare for IC SDK
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Instal Dfinity SDK
RUN sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"

# Intall Rust
ENV RUST_BACKTRACE=full
ENV RUSTUP_HOME=/rust
ENV CARGO_HOME=/cargo
ENV PATH=/cargo/bin:/rust/bin:$PATH
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y && \
    rustup target add wasm32-unknown-unknown

# Install NVM, Node and NPM
ENV NODE_VERSION=18
ENV NVM_DIR=/root/.nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash && \
    . $NVM_DIR/nvm.sh && \
    nvm install $NODE_VERSION && \
    nvm alias default $NODE_VERSION && \
    nvm use default
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/v$NODE_VERSION/bin:$PATH


CMD tail -f /dev/null
SHELL ["/bin/bash", "-c"]