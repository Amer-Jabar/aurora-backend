FROM node:16

WORKDIR /usr/src/app

RUN mkdir uploads
RUN mkdir uploads/images
RUN mkdir uploads/images/profile
RUN mkdir uploads/images/product

COPY package*.json /usr/src/app/

ENV NODE_ENV production
ENV PORT 4445
ENV DB_HOSTNAME mongo
ENV DB_PORT 27017
ENV DB_NAME nextjsApp
ENV something_else fdgdfg

RUN npm install

COPY . .

EXPOSE 4445

CMD [ "npm", "start" ]