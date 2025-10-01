using UdemyClone.Models;

namespace UdemyClone.ViewModel
{
    public class LearnViewModel
    {
        public Course Course { get; set; }
        public CourseVideo CurrentVideo { get; set; }
        public CourseVideo? NextVideo { get; set; }
        public CourseVideo? PreviousVideo { get; set; }
        public List<CourseSection> CourseSections { get; set; }
        public int CurrentVideoIndex { get; set; }
        public int TotalVideos { get; set; }
        public bool HasAccess { get; set; }

        public UserCourseProgress? CourseProgress { get; set; }
        public UserVideoProgress? CurrentVideoProgress { get; set; }
        public List<UserVideoProgress> VideoProgresses { get; set; } = new List<UserVideoProgress>();
        public decimal OverallProgress { get; set; }
    }
}