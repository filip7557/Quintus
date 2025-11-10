# ============================
# Build stage
# ============================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
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
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .
# Copy source code, not just publish output
COPY ../Quintus/ ./Quintus/
# Install EF Core CLI tool globally
RUN dotnet tool install --global dotnet-ef --version 8.* && \
    export PATH="$PATH:/root/.dotnet/tools"
# Copy entrypoint script
COPY ./Quintus/Quintus.WebAPI/entrypoint.sh .
RUN chmod +x entrypoint.sh
ENV ASPNETCORE_URLS="http://+:8080;https://+:8443"
EXPOSE 8080 8443
ENTRYPOINT ["./entrypoint.sh"]
