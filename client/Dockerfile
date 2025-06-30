# web-react/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copia dependencias y las instala
COPY package.json package-lock.json* ./
RUN npm install

# Copia el resto del código y genera el build
COPY . .
RUN npm run build

# Expone el puerto y arranca con `serve`
EXPOSE 3000
CMD ["npm", "run", "start"]
