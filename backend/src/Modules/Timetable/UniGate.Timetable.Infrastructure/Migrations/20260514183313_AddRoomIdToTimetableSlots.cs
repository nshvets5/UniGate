using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniGate.Timetable.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRoomIdToTimetableSlots : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_slots_GroupId_ZoneId_DayOfWeekIso_StartTime_EndTime",
                schema: "timetable",
                table: "slots");

            migrationBuilder.AddColumn<Guid>(
                name: "RoomId",
                schema: "timetable",
                table: "slots",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_slots_GroupId_RoomId_DayOfWeekIso_StartTime_EndTime",
                schema: "timetable",
                table: "slots",
                columns: new[] { "GroupId", "RoomId", "DayOfWeekIso", "StartTime", "EndTime" });

            migrationBuilder.CreateIndex(
                name: "IX_slots_RoomId",
                schema: "timetable",
                table: "slots",
                column: "RoomId");

            migrationBuilder.CreateIndex(
                name: "IX_slots_ZoneId",
                schema: "timetable",
                table: "slots",
                column: "ZoneId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_slots_GroupId_RoomId_DayOfWeekIso_StartTime_EndTime",
                schema: "timetable",
                table: "slots");

            migrationBuilder.DropIndex(
                name: "IX_slots_RoomId",
                schema: "timetable",
                table: "slots");

            migrationBuilder.DropIndex(
                name: "IX_slots_ZoneId",
                schema: "timetable",
                table: "slots");

            migrationBuilder.DropColumn(
                name: "RoomId",
                schema: "timetable",
                table: "slots");

            migrationBuilder.CreateIndex(
                name: "IX_slots_GroupId_ZoneId_DayOfWeekIso_StartTime_EndTime",
                schema: "timetable",
                table: "slots",
                columns: new[] { "GroupId", "ZoneId", "DayOfWeekIso", "StartTime", "EndTime" });
        }
    }
}
