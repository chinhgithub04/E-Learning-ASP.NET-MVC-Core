using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UdemyClone.Common.Constants;
using UdemyClone.DataAccess.Interfaces;
using UdemyClone.Models;

namespace UdemyClone.Areas.User.Controllers
{
    [Authorize]
    [Area("User")]
    public class MyCourseController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        public MyCourseController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [Route("User/MyCourse/Index/{section?}")]
        public IActionResult Index(string section = "learning")
        {
            ViewBag.CurrentSection = section;
            return View();
        }

        [HttpGet]
        public IActionResult GetPartialView(string viewName)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var purchasedCourse = _unitOfWork.OrderHeader.GetAll(o => o.ApplicationUserId == userId && o.OrderStatus == OrderStatus.Completed && o.PaymentStatus == PaymentStatus.Paid && !string.IsNullOrEmpty(o.PaymentIntentId), includeProperties: "OrderDetails.Course");

            return viewName switch
            {
                "learning" => PartialView("_Learning", purchasedCourse),
                "my-list" => PartialView("_MyList", purchasedCourse),
                "wishlist" => PartialView("_Wishlist", purchasedCourse),
                _ => PartialView("_Learning", purchasedCourse)
            };
        }
    }
}
