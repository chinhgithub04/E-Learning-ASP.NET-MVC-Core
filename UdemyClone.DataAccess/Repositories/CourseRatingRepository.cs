using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UdemyClone.DataAccess.Data;
using UdemyClone.DataAccess.Interfaces;
using UdemyClone.Models;

namespace UdemyClone.DataAccess.Repositories
{
    public class CourseRatingRepository : Repository<CourseRating>, ICourseRatingRepository
    {
        private readonly ApplicationDbContext _db;
        public CourseRatingRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(CourseRating courseRating)
        {
            _db.CourseRatings.Update(courseRating);
        }

        public async Task<CourseRating> GetUserRatingForCourseAsync(string userId, string courseId)
        {
            return await _db.CourseRatings
                .FirstOrDefaultAsync(r => r.UserId == userId && r.CourseId == courseId);
        }

        public async Task<double> GetAverageRatingForCourseAsync(string courseId)
        {
            var ratings = await _db.CourseRatings
                .Where(r => r.CourseId == courseId)
                .ToListAsync();

            if (!ratings.Any())
                return 0;

            return Math.Round(ratings.Average(r => r.Rating), 1);
        }

        public async Task<int> GetTotalRatingsForCourseAsync(string courseId)
        {
            return await _db.CourseRatings
                .CountAsync(r => r.CourseId == courseId);
        }

        public async Task<Dictionary<int, int>> GetRatingDistributionForCourseAsync(string courseId)
        {
            var ratings = await _db.CourseRatings
                .Where(r => r.CourseId == courseId)
                .GroupBy(r => r.Rating)
                .Select(g => new { Rating = g.Key, Count = g.Count() })
                .ToListAsync();

            var distribution = new Dictionary<int, int>
            {
                { 5, 0 },
                { 4, 0 },
                { 3, 0 },
                { 2, 0 },
                { 1, 0 }
            };

            foreach (var rating in ratings)
            {
                distribution[rating.Rating] = rating.Count;
            }

            return distribution;
        }
    }
}
