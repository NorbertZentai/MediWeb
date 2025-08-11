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

# Create startup script to handle DATABASE_URL conversion
RUN echo '#!/bin/bash\n\
if [ ! -z "$DATABASE_URL" ] && [ -z "$SPRING_DATASOURCE_URL" ]; then\n\
  export SPRING_DATASOURCE_URL="jdbc:$DATABASE_URL"\n\
fi\n\
java -jar target/*.jar' > start.sh && chmod +x start.sh

# Run the application
CMD ["./start.sh"]