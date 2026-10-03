using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Quintus.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectGallery : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GalleryProjects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    Address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ClientName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GalleryProjects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GalleryProjectImages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    ImageId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GalleryProjectImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GalleryProjectImages_GalleryProjects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "GalleryProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GalleryProjectImages_Images_ImageId",
                        column: x => x.ImageId,
                        principalTable: "Images",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GalleryProjectImages_ImageId",
                table: "GalleryProjectImages",
                column: "ImageId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GalleryProjectImages_ProjectId_CreatedAt",
                table: "GalleryProjectImages",
                columns: new[] { "ProjectId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_GalleryProjects_CreatedAt",
                table: "GalleryProjects",
                column: "CreatedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GalleryProjectImages");

            migrationBuilder.DropTable(
                name: "GalleryProjects");
        }
    }
}
