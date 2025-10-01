using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UdemyClone.ViewModel
{
    public class CourseRatingViewModel
    {
        public string? Id { get; set; }
        
        [Required]
        public string CourseId { get; set; }
        
        public string CourseTitle { get; set; }
        
        [Required(ErrorMessage = "Please select a rating")]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5 stars")]
        public int Rating { get; set; }
        
        [MaxLength(1000, ErrorMessage = "Review cannot exceed 1000 characters")]
        [Display(Name = "Your Review (Optional)")]
        public string? Review { get; set; }
        
        // For displaying existing ratings
        public string UserName { get; set; }
        public string UserAvatarUrl { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
