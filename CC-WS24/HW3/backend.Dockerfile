# Use the official Nginx image as the base
FROM nginx:1.25-alpine

# Copy the backend Nginx configuration file into the container
COPY backend.nginx.conf /etc/nginx/nginx.conf

# Expose port 8080 to allow external access to the container
EXPOSE 8080

# Run Nginx in the foreground to keep the container running
CMD ["nginx", "-g", "daemon off;"]

