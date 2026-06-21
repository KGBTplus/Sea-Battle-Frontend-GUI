# === Этап 1: Сборка приложения ===
FROM node:20-alpine as builder

WORKDIR /app

# Объявляем аргумент сборки. Если при сборке ничего не передать, 
# подставится домен по умолчанию.
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# === Этап 2: Продакшен-сервер Nginx ===
FROM nginx:stable-alpine

# Копируем скомпилированную статику из билдера в папку Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Включаем поддержку SPA роутинга + прокси на backend
RUN echo 'server { \
    listen 80; \
    location /api/ { \
        proxy_pass http://backend:8080/api/; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
    location /ws { \
        proxy_pass http://backend:8080/ws; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
    } \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Ingress внутри кластера обычно ожидает от подов 80-й порт
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]