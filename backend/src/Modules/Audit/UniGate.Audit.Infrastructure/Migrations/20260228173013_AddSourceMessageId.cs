using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniGate.Audit.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSourceMessageId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "audit");

            migrationBuilder.CreateTable(
                name: "events",
                schema: "audit",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OccurredAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ActorProvider = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ActorSubject = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ActorProfileId = table.Column<Guid>(type: "uuid", nullable: true),
                    Type = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ResourceType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ResourceId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CorrelationId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    TraceId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    Ip = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    UserAgent = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    DataJson = table.Column<string>(type: "jsonb", nullable: true),
                    SourceMessageId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_events", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_events_ActorProvider_ActorSubject",
                schema: "audit",
                table: "events",
                columns: new[] { "ActorProvider", "ActorSubject" });

            migrationBuilder.CreateIndex(
                name: "IX_events_OccurredAt",
                schema: "audit",
                table: "events",
                column: "OccurredAt");

            migrationBuilder.CreateIndex(
                name: "IX_events_SourceMessageId",
                schema: "audit",
                table: "events",
                column: "SourceMessageId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_events_Type",
                schema: "audit",
                table: "events",
                column: "Type");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "events",
                schema: "audit");
        }
    }
}
