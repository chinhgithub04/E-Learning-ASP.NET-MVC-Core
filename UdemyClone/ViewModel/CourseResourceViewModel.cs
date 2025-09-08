using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.Rendering;
using UdemyClone.Models;

namespace UdemyClone.ViewModel
{
    public class CourseResourceViewModel
    {
        public List<IFormFile> ResourceFiles { get; set; }
        public string CourseVideoId { get; set; }

    }
}