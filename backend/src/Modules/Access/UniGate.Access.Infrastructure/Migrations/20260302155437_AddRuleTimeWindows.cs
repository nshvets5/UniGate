using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniGate.Access.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRuleTimeWindows : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DaysMask",
                schema: "access",
                table: "rules",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "EndTime",
                schema: "access",
                table: "rules",
                type: "time without time zone",
                nullable: true);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "StartTime",
                schema: "access",
                table: "rules",
                type: "time without time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ValidFrom",
                schema: "access",
                table: "rules",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ValidTo",
                schema: "access",
                table: "rules",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DaysMask",
                schema: "access",
                table: "rules");

            migrationBuilder.DropColumn(
                name: "EndTime",
                schema: "access",
                table: "rules");

            migrationBuilder.DropColumn(
                name: "StartTime",
                schema: "access",
                table: "rules");

            migrationBuilder.DropColumn(
                name: "ValidFrom",
                schema: "access",
                table: "rules");

            migrationBuilder.DropColumn(
                name: "ValidTo",
                schema: "access",
                table: "rules");
        }
    }
}
