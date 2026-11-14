FROM maven:3.9-eclipse-temurin-25 AS build

WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x mvnw

RUN ./mvnw dependency:go-offline -B

COPY src src

RUN ./mvnw clean package -DskipTests -B


FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

ENV PORT=8082

EXPOSE 8082

ENTRYPOINT ["sh", "-c", "exec java -Dserver.port=${PORT:-8082} -jar app.jar"]
