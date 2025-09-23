# This is a small docker + alpine image used as a base image for node server
FROM node:24.6.0-alpine3.22

# Create a dev user and set him as default user
RUN : \
    && addgroup server && adduser -S -G server server \
    && mkdir \server && chown server:server /server \
    && :

# This defines the base directory where the containers needs to copy all files of the server
WORKDIR /server

# This copies all package extension files and run install to make sure cache remains in next image build
COPY package*.json ./
RUN npm install

# # Declare build-time variable
# ARG VITE_API_URL
# # Make it available as environment variable inside container
# ENV VITE_API_URL=$VITE_API_URL

# This copies all files of current dir inside the WORKDIR
COPY . ./

# As Root user give access of server dir and subdirs to server user
RUN chown -R server:server /server

# Switch to user server instead of root user
USER server

# This is where the new container will serve the backend route
EXPOSE 3000

# This is the command to start the server however RUN is used during build here the execution context stops
CMD ["npm","run","dev"]

# docker volume create server-data creates a volume named server-data
# docker run -d -p 3000:3000 -v server-data:/server/data [imageName] creates or presists a volume inside running container
# the above will presist inside image even if once the container is deleted and new one is started

# binding container files to host files
# docker run -d -p 3000:3000 -v $(pwd):/server [imageName] maps current working directory to containers working directory under the hood
