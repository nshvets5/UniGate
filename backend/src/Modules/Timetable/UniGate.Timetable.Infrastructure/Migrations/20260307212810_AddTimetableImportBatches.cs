using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniGate.Timetable.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTimetableImportBatches : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "BatchId",
                schema: "timetable",
                table: "slots",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "import_batches",
                schema: "timetable",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    SourceFileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ImportedByProvider = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ImportedBySubject = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    TotalRows = table.Column<int>(type: "integer", nullable: false),
                    ImportedRows = table.Column<int>(type: "integer", nullable: false),
                    SkippedRows = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_import_batches", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_slots_BatchId",
                schema: "timetable",
                table: "slots",
                column: "BatchId");

            migrationBuilder.CreateIndex(
                name: "IX_import_batches_CreatedAt",
                schema: "timetable",
                table: "import_batches",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_import_batches_IsActive",
                schema: "timetable",
                table: "import_batches",
                column: "IsActive");

            migrationBuilder.AddForeignKey(
                name: "FK_slots_import_batches_BatchId",
                schema: "timetable",
                table: "slots",
                column: "BatchId",
                principalSchema: "timetable",
                principalTable: "import_batches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_slots_import_batches_BatchId",
                schema: "timetable",
                table: "slots");

            migrationBuilder.DropTable(
                name: "import_batches",
                schema: "timetable");

            migrationBuilder.DropIndex(
                name: "IX_slots_BatchId",
                schema: "timetable",
                table: "slots");

            migrationBuilder.DropColumn(
                name: "BatchId",
                schema: "timetable",
                table: "slots");
        }
    }
}
