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
    public class CourseResource
    {
        public string Id {  get; set; }
        [Required]
        public string ResourceUrl { get; set; }
        [Required]
        public string ResourceName { get; set; }
        public long? ResourceSizeInBytes { get; set; }
        public string CourseVideoId { get; set; }
        [ValidateNever]
        [ForeignKey("CourseVideoId")]
        public CourseVideo CourseVideo { get; set; }

    }
}
