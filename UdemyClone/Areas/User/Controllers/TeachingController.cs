using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using UdemyClone.Common.Constants;
using UdemyClone.DataAccess.Interfaces;
using UdemyClone.Models;

namespace UdemyClone.Areas.User.Controllers
{
    [Area("User")]
    public class TeachingController : Controller
    {
        public readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;

        public TeachingController(
            IUnitOfWork unitOfWork,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _signInManager = signInManager;
        }
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        [Authorize]
        public IActionResult CreateInstructor()
        {
            return RedirectToAction("Index");
        }

        [HttpPost, ActionName("CreateInstructor")]
        [Authorize]
        public async Task<IActionResult> CreateInstructorPOST()
        {
            var claimsIdentity = (ClaimsIdentity)User.Identity;
            var userId = claimsIdentity.FindFirst(ClaimTypes.NameIdentifier).Value;

            //check if the user is already an instructor
            var instructor = _unitOfWork.Instructor.Get(u => u.Id == userId);
            if (instructor != null)
            {
                TempData["error"] = "You are already an instructor.";
                return RedirectToAction("Index", "Course", new { area = "Instructor" });
            }
            //create a new instructor
            instructor = new Models.Instructor()
            {
                Id = userId
            };
            _unitOfWork.Instructor.Add(instructor);
            _unitOfWork.Save();

            //Add user to the instructor role
            var user = await _userManager.FindByIdAsync(userId);
            await _userManager.AddToRoleAsync(user, RoleNames.Instructor);

            // Sign out the current user
            await HttpContext.SignOutAsync(IdentityConstants.ApplicationScheme);

            // Sign in the user again with updated claims
            await _signInManager.SignInAsync(user, isPersistent: false);


            TempData["success"] = "You are now an instructor.";
            return RedirectToAction("Index", "Course", new { area = "Instructor" });

        }
    }
}
