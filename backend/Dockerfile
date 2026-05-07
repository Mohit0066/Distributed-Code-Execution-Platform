FROM node:18

RUN apt-get update && apt-get install -y g++ default-jdk python3 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p /app/temp

EXPOSE 5001

CMD ["node", "server.js"]
