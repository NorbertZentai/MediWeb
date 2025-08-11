# Használjuk az OpenJDK 17-et
FROM eclipse-temurin:17-jdk

# Állítsuk be a munkakönyvtárat a konténerben
WORKDIR /app

# Másoljuk be a teljes projektet
COPY . .

# A mvnw legyen futtatható (ha wrapper-t használsz)
RUN chmod +x mvnw

# A backend portját kinyitjuk
EXPOSE 8080

# Fejlesztői indítás: automatikus újrafordítás + újraindulás devtools segítségével
CMD ["./mvnw", "spring-boot:run"]