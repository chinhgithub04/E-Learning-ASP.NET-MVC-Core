using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.Rendering;
using UdemyClone.Models;

namespace UdemyClone.ViewModel
{
    public class CheckoutRequestViewModel
    {
        public List<string> CourseIds { get; set; } = new List<string>();
        public string? ReturnUrl { get; set; }
    }
}