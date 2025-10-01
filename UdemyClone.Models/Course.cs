using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UdemyClone.Common.Constants;

namespace UdemyClone.Models
{
    public class Course
    {
        public string Id { get; set; }
        [Display(Name = "Course title")]
        [Required]
        public string? Title { get; set; }
        [Display(Name = "Course subtitle")]
        public string? Subtitle { get; set; }
        [Display(Name = "Course description")]
        public string? Description { get; set; }
        [Display(Name = "Course image")]
        public string? ImageUrl { get; set; }
        [Display(Name = "Promotion video")]
        public string? PromotionVideoUrl { get; set; }
        //Price
        [Range(0, 199.99, ErrorMessage = "Price must be between 0 and 199.99")]
        [Column(TypeName = "decimal(6, 2)")]
        public decimal? Price { get; set; }
        public TimeSpan? Duration { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ReviewdAt { get; set; }
        public DateTime? RefusedAt { get; set; }
        public string? ReasonForRejection { get; set; }
        [Required]
        public string Status { get; set; } // Draft, Published, Private
        public string? CourseLevelId { get; set; }
        [ValidateNever]
        [ForeignKey("CourseLevelId")]
        public CourseLevel CourseLevel { get; set; }

        public string? CategoryId { get; set; }
        [ValidateNever]
        [ForeignKey("CategoryId")]
        public Category Category { get; set; }

        public string? SubcategoryId { get; set; }
        [ValidateNever]
        [ForeignKey("SubcategoryId")]
        public Subcategory Subcategory { get; set; }

        public string InstructorId { get; set; }
        [ValidateNever]
        [ForeignKey("InstructorId")]
        public Instructor Instructor { get; set; }

        [ValidateNever]
        public ICollection<CourseSection> CourseSections { get; set; }
        [ValidateNever]
        public ICollection<CourseOutcome> CourseOutcomes { get; set; }
        [ValidateNever]
        public ICollection<CourseRequirement> CourseRequirements { get; set; }
        [ValidateNever]
        public ICollection<CourseRating> CourseRatings { get; set; }
    }
}
