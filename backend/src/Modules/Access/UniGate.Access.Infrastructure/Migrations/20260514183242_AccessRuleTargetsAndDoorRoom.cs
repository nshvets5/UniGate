using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniGate.Access.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AccessRuleTargetsAndDoorRoom : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_rules_zones_ZoneId",
                schema: "access",
                table: "rules");

            migrationBuilder.DropIndex(
                name: "IX_rules_ZoneId_GroupId",
                schema: "access",
                table: "rules");

            migrationBuilder.RenameColumn(
                name: "ZoneId",
                schema: "access",
                table: "rules",
                newName: "TargetId");

            migrationBuilder.AddColumn<int>(
                name: "TargetType",
                schema: "access",
                table: "rules",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "RoomId",
                schema: "access",
                table: "doors",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_rules_GroupId_TargetType_TargetId",
                schema: "access",
                table: "rules",
                columns: new[] { "GroupId", "TargetType", "TargetId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_rules_TargetType_TargetId",
                schema: "access",
                table: "rules",
                columns: new[] { "TargetType", "TargetId" });

            migrationBuilder.CreateIndex(
                name: "IX_doors_RoomId",
                schema: "access",
                table: "doors",
                column: "RoomId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_rules_GroupId_TargetType_TargetId",
                schema: "access",
                table: "rules");

            migrationBuilder.DropIndex(
                name: "IX_rules_TargetType_TargetId",
                schema: "access",
                table: "rules");

            migrationBuilder.DropIndex(
                name: "IX_doors_RoomId",
                schema: "access",
                table: "doors");

            migrationBuilder.DropColumn(
                name: "TargetType",
                schema: "access",
                table: "rules");

            migrationBuilder.DropColumn(
                name: "RoomId",
                schema: "access",
                table: "doors");

            migrationBuilder.RenameColumn(
                name: "TargetId",
                schema: "access",
                table: "rules",
                newName: "ZoneId");

            migrationBuilder.CreateIndex(
                name: "IX_rules_ZoneId_GroupId",
                schema: "access",
                table: "rules",
                columns: new[] { "ZoneId", "GroupId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_rules_zones_ZoneId",
                schema: "access",
                table: "rules",
                column: "ZoneId",
                principalSchema: "access",
                principalTable: "zones",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
