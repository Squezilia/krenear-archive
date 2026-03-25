FROM nginx:latest

RUN rm -rf /usr/share/nginx/html/*
COPY ./dist/. ./usr/share/nginx/html/
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf 