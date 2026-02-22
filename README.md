# UniGate Backend

Enterprise-grade modular monolith for automated access control in educational institutions.

## Stack

- .NET 8
- ASP.NET Core
- Keycloak (OIDC)
- PostgreSQL
- Docker

## Local development

Start infrastructure:

cd infra
docker compose up -d

Keycloak:
http://localhost:8081
admin / admin

Run API:
cd backend/src/UniGate.Api
dotnet run
