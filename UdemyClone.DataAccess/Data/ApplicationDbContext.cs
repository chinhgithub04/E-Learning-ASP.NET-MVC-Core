using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Models;

namespace UdemyClone.DataAccess.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Subcategory> Subcategories { get; set; }
        public DbSet<Instructor> Instructors { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<CourseLevel> CourseLevels { get; set; }
        public DbSet<CourseOutcome> CourseOutcomes { get; set; }
        public DbSet<CourseRequirement> CourseRequirements { get; set; }
        public DbSet<CourseSection> CourseSections { get; set; }
        public DbSet<CourseVideo> CourseVideos { get; set; }
        public DbSet<CourseResource> CourseResources { get; set; }
        public DbSet<Cart> Carts { get; set; }
    }
}
