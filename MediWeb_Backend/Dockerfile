# Single stage build for simplicity
FROM eclipse-temurin:17-jdk

WORKDIR /app

# Install Maven
RUN apt-get update && \
    apt-get install -y maven && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy project files
COPY . .

# Build the application using Maven directly
RUN mvn clean package -DskipTests

# Expose port
EXPOSE 8080

# Run the application with hardcoded database URL
CMD java -Dspring.datasource.url="jdbc:postgresql://mediweb_user:8C0GeWooZ8sjiBoRtZyjkZoJqXBpduGd@dpg-d2cu8qre5dus73dtiv90-a/mediweb_db" \
         -Dspring.datasource.username="mediweb_user" \
         -Dspring.datasource.password="8C0GeWooZ8sjiBoRtZyjkZoJqXBpduGd" \
         -jar target/*.jar