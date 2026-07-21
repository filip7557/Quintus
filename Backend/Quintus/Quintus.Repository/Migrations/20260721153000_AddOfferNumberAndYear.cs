using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Quintus.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddOfferNumberAndYear : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "OfferNumber",
                table: "Offers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "OfferYear",
                table: "Offers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.Sql("""
                WITH numbered AS (
                    SELECT "Id",
                           EXTRACT(YEAR FROM "CreatedAt")::int AS offer_year,
                           ROW_NUMBER() OVER (
                               PARTITION BY EXTRACT(YEAR FROM "CreatedAt")::int
                               ORDER BY "CreatedAt", "Id"
                           ) AS offer_number
                    FROM "Offers"
                )
                UPDATE "Offers" o
                SET "OfferYear" = numbered.offer_year,
                    "OfferNumber" = numbered.offer_number
                FROM numbered
                WHERE o."Id" = numbered."Id";
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OfferNumber",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "OfferYear",
                table: "Offers");
        }
    }
}