FROM node:20

WORKDIR /app

# Copy only package files first (cache optimization)
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install Node deps
WORKDIR /app/client
RUN npm install

WORKDIR /app/server
RUN npm install

# Install Python
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv

# Create venv for ML
WORKDIR /app/ml_engine
COPY ml_engine/requirements.txt .

RUN python3 -m venv venv && \
    . venv/bin/activate && \
    pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy rest of project
WORKDIR /app
COPY . .

EXPOSE 5000
CMD ["node", "server/server.js"]