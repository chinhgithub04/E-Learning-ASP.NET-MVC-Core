using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UdemyClone.Common.Constants;
using UdemyClone.DataAccess.Interfaces;
using UdemyClone.Models;

namespace UdemyClone.Areas.User.Controllers
{
    [Area("User")]
    [Authorize]
    public class CartController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        public CartController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public IActionResult Index()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest();
                }

                var cartItems = _unitOfWork.Cart.GetAll(c => c.ApplicationUserId == userId, includeProperties: "Course,Course.Instructor,Course.Instructor.ApplicationUser,Course.CourseLevel,Course.CourseSections,Course.CourseSections.CourseVideos").OrderByDescending(c => c.CreatedAt);
                if (cartItems == null)
                {
                    return NotFound();
                }
                return View(cartItems);
            }
            catch (Exception ex)
            {
                return RedirectToAction("Error", "Home", new { area = "" });
            }
        }

        [HttpPost]
        public IActionResult AddToCart([FromBody] string courseId)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(courseId) || string.IsNullOrEmpty(userId))
                {
                    return Json(new { success = false, message = "Invalid course or user." });
                }

                var course = _unitOfWork.Course.Get(c => c.Id == courseId);
                if (course == null)
                {
                    return Json(new { success = false, message = "Course not found." });
                }

                var existedCart = _unitOfWork.Cart.Get(c => c.ApplicationUserId == userId && c.CourseId == courseId);

                if (existedCart != null)
                {
                    return Json(new { success = true, message = "Course is already in the cart." });
                }

                Cart newCart = new Cart()
                {
                    Id = Guid.NewGuid().ToString(),
                    ApplicationUserId = userId,
                    CourseId = courseId
                };

                _unitOfWork.Cart.Add(newCart);
                _unitOfWork.Save();

                HttpContext.Session.SetInt32(SessionName.ShoppingCartSession, _unitOfWork.Cart.GetAll(c => c.ApplicationUserId == userId).Count());

                return Json(new { success = true, message = "Course added to cart successfully." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "An unexpected error occurred: " + ex.Message });
            }
        }

        [HttpPost]
        public IActionResult RemoveFromCart([FromBody] string cartId)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(cartId) || string.IsNullOrEmpty(userId))
                {
                    return Json(new { success = false, message = "Invalid cart or user." });
                }
                var cartItem = _unitOfWork.Cart.Get(c => c.Id == cartId && c.ApplicationUserId == userId);
                if (cartItem == null)
                {
                    return Json(new { success = false, message = "Cart item not found." });
                }
                _unitOfWork.Cart.Remove(cartItem);
                _unitOfWork.Save();

                HttpContext.Session.SetInt32(SessionName.ShoppingCartSession, _unitOfWork.Cart.GetAll(c => c.ApplicationUserId == userId).Count());
                return Json(new { success = true, message = "Course removed from cart successfully." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "An unexpected error occurred." });
            }
        }
    }
}