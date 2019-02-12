FROM node:8-alpine

ENV DB_HOST localhost
ENV NODE_ENV test
ENV TZ America/Denver
ENV STAGE test

#Set timezone
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apk update && \
    npm install -g serverless && \
    npm install -g serverless-offline

EXPOSE 3000

USER node

WORKDIR /usr/src/app

COPY . .

ENTRYPOINT sls offline --stage ${STAGE}