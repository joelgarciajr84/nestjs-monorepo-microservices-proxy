FROM nginx:latest
COPY /nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
ENTRYPOINT [ "nginx" ]

CMD [ "-g", "daemon off;" ]