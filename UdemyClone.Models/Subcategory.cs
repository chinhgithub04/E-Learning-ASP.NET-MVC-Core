using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UdemyClone.Models
{
    public class Subcategory
    {
        [ValidateNever]
        public string Id { get; set; }
        [Required(ErrorMessage = "Subcategory name is required.")]
        public string Name { get; set; }
        public string CategoryId { get; set; }
        [ForeignKey("CategoryId")]
        [ValidateNever]
        public Category Category { get; set; }
        [ValidateNever]
        public ICollection<Course> Courses { get; set; }

    }
}
