using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Quintus.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddseedunitOfMeasurement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "UnitsOfMeasurement",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("b1a3e4d7-89c2-4f6a-a5d8-3e7b9c1f2d4a"), "M" },
                    { new Guid("d4f6a8c2-1b3e-4d7f-9a5c-7e2b8d0f3a6c"), "KOM" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "UnitsOfMeasurement",
                keyColumn: "Id",
                keyValue: new Guid("b1a3e4d7-89c2-4f6a-a5d8-3e7b9c1f2d4a"));

            migrationBuilder.DeleteData(
                table: "UnitsOfMeasurement",
                keyColumn: "Id",
                keyValue: new Guid("d4f6a8c2-1b3e-4d7f-9a5c-7e2b8d0f3a6c"));
        }
    }
}
