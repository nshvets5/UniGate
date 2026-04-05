using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniGate.Devices.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReaderScanAttempts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "reader_scan_attempts",
                schema: "devices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReaderId = table.Column<Guid>(type: "uuid", nullable: false),
                    CredentialType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    CredentialValue = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    CredentialId = table.Column<Guid>(type: "uuid", nullable: true),
                    StudentId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsAllowed = table.Column<bool>(type: "boolean", nullable: false),
                    ReasonCode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    OccurredAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reader_scan_attempts", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_reader_scan_attempts_OccurredAt",
                schema: "devices",
                table: "reader_scan_attempts",
                column: "OccurredAt");

            migrationBuilder.CreateIndex(
                name: "IX_reader_scan_attempts_ReaderId",
                schema: "devices",
                table: "reader_scan_attempts",
                column: "ReaderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "reader_scan_attempts",
                schema: "devices");
        }
    }
}
