using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniGate.Devices.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReaderOfflineAlertTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LastOfflineAlertAt",
                schema: "devices",
                table: "reader_devices",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastOfflineAlertAt",
                schema: "devices",
                table: "reader_devices");
        }
    }
}
