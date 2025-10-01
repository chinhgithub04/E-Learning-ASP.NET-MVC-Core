using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Security.Claims;
using UdemyClone.Common.Constants;
using UdemyClone.DataAccess.Interfaces;
using UdemyClone.Models;
using UdemyClone.ViewModel;

namespace UdemyClone.Areas.User.Controllers
{
    [Area("User")]
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IUnitOfWork _unitOfWork;

        public HomeController(ILogger<HomeController> logger, IUnitOfWork unitOfWork)
        {
            _logger = logger;
            _unitOfWork = unitOfWork;
        }

        public IActionResult Index()
        {
            CategoryCourseViewModel categoryCourseViewModel = new CategoryCourseViewModel
            {
                Category = _unitOfWork.Category.GetAll(),
                Course = _unitOfWork.Course.GetAll(c => c.Status == CourseStatus.Published , includeProperties: "Subcategory,Instructor,Instructor.ApplicationUser,CourseLevel,CourseOutcomes,CourseRatings")
            };
            return View(categoryCourseViewModel);
        }


        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
