using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Quintus.Repository.Migrations
{
    /// <inheritdoc />
    public partial class Add_CustomMessage_To_Offer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomMessage",
                table: "Offers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomMessageTitle",
                table: "Offers",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomMessage",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "CustomMessageTitle",
                table: "Offers");
        }
    }
}
