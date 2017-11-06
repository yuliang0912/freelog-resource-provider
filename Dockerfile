FROM daocloud.io/node:8.1.2

MAINTAINER yuliang <yuliang@ciwong.com>

RUN mkdir -p /data/freelog-resource-provider

WORKDIR /data/freelog-resource-provider

COPY . /data/freelog-resource-provider

RUN npm install

#ENV
#VOLUME ['/opt/logs','/opt/logs/db','/opt/logs/koa','/opt/logs/track']

ENV EGG_SERVER_ENV prod
ENV PORT 7001

EXPOSE 7001

CMD [ "npm", "start" ]
