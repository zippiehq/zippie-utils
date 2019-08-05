from node:8.12.0

WORKDIR /tests
ADD . /tests

RUN npm install

RUN npm run test-services