using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.Rendering;
using UdemyClone.Models;

namespace UdemyClone.ViewModel
{
    public class CourseVideoViewModel
    {
        public string Id { get; set; }
        public string? Title { get; set; }
        public IFormFile VideoFile { get; set; }
        public bool? IsPreview { get; set; }
    }
}