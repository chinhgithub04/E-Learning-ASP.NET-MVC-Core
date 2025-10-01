using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UdemyClone.Models
{
    public class UserCourseProgress
    {
        public string Id { get; set; }

        [Required]
        public string ApplicationUserId { get; set; }
        [ValidateNever]
        [ForeignKey("ApplicationUserId")]
        public ApplicationUser ApplicationUser { get; set; }

        [Required]
        public string CourseId { get; set; }
        [ValidateNever]
        [ForeignKey("CourseId")]
        public Course Course { get; set; }
        public string? CurrentVideoId { get; set; }
        [ValidateNever]
        [ForeignKey("CurrentVideoId")]
        public CourseVideo? CurrentVideo { get; set; }

        public int CompletedVideos { get; set; }

        [Column(TypeName = "decimal(5, 2)")]
        public decimal ProgressPercentage { get; set; }


        [ValidateNever]
        public ICollection<UserVideoProgress> VideoProgresses { get; set; }
    }
}