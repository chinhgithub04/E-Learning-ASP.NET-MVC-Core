using UdemyClone.Models;

namespace UdemyClone.ViewModel
{
    public class InstructorStatsViewModel
    {
        public Course Course { get; set; }
        public int TotalStudents { get; set; }
        public double AverageRating { get; set; }
        public int TotalRatings { get; set; }
        public int TotalCourses { get; set; }
    }
}