using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UdemyClone.Common.Constants;
using UdemyClone.DataAccess.Interfaces;
using UdemyClone.Models;

namespace UdemyClone.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = RoleNames.Admin)]
    public class CourseLevelController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        public CourseLevelController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public IActionResult Index()
        {
            var courseLevels = _unitOfWork.CourseLevel.GetAll();
            return View(courseLevels);
        }

        public IActionResult UpSert(string? id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return View(new CourseLevel());
            }
            else
            {
                var courseLevel = _unitOfWork.CourseLevel.Get(x => x.Id == id);
                if (courseLevel == null)
                {
                    return NotFound();
                }
                return View(courseLevel);
            }
        }

        [HttpPost]
        public IActionResult Upsert(CourseLevel courseLevel)
        {
            if (ModelState.IsValid)
            {
                if (string.IsNullOrEmpty(courseLevel.Id))
                {
                    courseLevel.Id = Guid.NewGuid().ToString();
                    _unitOfWork.CourseLevel.Add(courseLevel);
                }
                else
                {
                    _unitOfWork.CourseLevel.Update(courseLevel);
                }
                _unitOfWork.Save();
                return RedirectToAction("Index");
            }
            return View(courseLevel);
        }

        [HttpDelete]
        public IActionResult Delete(string? id)
        {
            var courseLevel = _unitOfWork.CourseLevel.Get(c => c.Id == id);
            if (courseLevel == null)
            {
                return Json(new { success = false, message = "Error while deleteting" });
            }

            _unitOfWork.CourseLevel.Remove(courseLevel);
            _unitOfWork.Save();
            return Json(new { success = true, message = "Course level deleted successfully" });
        }
    }
}
