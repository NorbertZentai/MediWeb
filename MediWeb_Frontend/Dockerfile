FROM node:18

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

ENV CHOKIDAR_USEPOLLING=1

CMD ["npm", "run", "web"]