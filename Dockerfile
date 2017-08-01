# Pull base image.
FROM yvnio/nodejs

MAINTAINER Grigor Khachatryan <g@yvn.io>

ARG env=testing

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /var/www/api.rodin.io && cp -a /tmp/node_modules /var/www/api.rodin.io/

WORKDIR /var/www/api.rodin.io
ADD . /var/www/api.rodin.io

EXPOSE 3000 4000

# CMD npm start
CMD ["sh", "-c", "export NODE_ENV=testing; npm start"]