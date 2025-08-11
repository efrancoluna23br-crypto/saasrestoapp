# Usamos una imagen base un poco más completa para evitar problemas de compilación
FROM node:20-slim

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos solo los archivos de dependencias
COPY package.json package-lock.json* ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código de la aplicación
# Esto se usará si no hay un volumen montado
COPY . .

# Exponemos el puerto 3000 donde corre Next.js
EXPOSE 3000

# El comando por defecto, que será sobreescrito por docker-compose
CMD ["npm", "run", "dev"]