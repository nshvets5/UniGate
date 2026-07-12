using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniGate.Devices.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMobileCredentialTokens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "mobile_credential_tokens",
                schema: "devices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentId = table.Column<Guid>(type: "uuid", nullable: false),
                    IssuedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UsedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mobile_credential_tokens", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_mobile_credential_tokens_ExpiresAt",
                schema: "devices",
                table: "mobile_credential_tokens",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_mobile_credential_tokens_StudentId",
                schema: "devices",
                table: "mobile_credential_tokens",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_mobile_credential_tokens_StudentId_ExpiresAt_UsedAt",
                schema: "devices",
                table: "mobile_credential_tokens",
                columns: new[] { "StudentId", "ExpiresAt", "UsedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "mobile_credential_tokens",
                schema: "devices");
        }
    }
}
