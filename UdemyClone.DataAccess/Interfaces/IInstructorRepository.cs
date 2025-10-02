using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UdemyClone.Models;

namespace UdemyClone.DataAccess.Interfaces
{
    public interface IInstructorRepository : IRepository<Instructor>
    {
        void Update(Instructor instructor);
        Task<int> GetTotalStudentsAsync(string instructorId);
        Task<(double averageRating, int totalRatings)> GetRatingStatsAsync(string instructorId);
        Task<int> GetTotalCoursesAsync(string instructorId);
    }
}
