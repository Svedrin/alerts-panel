FROM node:alpine

RUN apk add --no-cache dumb-init
WORKDIR /app

COPY package*.json /app/
RUN npm install

COPY . /app

EXPOSE 8080

ENTRYPOINT ["dumb-init", "--"]
CMD [ "node", "server.js" ]
