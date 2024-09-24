#BUILD STAGE
FROM node:alpine
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build
COPY . .
RUN npm run migration:generate
RUN npm run migration:up
EXPOSE 3000
CMD ["npm","run","start:dev"]

