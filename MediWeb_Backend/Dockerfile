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

# Run with correct PostgreSQL URL format (host:port/database)
CMD ["sh","-lc","java -Dserver.port=${PORT:-8080} -jar target/*.jar"]