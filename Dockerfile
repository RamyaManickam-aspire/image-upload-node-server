FROM node:20-slim
# Create and change to the app directory.
WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . ./

EXPOSE 8080

CMD [ "node", "server.js" ]