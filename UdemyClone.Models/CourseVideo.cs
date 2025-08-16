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
    public class CourseVideo
    {
        public string Id { get; set; }
        [Required]
        public string? Title { get; set; }
        public string VideoUrl { get; set; }
        public string Status { get; set; }
        public string? ResourceUrl { get; set; }
        public long? FileSizeInBytes { get; set; }
        public bool IsPreview { get; set; } = false;
        public int DisplayOrder { get; set; }
        public TimeSpan? Duration { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        public string CourseSectionId { get; set; }
        [ValidateNever]
        [ForeignKey("CourseSectionId")]
        public CourseSection CourseSection { get; set; }
    }
}
