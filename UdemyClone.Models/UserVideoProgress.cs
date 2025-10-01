using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UdemyClone.Models
{
    public class UserVideoProgress
    {
        public string Id { get; set; }

        [Required]
        public string UserCourseProgressId { get; set; }

        [ValidateNever]
        [ForeignKey("UserCourseProgressId")]
        public UserCourseProgress UserCourseProgress { get; set; }

        [Required]
        public string CourseVideoId { get; set; }

        [ValidateNever]
        [ForeignKey("CourseVideoId")]
        public CourseVideo CourseVideo { get; set; }

        public TimeSpan CurrentTime { get; set; }
        public bool IsCompleted { get; set; }
    }
}