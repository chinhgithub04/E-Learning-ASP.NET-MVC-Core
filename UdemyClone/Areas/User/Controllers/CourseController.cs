using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Common.Constants;
using UdemyClone.DataAccess.Interfaces;
using UdemyClone.Models;
using UdemyClone.ViewModel;

namespace UdemyClone.Areas.User.Controllers
{
    [Area("User")]
    public class CourseController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public CourseController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public IActionResult Index(string id)
        {
            try
            {
                if (string.IsNullOrEmpty(id))
                {
                    return BadRequest();
                }

                var course = _unitOfWork.Course.Get(c => c.Id == id && c.Status == CourseStatus.Published, includeProperties: "Subcategory,Instructor,Instructor.ApplicationUser,CourseLevel,CourseOutcomes,CourseRequirements,CourseSections,CourseSections.CourseVideos,CourseSections.CourseVideos.CourseResources");

                if (course == null)
                {
                    return NotFound();
                }
                return View(course);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        public IActionResult Overview(string id)
        {
            var course = _unitOfWork.Course.Get(c => c.Id == id, includeProperties: "CourseOutcomes,CourseRequirements");
            return PartialView("_Overview", course);
        }

        public IActionResult Curriculum(string id)
        {
            var course = _unitOfWork.Course.Get(c => c.Id == id, includeProperties: "CourseSections,CourseSections.CourseVideos");
            return PartialView("_Curriculum", course);
        }

        public IActionResult Instructor(string id)
        {
            var course = _unitOfWork.Course.Get(c => c.Id == id, includeProperties: "Instructor.ApplicationUser");
            return PartialView("_Instructor", course);
        }

        public IActionResult Review(string id)
        {
            return PartialView("_Review");
        }
    }
}