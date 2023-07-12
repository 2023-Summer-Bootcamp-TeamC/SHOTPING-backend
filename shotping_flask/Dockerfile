# Dockerfile

# Set base image (host OS)
FROM python:3.8

# By default, listen on port 5000
EXPOSE 5000/tcp

# Set the working directory in the container
WORKDIR /app

# Copy the dependencies file to the working directory
COPY requirements.txt .

# Install any dependencies
RUN pip install -r requirements.txt

RUN apt-get update
RUN apt-get -y install libgl1-mesa-glx

# Copy the content of the local src directory to the working directory in the container
COPY . .

ENV PYTHONDONTWRITEBYTECODE 1


# Specify the command to run on container start
CMD ["gunicorn", "-b", ":5000", "app:app"]
