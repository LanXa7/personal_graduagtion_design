FROM openjdk:24-jdk-slim

LABEL authors="Lanmao"
LABEL version="1.0"
LABEL description="Spring Boot Application"

COPY /service/build/libs/service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8085

ENTRYPOINT ["java", "-jar", "app.jar"]