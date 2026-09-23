using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Quintus.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddEstimateModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "EstimateId",
                table: "Item",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Estimates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BuyerName = table.Column<string>(type: "text", nullable: false),
                    BuyerEmail = table.Column<string>(type: "text", nullable: true),
                    BuyerPhone = table.Column<string>(type: "text", nullable: true),
                    IsTransactional = table.Column<bool>(type: "boolean", nullable: false),
                    Number = table.Column<int>(type: "integer", nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Estimates", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Item_EstimateId",
                table: "Item",
                column: "EstimateId");

            migrationBuilder.AddForeignKey(
                name: "FK_Item_Estimates_EstimateId",
                table: "Item",
                column: "EstimateId",
                principalTable: "Estimates",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Item_Estimates_EstimateId",
                table: "Item");

            migrationBuilder.DropTable(
                name: "Estimates");

            migrationBuilder.DropIndex(
                name: "IX_Item_EstimateId",
                table: "Item");

            migrationBuilder.DropColumn(
                name: "EstimateId",
                table: "Item");
        }
    }
}
