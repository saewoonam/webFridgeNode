FROM node:12-slim
WORKDIR /usr/app
COPY package.json .
RUN npm install --quiet
COPY . .
RUN npm run build
CMD ["npm", "start"]
