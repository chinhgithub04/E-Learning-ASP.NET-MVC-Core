using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UdemyClone.Models
{
    public class CourseLevel
    {
        [ValidateNever]
        public string Id { get; set; }
        [Required]
        public string Name { get; set; }
        [ValidateNever]
        public ICollection<Course> Courses { get; set; } 
    }
}
