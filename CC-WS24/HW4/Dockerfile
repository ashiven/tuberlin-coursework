# Base Python image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy scheduler script
COPY scheduler.py .

# Expose default port (if necessary)
EXPOSE 8080

# Set the entrypoint
ENTRYPOINT ["python", "scheduler.py"]
