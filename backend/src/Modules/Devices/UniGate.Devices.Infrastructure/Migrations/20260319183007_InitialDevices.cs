using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniGate.Devices.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialDevices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "devices");

            migrationBuilder.CreateTable(
                name: "reader_devices",
                schema: "devices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DoorId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ApiKeyHash = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastSeenAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reader_devices", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_reader_devices_Code",
                schema: "devices",
                table: "reader_devices",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_reader_devices_DoorId",
                schema: "devices",
                table: "reader_devices",
                column: "DoorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "reader_devices",
                schema: "devices");
        }
    }
}
