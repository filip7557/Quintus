# ============================
# Build stage
# ============================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy the solution and project files first (for caching)
COPY Quintus/Quintus.sln ./
COPY Quintus/Quintus.WebAPI/Quintus.WebAPI.csproj Quintus/Quintus.WebAPI/
COPY Quintus/Quintus.Repository/Quintus.Repository.csproj Quintus/Quintus.Repository/
COPY Quintus/Quintus.Common/Quintus.Common.csproj Quintus/Quintus.Common/
COPY Quintus/Quintus.Service/Quintus.Service.csproj Quintus/Quintus.Service/
COPY Quintus/Quintus.Model/Quintus.Model.csproj Quintus/Quintus.Model/
COPY Quintus/Quintus.Repository.Common/Quintus.Repository.Common.csproj Quintus/Quintus.Repository.Common/
COPY Quintus/Quintus.Service.Common/Quintus.Service.Common.csproj Quintus/Quintus.Service.Common/

# Copy entrypoint script
COPY Quintus/Quintus.WebAPI/entrypoint.sh ./entrypoint.sh
RUN sed -i 's/\r$//' ./entrypoint.sh && chmod +x ./entrypoint.sh

# Restore dependencies
RUN dotnet restore Quintus/Quintus.WebAPI/Quintus.WebAPI.csproj
RUN dotnet restore Quintus/Quintus.Service/Quintus.Service.csproj
RUN dotnet restore Quintus/Quintus.Repository/Quintus.Repository.csproj

# Copy everything and build
COPY Quintus/ ./Quintus/
WORKDIR /src/Quintus/Quintus.WebAPI
RUN dotnet publish -c Release -o /app/out

# ============================
# Runtime stage
# ============================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/out .
COPY --from=build /src/entrypoint.sh /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

ENV ASPNETCORE_URLS="http://+:8080"
EXPOSE 8080
ENTRYPOINT ["./entrypoint.sh"]
