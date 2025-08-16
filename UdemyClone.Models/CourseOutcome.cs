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
    public class CourseOutcome
    {
        public string Id { get; set; }
        [Required]
        public string Title { get; set; }
        [Required]
        public string CourseId { get; set; }
        public int DisplayOrder { get; set; }
        [ValidateNever]
        [ForeignKey("CourseId")]
        public Course Course { get; set; }
    }
}
