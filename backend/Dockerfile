# ---- Fase de Construcción ----
FROM node:20-alpine AS development

WORKDIR /usr/src/app

# Copia el package.json y el lockfile
COPY package*.json ./

# Instala TODAS las dependencias, incluidas las de desarrollo como @nestjs/cli
RUN npm install

# Copia el resto del código
COPY . .

# No es necesario un build aquí para el modo de desarrollo

# El comando por defecto se manejará desde docker-compose
CMD ["npm", "run", "start:dev"]