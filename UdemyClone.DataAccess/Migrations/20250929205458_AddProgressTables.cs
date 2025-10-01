using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UdemyClone.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddProgressTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserCourseProgresses",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ApplicationUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CourseId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CurrentVideoId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CompletedVideos = table.Column<int>(type: "int", nullable: false),
                    ProgressPercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCourseProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCourseProgresses_AspNetUsers_ApplicationUserId",
                        column: x => x.ApplicationUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserCourseProgresses_CourseVideos_CurrentVideoId",
                        column: x => x.CurrentVideoId,
                        principalTable: "CourseVideos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserCourseProgresses_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "UserVideoProgresses",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ApplicationUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CourseVideoId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CurrentTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    UserCourseProgressId = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserVideoProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserVideoProgresses_AspNetUsers_ApplicationUserId",
                        column: x => x.ApplicationUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserVideoProgresses_CourseVideos_CourseVideoId",
                        column: x => x.CourseVideoId,
                        principalTable: "CourseVideos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_UserVideoProgresses_UserCourseProgresses_UserCourseProgressId",
                        column: x => x.UserCourseProgressId,
                        principalTable: "UserCourseProgresses",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserCourseProgresses_ApplicationUserId",
                table: "UserCourseProgresses",
                column: "ApplicationUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCourseProgresses_CourseId",
                table: "UserCourseProgresses",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCourseProgresses_CurrentVideoId",
                table: "UserCourseProgresses",
                column: "CurrentVideoId");

            migrationBuilder.CreateIndex(
                name: "IX_UserVideoProgresses_ApplicationUserId",
                table: "UserVideoProgresses",
                column: "ApplicationUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserVideoProgresses_CourseVideoId",
                table: "UserVideoProgresses",
                column: "CourseVideoId");

            migrationBuilder.CreateIndex(
                name: "IX_UserVideoProgresses_UserCourseProgressId",
                table: "UserVideoProgresses",
                column: "UserCourseProgressId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserVideoProgresses");

            migrationBuilder.DropTable(
                name: "UserCourseProgresses");
        }
    }
}
