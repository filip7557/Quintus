using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Quintus.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddSeedCertificates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Certificates",
                columns: new[] { "Id", "CreatedDateTime", "Description", "ImageUrl", "Title", "Url" },
                values: new object[,]
                {
                    { new Guid("210562a4-052f-4fb6-add0-dcfb55516bc5"), new DateTime(2026, 9, 20, 23, 17, 26, 992, DateTimeKind.Utc), "Ovlašteni majstor plinoinstalater", "https://res.cloudinary.com/dzhmn7c4d/image/upload/v1789946245/quintus_images/r3lt8gemsgydxowfnyqb.png", "Majstor plinoinstalater", "https://quintus-files.s3.eu-south-mil.io.cloud.ovh.net/3bedd3d343904e88ab108e869370d1b1.pdf" },
                    { new Guid("31993434-7c6d-4071-83a5-e063b457ac81"), new DateTime(2026, 9, 20, 23, 11, 36, 92, DateTimeKind.Utc), "Ovlašteni majstor vodoinstalater, instalater grijanja i klimatizacije", "https://res.cloudinary.com/dzhmn7c4d/image/upload/v1789945894/quintus_images/pbfc7fb3nxyzwbbdfyqd.png", "Majstor instalater", "https://quintus-files.s3.eu-south-mil.io.cloud.ovh.net/d6719da15d444d38b4160d5558bc7316.pdf" },
                    { new Guid("44a532f0-8072-4727-9577-aecf9d12921f"), new DateTime(2026, 9, 20, 11, 57, 18, 389, DateTimeKind.Utc), "Ovlašteni majstor za vodovod, grijanje i klimatizaciju (Kategorija A1).", "https://res.cloudinary.com/dzhmn7c4d/image/upload/v1789905438/quintus_images/gfjnfyhvrwgn6spvyfqs.webp", "Majstor instalater", "https://quintus-files.s3.eu-south-mil.io.cloud.ovh.net/a4f0bcd1dbdc43efba36b95ace84c83a.pdf" },
                    { new Guid("80f17497-8c63-4459-be9c-65f471de95fc"), new DateTime(2026, 9, 20, 23, 16, 43, 785, DateTimeKind.Utc), "Vaillant Excellence Partner (VEP) je Vaillantova elitna mreža certificiranih partnera instalatera.", "https://res.cloudinary.com/dzhmn7c4d/image/upload/v1789946203/quintus_images/ibed5jn1gbyagzlv6zgr.png", "Vaillant Partner", null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Certificates",
                keyColumn: "Id",
                keyValue: new Guid("210562a4-052f-4fb6-add0-dcfb55516bc5"));

            migrationBuilder.DeleteData(
                table: "Certificates",
                keyColumn: "Id",
                keyValue: new Guid("31993434-7c6d-4071-83a5-e063b457ac81"));

            migrationBuilder.DeleteData(
                table: "Certificates",
                keyColumn: "Id",
                keyValue: new Guid("44a532f0-8072-4727-9577-aecf9d12921f"));

            migrationBuilder.DeleteData(
                table: "Certificates",
                keyColumn: "Id",
                keyValue: new Guid("80f17497-8c63-4459-be9c-65f471de95fc"));
        }
    }
}
