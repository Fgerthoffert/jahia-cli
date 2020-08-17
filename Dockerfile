FROM circleci/node:14.6.0-browsers

LABEL Francois Gerthoffert

# Add bash
RUN sudo apt-get install bash

RUN sudo npm install -g jahia-cli@latest  --unsafe-perm=true
RUN sudo npm install -g dotenv

CMD ["/bin/bash", "-c", "jahia-cli --help"]