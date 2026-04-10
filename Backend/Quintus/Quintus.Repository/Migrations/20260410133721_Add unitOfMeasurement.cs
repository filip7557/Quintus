using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Quintus.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddunitOfMeasurement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UnitOfMeasurement",
                table: "Item",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "UnitsOfMeasurement",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UnitsOfMeasurement", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UnitsOfMeasurement");

            migrationBuilder.DropColumn(
                name: "UnitOfMeasurement",
                table: "Item");
        }
    }
}
