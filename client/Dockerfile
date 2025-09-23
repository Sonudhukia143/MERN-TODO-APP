# This is a small docker + alpine image used as a base image for node frontend
FROM node:24.6.0-alpine3.22

# Create a dev user and set him as default user
RUN : \
    && addgroup client && adduser -S -G client client \
    && mkdir /client \
    && :

# This defines the base directory where the containers needs to copy all files of the frontend
WORKDIR /client

# This copies all package extension files and run install to make sure cache remains in next image build
COPY package*.json ./
RUN npm install

# This copies all files of current dir inside the WORKDIR
COPY . ./

# As Root user give access of frontend dir and subdirs to frontend user
RUN chown -R client:client /client

# Switch to user frontend instead of root user
USER client

# This is where the new container will serve the backend route
EXPOSE 5173


RUN [ "npm", "run", "build" ]

# This is the command to start the server however RUN is used during build here the execution context stops
CMD ["npm","run","dev"]

# docker volume create frontend-data creates a volume named frontend-data
# docker run -d -p 5173:5173 -v frontend-data:/frontend/data [imageName] creates or presists a volume inside running container
# the above will presist inside image even if once the container is deleted and new one is started

# binding container files to host files
# docker run -d -p 5173:5173 -v $(pwd):/frontend [imageName] maps current working directory to containers working directory under the hood
