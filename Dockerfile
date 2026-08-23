FROM node:22

WORKDIR /app

ARG USER_ID=1000
ARG GROUP_ID=1000

RUN usermod -u $USER_ID node && groupmod -g $GROUP_ID node

# Copiem els fitxers de dependències primer
COPY package*.json ./

# Instal·lem totes les llibreries (inclosa 'resend') DINS del contenidor
RUN npm install

# Copiem la resta del codi
COPY . .

USER node

EXPOSE 4321

# Comanda per mantenir el servidor en marxa en mode desenvolupament
CMD ["npm", "run", "dev", "--", "--host"]