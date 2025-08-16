using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UdemyClone.Models
{
    public class CourseSection
    {
        public string Id { get; set; }
        [Required]
        [StringLength(100, MinimumLength = 3)]
        public string Title { get; set; }
        public int DisplayOrder { get; set; }
        public TimeSpan? Duration { get; set; } // Auto-calculated from videos
        public string CourseId { get; set; }
        [ValidateNever]
        [ForeignKey("CourseId")]
        public Course Course { get; set; }
        [ValidateNever]
        public ICollection<CourseVideo> CourseVideos { get; set; }
    }
}
