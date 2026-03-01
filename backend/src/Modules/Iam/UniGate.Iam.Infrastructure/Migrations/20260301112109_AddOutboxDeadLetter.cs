using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniGate.Iam.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOutboxDeadLetter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_messages_ProcessedAt_AvailableAt",
                schema: "outbox",
                table: "messages");

            migrationBuilder.AddColumn<string>(
                name: "DeadLetterReason",
                schema: "outbox",
                table: "messages",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeadLetteredAt",
                schema: "outbox",
                table: "messages",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_messages_DeadLetteredAt",
                schema: "outbox",
                table: "messages",
                column: "DeadLetteredAt");

            migrationBuilder.CreateIndex(
                name: "IX_messages_ProcessedAt_DeadLetteredAt_AvailableAt",
                schema: "outbox",
                table: "messages",
                columns: new[] { "ProcessedAt", "DeadLetteredAt", "AvailableAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_messages_DeadLetteredAt",
                schema: "outbox",
                table: "messages");

            migrationBuilder.DropIndex(
                name: "IX_messages_ProcessedAt_DeadLetteredAt_AvailableAt",
                schema: "outbox",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "DeadLetterReason",
                schema: "outbox",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "DeadLetteredAt",
                schema: "outbox",
                table: "messages");

            migrationBuilder.CreateIndex(
                name: "IX_messages_ProcessedAt_AvailableAt",
                schema: "outbox",
                table: "messages",
                columns: new[] { "ProcessedAt", "AvailableAt" });
        }
    }
}
