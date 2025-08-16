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
    public class Instructor
    {
        [Key]
        [ForeignKey("ApplicationUser")]
        public string Id { get; set; }
        public string? HeadLine {  get; set; }
        public string? Biography {  get; set; }
        public string? Website { get; set; }
        [ValidateNever]
        public ApplicationUser ApplicationUser { get; set; }
        [ValidateNever]
        public ICollection<Course> Courses { get; set; }
    }
}
