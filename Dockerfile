FROM node:18

WORKDIR /opt/app
EXPOSE 8080
CMD ["node", "src/index.js"]

ADD ./ /opt/app/
