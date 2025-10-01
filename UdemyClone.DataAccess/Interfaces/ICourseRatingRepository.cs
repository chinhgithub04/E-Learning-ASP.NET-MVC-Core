using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UdemyClone.Models;

namespace UdemyClone.DataAccess.Interfaces
{
    public interface ICourseRatingRepository : IRepository<CourseRating>
    {
        void Update(CourseRating courseRating);
        Task<CourseRating> GetUserRatingForCourseAsync(string userId, string courseId);
        Task<double> GetAverageRatingForCourseAsync(string courseId);
        Task<int> GetTotalRatingsForCourseAsync(string courseId);
        Task<Dictionary<int, int>> GetRatingDistributionForCourseAsync(string courseId);
    }
}
