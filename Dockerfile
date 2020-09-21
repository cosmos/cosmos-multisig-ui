FROM golang:1.15.2

# install git
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y git

# install gaiacli
RUN git clone -b v2.0.13 https://github.com/cosmos/gaia
RUN cd gaia && make install

# set gaiacli config
RUN gaiacli config node https://cosmos.chorus.one:26657
RUN gaiacli config chain-id cosmoshub-3

# install node
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs

# setup directory
RUN mkdir -p /usr/src
WORKDIR /usr/src

# copy source files
COPY . /usr/src

# install dependencies
RUN npm install

# reset database
RUN node database/initialize.js

# start app
RUN npm run build
EXPOSE 3000
CMD npm run start