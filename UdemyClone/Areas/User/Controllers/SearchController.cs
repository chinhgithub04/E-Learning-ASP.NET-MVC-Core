using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UdemyClone.Common.Constants;
using UdemyClone.DataAccess.Interfaces;
using UdemyClone.Models;
using UdemyClone.ViewModel;

namespace UdemyClone.Areas.User.Controllers
{
    [Area("User")]
    public class SearchController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public SearchController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public IActionResult Index(string? q, string? categoryId, string? subcategoryId, 
            string? courseLevelId, decimal? minPrice, decimal? maxPrice, string? sortBy, 
            bool showFreeOnly = false, bool showPaidOnly = false, int page = 1, int pageSize = 12)
        {
            var searchViewModel = new SearchViewModel
            {
                SearchQuery = q,
                CategoryId = categoryId,
                SubcategoryId = subcategoryId,
                CourseLevelId = courseLevelId,
                MinPrice = minPrice,
                MaxPrice = maxPrice,
                SortBy = sortBy ?? "newest",
                ShowFreeOnly = showFreeOnly,
                ShowPaidOnly = showPaidOnly,
                CurrentPage = page,
                PageSize = pageSize
            };

            searchViewModel.Categories = _unitOfWork.Category.GetAll();
            searchViewModel.CourseLevels = _unitOfWork.CourseLevel.GetAll();

            if (!string.IsNullOrEmpty(categoryId))
            {
                searchViewModel.Subcategories = _unitOfWork.Subcategory.GetAll(s => s.CategoryId == categoryId);
            }

            var coursesQuery = _unitOfWork.Course.GetAll(
                c => c.Status == CourseStatus.Published,
                includeProperties: "Subcategory,Instructor,Instructor.ApplicationUser,CourseLevel,CourseRatings"
            ).AsQueryable();

            if (!string.IsNullOrEmpty(q))
            {
                coursesQuery = coursesQuery.Where(c => 
                    c.Title.Contains(q) || 
                    c.Description.Contains(q) || 
                    c.Subtitle.Contains(q) ||
                    c.Instructor.ApplicationUser.FirstName.Contains(q) ||
                    c.Instructor.ApplicationUser.LastName.Contains(q));
            }

            if (!string.IsNullOrEmpty(categoryId))
            {
                coursesQuery = coursesQuery.Where(c => c.CategoryId == categoryId);
            }

            if (!string.IsNullOrEmpty(subcategoryId))
            {
                coursesQuery = coursesQuery.Where(c => c.SubcategoryId == subcategoryId);
            }

            if (!string.IsNullOrEmpty(courseLevelId))
            {
                coursesQuery = coursesQuery.Where(c => c.CourseLevelId == courseLevelId);
            }

            if (showFreeOnly)
            {
                coursesQuery = coursesQuery.Where(c => !c.Price.HasValue || c.Price.Value == 0);
            }
            else if (showPaidOnly)
            {
                coursesQuery = coursesQuery.Where(c => c.Price.HasValue && c.Price.Value > 0);
            }
            else
            {
                if (minPrice.HasValue)
                {
                    coursesQuery = coursesQuery.Where(c => c.Price >= minPrice.Value);
                }

                if (maxPrice.HasValue)
                {
                    coursesQuery = coursesQuery.Where(c => c.Price <= maxPrice.Value);
                }
            }

            coursesQuery = sortBy switch
            {
                "oldest" => coursesQuery.OrderBy(c => c.CreatedAt),
                "price-low-high" => coursesQuery.OrderBy(c => c.Price ?? 0),
                "price-high-low" => coursesQuery.OrderByDescending(c => c.Price ?? 0),
                "rating" => coursesQuery.OrderByDescending(c => c.CourseRatings.Any() ? c.CourseRatings.Average(r => r.Rating) : 0),
                "title" => coursesQuery.OrderBy(c => c.Title),
                _ => coursesQuery.OrderByDescending(c => c.CreatedAt) // newest (default)
            };

            searchViewModel.TotalResults = coursesQuery.Count();

            var courses = coursesQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            searchViewModel.Courses = courses;

            return View(searchViewModel);
        }

        [HttpGet]
        public IActionResult GetSubcategories(string categoryId)
        {
            if (string.IsNullOrEmpty(categoryId))
            {
                return Json(new List<object>());
            }

            var subcategories = _unitOfWork.Subcategory.GetAll(s => s.CategoryId == categoryId)
                .Select(s => new { id = s.Id, name = s.Name })
                .ToList();

            return Json(subcategories);
        }
    }
}