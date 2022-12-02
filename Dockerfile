FROM cypress/base:14.21.1

RUN mkdir /app
WORKDIR /app

COPY . /app 
RUN npm install --save-dev cypress

RUN $(npm bin)/cypress verify

RUN ["npm", "run", "cypress:e2e"]