FROM node:18.7

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

CMD npm run start:dev