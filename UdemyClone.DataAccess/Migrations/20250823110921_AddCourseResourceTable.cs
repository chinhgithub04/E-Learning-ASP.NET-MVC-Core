using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UdemyClone.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddCourseResourceTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ResourceUrl",
                table: "CourseVideos",
                newName: "VideoName");

            migrationBuilder.RenameColumn(
                name: "FileSizeInBytes",
                table: "CourseVideos",
                newName: "VideoSizeInBytes");

            migrationBuilder.CreateTable(
                name: "CourseResources",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ResourceUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ResourceName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResourceSizeInBytes = table.Column<long>(type: "bigint", nullable: true),
                    CourseVideoId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseResources", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseResources_CourseVideos_CourseVideoId",
                        column: x => x.CourseVideoId,
                        principalTable: "CourseVideos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CourseResources_CourseVideoId",
                table: "CourseResources",
                column: "CourseVideoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CourseResources");

            migrationBuilder.RenameColumn(
                name: "VideoSizeInBytes",
                table: "CourseVideos",
                newName: "FileSizeInBytes");

            migrationBuilder.RenameColumn(
                name: "VideoName",
                table: "CourseVideos",
                newName: "ResourceUrl");
        }
    }
}
