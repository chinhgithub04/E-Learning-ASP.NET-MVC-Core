using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using UdemyClone.Common.Constants;
using UdemyClone.DataAccess.Data;
using UdemyClone.DataAccess.Interfaces;
using UdemyClone.Models;

namespace UdemyClone.DataAccess.Repositories
{
    public class InstructorRepository : Repository<Instructor>, IInstructorRepository
    {
        private readonly ApplicationDbContext _db;
        public InstructorRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(Instructor instructor)
        {
            _db.Instructors.Update(instructor);
        }

        public async Task<int> GetTotalStudentsAsync(string instructorId)
        {
            var instructorCourseIds = await _db.Courses
                .Where(c => c.InstructorId == instructorId)
                .Select(c => c.Id)
                .ToListAsync();

            if (!instructorCourseIds.Any())
                return 0;

            var totalStudents = await _db.OrderHeaders
                .Where(o => o.OrderStatus == OrderStatus.Completed && 
                           o.PaymentStatus == PaymentStatus.Paid && 
                           !string.IsNullOrEmpty(o.PaymentIntentId))
                .SelectMany(o => o.OrderDetails)
                .Where(od => instructorCourseIds.Contains(od.CourseId))
                .Select(od => od.OrderHeader.ApplicationUserId)
                .Distinct()
                .CountAsync();

            return totalStudents;
        }

        public async Task<(double averageRating, int totalRatings)> GetRatingStatsAsync(string instructorId)
        {
            var ratings = await _db.CourseRatings
                .Where(cr => cr.Course.InstructorId == instructorId)
                .Select(cr => cr.Rating)
                .ToListAsync();

            if (!ratings.Any())
                return (0, 0);

            var averageRating = ratings.Average();
            var totalRatings = ratings.Count;

            return (averageRating, totalRatings);
        }

        public async Task<int> GetTotalCoursesAsync(string instructorId)
        {
            return await _db.Courses
                .CountAsync(c => c.InstructorId == instructorId);
        }
    }
}
