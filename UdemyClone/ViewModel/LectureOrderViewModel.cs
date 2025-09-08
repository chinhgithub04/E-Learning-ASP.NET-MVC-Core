using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.Rendering;
using UdemyClone.Models;

namespace UdemyClone.ViewModel
{
    public class LectureOrderViewModel
    {
        public string Id { get; set; }
        public int DisplayOrder { get; set; }

    }
}