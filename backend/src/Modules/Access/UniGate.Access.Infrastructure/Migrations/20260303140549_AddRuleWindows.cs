using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniGate.Access.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRuleWindows : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.CreateTable(
                name: "rule_windows",
                schema: "access",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RuleId = table.Column<Guid>(type: "uuid", nullable: false),
                    DayOfWeekIso = table.Column<int>(type: "integer", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_rule_windows", x => x.Id);
                    table.ForeignKey(
                        name: "FK_rule_windows_rules_RuleId",
                        column: x => x.RuleId,
                        principalSchema: "access",
                        principalTable: "rules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_rule_windows_RuleId_DayOfWeekIso_StartTime_EndTime",
                schema: "access",
                table: "rule_windows",
                columns: new[] { "RuleId", "DayOfWeekIso", "StartTime", "EndTime" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "rule_windows",
                schema: "access");

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
        }
    }
}
