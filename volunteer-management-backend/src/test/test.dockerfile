FROM node:14

WORKDIR / /mnt/c/Users/Nikita/Downloads/API

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "test"]
