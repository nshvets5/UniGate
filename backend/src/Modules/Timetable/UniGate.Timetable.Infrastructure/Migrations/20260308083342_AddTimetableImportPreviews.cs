using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniGate.Timetable.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTimetableImportPreviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "import_previews",
                schema: "timetable",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Token = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    SourceType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    SourceFileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ImportedByProvider = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ImportedBySubject = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    PayloadJson = table.Column<string>(type: "jsonb", nullable: false),
                    TotalRows = table.Column<int>(type: "integer", nullable: false),
                    SkippedRows = table.Column<int>(type: "integer", nullable: false),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    AppliedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_import_previews", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_import_previews_AppliedAt",
                schema: "timetable",
                table: "import_previews",
                column: "AppliedAt");

            migrationBuilder.CreateIndex(
                name: "IX_import_previews_ExpiresAt",
                schema: "timetable",
                table: "import_previews",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_import_previews_Token",
                schema: "timetable",
                table: "import_previews",
                column: "Token",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "import_previews",
                schema: "timetable");
        }
    }
}
