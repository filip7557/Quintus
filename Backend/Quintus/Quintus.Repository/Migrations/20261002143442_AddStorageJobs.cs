using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Quintus.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddStorageJobs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StorageJobs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    ObjectKey = table.Column<string>(type: "text", nullable: false),
                    ImageId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ProcessingStartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextAttemptAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AttemptCount = table.Column<int>(type: "integer", nullable: false),
                    LastError = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StorageJobs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StorageJobs_CompletedAt_NextAttemptAt_ProcessingStartedAt",
                table: "StorageJobs",
                columns: new[] { "CompletedAt", "NextAttemptAt", "ProcessingStartedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StorageJobs");
        }
    }
}
