FROM node:20-slim

WORKDIR /src

# Instalamos dependencias globales necesarias
RUN npm install -g nuxi

COPY package*.json ./
RUN npm install

COPY . .

# Exponemos el puerto por defecto de Nuxt
EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]