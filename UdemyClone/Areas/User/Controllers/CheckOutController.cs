using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Stripe.Checkout;
using System.Security.Claims;
using UdemyClone.Common.Constants;
using UdemyClone.Common.Settings;
using UdemyClone.DataAccess.Interfaces;
using UdemyClone.Models;
using UdemyClone.ViewModel;

namespace UdemyClone.Areas.User.Controllers
{
    [Area("User")]
    [Authorize]
    public class CheckOutController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public CheckOutController(IUnitOfWork unitOfWork, IOptions<StripeSettings> stripeSettings)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpPost]
        public IActionResult CheckOut([FromBody] CheckoutRequestViewModel model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            List<Course> courses;
            if (model.CourseIds != null && model.CourseIds.Any())
            {
                courses = model.CourseIds.Select(id => _unitOfWork.Course.Get(c => c.Id == id, includeProperties: "Instructor.ApplicationUser")).Where(c => c != null).ToList();
            }
            else
            {
                return Json(new { success = false, message = "No courses are available for checkout." });
            }

            var currentUser = _unitOfWork.ApplicationUser.Get(u => u.Id == userId);
            var userName = $"{currentUser.FirstName} {currentUser.LastName}";

            var orderHeader = new OrderHeader
            {
                Id = Guid.NewGuid().ToString(),
                ApplicationUserId = userId,
                OrderDate = DateTime.Now,
                OrderTotal = (double)courses.Sum(c => c.Price.Value),
                OrderStatus = OrderStatus.Pending,
                PaymentStatus = PaymentStatus.Pending,
                Name = userName
            };

            _unitOfWork.OrderHeader.Add(orderHeader);
            _unitOfWork.Save();

            foreach (var course in courses)
            {
                var orderDetail = new OrderDetail
                {
                    Id = Guid.NewGuid().ToString(),
                    OrderHeaderId = orderHeader.Id,
                    CourseId = course.Id,
                    Price = (double)course.Price.Value
                };
                _unitOfWork.OrderDetail.Add(orderDetail);
            }
            _unitOfWork.Save();

            // Stripe
            var domain = $"{Request.Scheme}://{Request.Host}";
            var cancelUrl = !string.IsNullOrEmpty(model.ReturnUrl) ? model.ReturnUrl : $"{domain}/User/Cart/Index";

            var options = new SessionCreateOptions
            {
                SuccessUrl = $"{domain}/User/CheckOut/OrderConfirmation?id={orderHeader.Id}",
                CancelUrl = cancelUrl,
                LineItems = new List<SessionLineItemOptions>(),
                Mode = "payment",
                CustomerEmail = currentUser.Email
            };

            foreach (var course in courses)
            {
                var imageUrl = string.Empty;
                if (!string.IsNullOrEmpty(course.ImageUrl))
                {
                    imageUrl = $"{domain}/{course.ImageUrl.TrimStart('/')}";
                }

                var sessionLineItem = new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        UnitAmount = (long)(course.Price * 100),
                        Currency = "usd",
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = course.Title,
                            Description = course.Subtitle,
                            //Images = !string.IsNullOrEmpty(imageUrl) ? new List<string> { imageUrl } : null
                        }
                    },
                    Quantity = 1
                };

                options.LineItems.Add(sessionLineItem);
            }

            var service = new SessionService();
            var session = service.Create(options);

            _unitOfWork.OrderHeader.UpdateStripePaymentId(orderHeader.Id, session.Id, session.PaymentIntentId);
            _unitOfWork.Save();

            return Json(new { checkoutUrl = session.Url });
        }

        [HttpGet]
        public IActionResult OrderConfirmation(string id)
        {
            var orderHeader = _unitOfWork.OrderHeader.Get(o => o.Id == id, includeProperties: "ApplicationUser,OrderDetails.Course.Instructor.ApplicationUser", tracked: true);

            if (orderHeader == null)
            {
                return RedirectToAction("Index", "Home");
            }

            // Verify payment with Stripe
            if (!string.IsNullOrEmpty(orderHeader.SessionId))
            {
                var service = new SessionService();
                var session = service.Get(orderHeader.SessionId);

                if (session.PaymentStatus.ToLower() == "paid")
                {
                    _unitOfWork.OrderHeader.UpdateStripePaymentId(id, session.Id, session.PaymentIntentId);
                    _unitOfWork.OrderHeader.UpdateStatus(id, OrderStatus.Completed, PaymentStatus.Paid);

                    _unitOfWork.OrderHeader.Update(orderHeader);

                    // Remove courses from cart
                    var cartItems = _unitOfWork.Cart.GetAll(c => c.ApplicationUserId == orderHeader.ApplicationUserId);
                    var orderCourseIds = orderHeader.OrderDetails.Select(od => od.CourseId).ToList();
                    var cartItemsToRemove = cartItems.Where(c => orderCourseIds.Contains(c.CourseId)).ToList();

                    _unitOfWork.Cart.RemoveRange(cartItemsToRemove);

                    _unitOfWork.Save();
                }
            }

            return View(orderHeader);
        }
    }
}