FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY .docker.env .env

COPY . .

EXPOSE 8082

CMD ["npm", "run", "dev"]
