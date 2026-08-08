using Microsoft.EntityFrameworkCore.Migrations;
using System.Net;

#nullable disable

namespace Quintus.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddIpAdressToRfToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<IPAddress>(
                name: "IPAddress",
                table: "RefreshTokens",
                type: "inet",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IPAddress",
                table: "RefreshTokens");
        }
    }
}