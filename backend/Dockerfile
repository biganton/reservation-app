FROM python:3.11-slim as base

WORKDIR /app

# Instalacja narzędzi pomocniczych, Oracle Instant Client i narzędzi kompilacji
RUN apt-get update && apt-get install -y \
    wget \
    libaio1 \
    unzip \
    iputils-ping \
    gcc \
    make \
    libpq-dev \
    && mkdir -p /opt/oracle \
    && cd /opt/oracle \
    && wget https://download.oracle.com/otn_software/linux/instantclient/1922000/instantclient-basic-linux.arm64-19.22.0.0.0dbru.zip \
    && unzip instantclient-basic-linux.arm64-19.22.0.0.0dbru.zip \
    && rm -f instantclient-basic-linux.arm64-19.22.0.0.0dbru.zip \
    && echo /opt/oracle/instantclient_19_22 > /etc/ld.so.conf.d/oracle-instantclient.conf \
    && ldconfig \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Update the environment variables to match the correct Oracle Instant Client version
ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_19_22:$LD_LIBRARY_PATH
ENV ORACLE_HOME=/opt/oracle/instantclient_19_22

RUN pip install "poetry==1.8.2"

COPY pyproject.toml poetry.lock* ./

RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --only main

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
