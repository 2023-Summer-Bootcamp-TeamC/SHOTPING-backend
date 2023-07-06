FROM node:14
# 앱 디렉터리 생성
WORKDIR /usr/src/app


COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080
CMD [ "node", "index.js" ]  