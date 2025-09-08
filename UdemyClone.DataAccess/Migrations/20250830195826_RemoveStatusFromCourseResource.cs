using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UdemyClone.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class RemoveStatusFromCourseResource : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "CourseResources");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "CourseResources",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
