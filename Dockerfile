FROM node:22

WORKDIR /app

ARG USER_ID=1000
ARG GROUP_ID=1000

RUN usermod -u $USER_ID node && groupmod -g $GROUP_ID node

USER node

EXPOSE 4321