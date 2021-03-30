# ビルド環境
FROM node:14.16.0-alpine as build-stage
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY . .
ENV VUE_APP_API_URL 'http://localhost:9001/v1'
RUN npm run build

# サーバー環境
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
