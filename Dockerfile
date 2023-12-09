FROM ubuntu:latest
RUN apt-get update && \
    apt-get install -y \
    build-essential \
    python3-pip net-tools \
    iputils-ping \
    iproute2 curl


RUN apt-get install -y ca-certificates gnupg
RUN  mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN NODE_MAJOR=20
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update
RUN apt-get install nodejs -y

EXPOSE 6001