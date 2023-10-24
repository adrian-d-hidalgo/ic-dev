FROM idealizer/dfx-core

ENV RUST_BACKTRACE=full
ENV RUSTUP_HOME=/rust
ENV CARGO_HOME=/cargo
ENV PATH=/cargo/bin:/rust/bin:$PATH

RUN apt-get update

# Required by Azle
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    build-essential \
    libssl-dev \
    clang \
    pkg-config

# Additional? (Are required?)
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    libunwind8 \
    ca-certificates \
    libdigest-sha-perl \
    cmake \
    git \
    rsync \
    ssh

# Clean
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Rust
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y && \
    rustup target add wasm32-unknown-unknown

COPY deploy.sh deploy.sh
COPY new.sh new.sh
COPY start.sh start.sh

CMD tail -f /dev/null
SHELL ["/bin/bash", "-c"]