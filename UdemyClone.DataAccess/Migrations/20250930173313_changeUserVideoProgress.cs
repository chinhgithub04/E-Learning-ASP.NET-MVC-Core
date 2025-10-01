using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UdemyClone.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class changeUserVideoProgress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserVideoProgresses_AspNetUsers_ApplicationUserId",
                table: "UserVideoProgresses");

            migrationBuilder.DropForeignKey(
                name: "FK_UserVideoProgresses_UserCourseProgresses_UserCourseProgressId",
                table: "UserVideoProgresses");

            migrationBuilder.DropIndex(
                name: "IX_UserVideoProgresses_ApplicationUserId",
                table: "UserVideoProgresses");

            migrationBuilder.DropColumn(
                name: "ApplicationUserId",
                table: "UserVideoProgresses");

            migrationBuilder.AlterColumn<string>(
                name: "UserCourseProgressId",
                table: "UserVideoProgresses",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_UserVideoProgresses_UserCourseProgresses_UserCourseProgressId",
                table: "UserVideoProgresses",
                column: "UserCourseProgressId",
                principalTable: "UserCourseProgresses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserVideoProgresses_UserCourseProgresses_UserCourseProgressId",
                table: "UserVideoProgresses");

            migrationBuilder.AlterColumn<string>(
                name: "UserCourseProgressId",
                table: "UserVideoProgresses",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<string>(
                name: "ApplicationUserId",
                table: "UserVideoProgresses",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_UserVideoProgresses_ApplicationUserId",
                table: "UserVideoProgresses",
                column: "ApplicationUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserVideoProgresses_AspNetUsers_ApplicationUserId",
                table: "UserVideoProgresses",
                column: "ApplicationUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserVideoProgresses_UserCourseProgresses_UserCourseProgressId",
                table: "UserVideoProgresses",
                column: "UserCourseProgressId",
                principalTable: "UserCourseProgresses",
                principalColumn: "Id");
        }
    }
}
