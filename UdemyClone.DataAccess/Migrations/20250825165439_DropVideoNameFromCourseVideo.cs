using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UdemyClone.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class DropVideoNameFromCourseVideo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "CourseVideos");

            migrationBuilder.DropColumn(
                name: "VideoName",
                table: "CourseVideos");

            migrationBuilder.AlterColumn<bool>(
                name: "IsPreview",
                table: "CourseVideos",
                type: "bit",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "IsPreview",
                table: "CourseVideos",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "CourseVideos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoName",
                table: "CourseVideos",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
