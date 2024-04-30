FROM python:3.11-slim as base

WORKDIR /app

# Instalacja narzędzi pomocniczych i narzędzi kompilacji
RUN apt-get update && apt-get install -y \
    wget \
    libaio1 \
    unzip \
    iputils-ping \
    gcc \
    make \
    libpq-dev \
    && mkdir -p /opt/oracle \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Kopiowanie i instalacja Oracle Instant Client
COPY ./oracle_client/instantclient-basic-linux.arm64-19.22.0.0.0dbru.zip /opt/oracle/
RUN cd /opt/oracle \
    && unzip instantclient-basic-linux.arm64-19.22.0.0.0dbru.zip \
    && rm -f instantclient-basic-linux.arm64-19.22.0.0.0dbru.zip \
    && echo /opt/oracle/instantclient_19_22 > /etc/ld.so.conf.d/oracle-instantclient.conf \
    && ldconfig

# Ustawienie zmiennych środowiskowych dla Oracle Instant Client
ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_19_22:$LD_LIBRARY_PATH
ENV ORACLE_HOME=/opt/oracle/instantclient_19_22

# Instalacja Poetry i zależności projektu
RUN pip install "poetry==1.8.2"
COPY pyproject.toml poetry.lock* ./
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --only main

# Kopiowanie reszty plików aplikacji
COPY . .

# Eksponowanie portu na którym działa aplikacja
EXPOSE 8000

# Polecenie startowe aplikacji
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
