using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;

namespace UdemyClone.Models
{
    public class Category
    {
        [ValidateNever]
        public string Id { get; set; }
        [Required(ErrorMessage = "Category name is required.")]
        public string Name { get; set; }
        // Navigation property to Subcategories
        [ValidateNever]
        public ICollection<Subcategory> Subcategories { get; set; }
    }
}
