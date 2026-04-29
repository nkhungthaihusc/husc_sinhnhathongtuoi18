FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies (installing full deps because build needs devDeps)
COPY package.json pnpm-lock.yaml ./
RUN npm install

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY . .

RUN npm run build

FROM nginx:stable-alpine


RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
