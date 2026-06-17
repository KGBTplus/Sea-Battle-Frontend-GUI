# === Этап 1: Сборка приложения ===
FROM node:20-alpine as builder

WORKDIR /app

# Объявляем аргумент сборки. Если при сборке ничего не передать, 
# подставится домен по умолчанию.
ARG VITE_API_URL=http://team4.verstack.ru
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# === Этап 2: Продакшен-сервер Nginx ===
FROM nginx:stable-alpine

# Копируем скомпилированную статику из билдера в папку Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Включаем поддержку SPA роутинга (чтобы при перезагрузке страницы /game не было 404)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Ingress внутри кластера обычно ожидает от подов 80-й порт
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]