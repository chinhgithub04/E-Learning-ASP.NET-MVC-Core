using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Security.Claims;
using UdemyClone.Common.Constants;
using UdemyClone.DataAccess.Interfaces;
using UdemyClone.Models;
using UdemyClone.ViewModel;

namespace UdemyClone.Areas.Instructor.Controllers
{
    [Area("Instructor")]
    [Authorize(Roles = RoleNames.Instructor)]
    public class CourseController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _webHostEnvironment;
        public CourseController(IUnitOfWork unitOfWork, IWebHostEnvironment webHostEnvironment)
        {
            _unitOfWork = unitOfWork;
            _webHostEnvironment = webHostEnvironment;
        }
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Create(int step = 1)
        {
            ViewBag.CurrentStep = step;
            return View();
        }

        [HttpPost]
        public IActionResult Create([FromBody] CreateCourseViewModel model)
        {
            try
            {
                if (string.IsNullOrEmpty(model.Title))
                {
                    return Json(new { success = false, message = "Course title is required." });
                }

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                var course = new Course
                {
                    Id = Guid.NewGuid().ToString(),
                    Title = model.Title.Trim(),
                    CategoryId = model.CategoryId,
                    Status = CourseStatus.Draft,
                    CreatedAt = DateTime.UtcNow,
                    InstructorId = userId
                };

                _unitOfWork.Course.Add(course);
                _unitOfWork.Save();
                return Json(new { success = true, message = "Course created successfully!", courseId = course.Id });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "An error occurred while creating the course. Please try again." });
            }
        }

        [Route("Instructor/Course/Manage/{id}/{section?}")]
        public IActionResult Manage(string id, string section = "intended-learners")
        {
            var course = _unitOfWork.Course.Get(c => c.Id == id, includeProperties: "CourseLevel,Category,Subcategory,CourseOutcomes,CourseRequirements");

            if (course == null)
            {
                return NotFound();
            }

            ViewBag.CurrentSection = section;
            return View(course);
        }

        [HttpPost]
        public IActionResult SaveIntendedLearners([FromBody] IntendedLearnersViewModel model)
        {
            try
            {
                var course = _unitOfWork.Course.Get(c => c.Id == model.CourseId, includeProperties: "CourseOutcomes,CourseRequirements");
                if (course == null)
                {
                    return Json(new { success = false, message = "Course not found." });
                }

                //Remove existing outcomes and requirements
                var existingOutcomes = _unitOfWork.CourseOutcome.GetAll(co => co.CourseId == course.Id).ToList();
                var existingRequirements = _unitOfWork.CourseRequirement.GetAll(cr => cr.CourseId == course.Id).ToList();

                course.CourseOutcomes?.Clear();
                course.CourseRequirements?.Clear();

                if (existingOutcomes.Any())
                {
                    _unitOfWork.CourseOutcome.RemoveRange(existingOutcomes);
                }

                if (existingRequirements.Any())
                {
                    _unitOfWork.CourseRequirement.RemoveRange(existingRequirements);
                }

                _unitOfWork.Save();

                //Add new outcomes and requirements
                if (model.LearningOutcomes?.Any() == true)
                {
                    for (int i = 0; i < model.LearningOutcomes.Count; i++)
                    {
                        if (!string.IsNullOrWhiteSpace(model.LearningOutcomes[i]))
                        {
                            var courseOutcome = new CourseOutcome
                            {
                                Id = Guid.NewGuid().ToString(),
                                Title = model.LearningOutcomes[i].Trim(),
                                CourseId = model.CourseId,
                                DisplayOrder = i + 1
                            };
                            _unitOfWork.CourseOutcome.Add(courseOutcome);
                        }
                    }
                }

                if (model.Prerequisites?.Any() == true)
                {
                    for (int i = 0; i < model.Prerequisites.Count; i++)
                    {
                        if (!string.IsNullOrEmpty(model.Prerequisites[i]))
                        {
                            var courseRequirement = new CourseRequirement
                            {
                                Id = Guid.NewGuid().ToString(),
                                Title = model.Prerequisites[i].Trim(),
                                CourseId = model.CourseId,
                                DisplayOrder = i + 1
                            };
                            _unitOfWork.CourseRequirement.Add(courseRequirement);
                        }
                    }
                }

                course.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.Course.Update(course);

                _unitOfWork.Save();

                return Json(new { success = true, message = "Your changes have been successfully saved." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "An error occurred while saving. Please try again." });
            }
        }

        [HttpPost]
        [Route("Instructor/Course/SaveLandingPageAsync")]
        [RequestFormLimits(MultipartBodyLengthLimit = 524288000)]
        [RequestSizeLimit(524288000)]
        public async Task<IActionResult> SaveLandingPageAsync(LandingPageSaveModel model)
        {
            try
            {
                var course = _unitOfWork.Course.Get(c => c.Id == model.CourseId);
                if (course == null)
                {
                    return Json(new { success = false, message = "Course not found." });
                }
                course.Title = !string.IsNullOrEmpty(model.Title) ? model.Title.Trim() : string.Empty;
                course.Subtitle = !string.IsNullOrEmpty(model.Subtitle) ? model.Subtitle.Trim() : string.Empty;
                course.Description = !string.IsNullOrEmpty(model.Description) ? model.Description.Trim() : string.Empty;
                course.CourseLevelId = model.CourseLevelId;
                course.CategoryId = model.CategoryId;
                course.SubcategoryId = model.SubcategoryId;

                if (model.ImageFile != null && model.ImageFile.Length > 0)
                {
                    var imageFileName = await SaveFileAsync(model.ImageFile, "img/course");
                    if (!string.IsNullOrEmpty(imageFileName))
                    {
                        // Delete old image if exists
                        if (!string.IsNullOrEmpty(course.ImageUrl))
                        {
                            DeleteFile(course.ImageUrl);
                        }
                        course.ImageUrl = imageFileName;
                    }
                }

                if (model.VideoFile != null && model.VideoFile.Length > 0)
                {
                    var videoFileName = await SaveFileAsync(model.VideoFile, "video/course");
                    if (!string.IsNullOrEmpty(videoFileName))
                    {
                        // Delete old video if exists
                        if (!string.IsNullOrEmpty(course.PromotionVideoUrl))
                        {
                            DeleteFile(course.PromotionVideoUrl);
                        }
                        course.PromotionVideoUrl = videoFileName;
                    }
                }

                course.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.Course.Update(course);
                _unitOfWork.Save();

                return Json(new { success = true, message = "Course landing page saved successfully!" });

            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "An error occurred while saving the landing page. Please try again." });
            }
        }

        private async Task<string> SaveFileAsync(IFormFile file, string subDirectory)
        {
            try
            {
                var wwwRootPath = _webHostEnvironment.WebRootPath;
                var uploadPath = Path.Combine(wwwRootPath, subDirectory);

                if (!Directory.Exists(uploadPath))
                {
                    Directory.CreateDirectory(uploadPath);
                }

                var fileExtension = Path.GetExtension(file.FileName);
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadPath, fileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                return $"/{subDirectory}/{fileName}";
            }
            catch (Exception)
            {
                return null;
            }
        }

        private void DeleteFile(string filePath)
        {
            try
            {
                if (!string.IsNullOrEmpty(filePath))
                {
                    var wwwRootPath = _webHostEnvironment.WebRootPath;
                    var fullPath = Path.Combine(wwwRootPath, filePath.TrimStart('/'));

                    if (System.IO.File.Exists(fullPath))
                    {
                        System.IO.File.Delete(fullPath);
                    }
                }
            }
            catch (Exception ex)
            {
                return;
            }
        }

        [HttpGet]
        public IActionResult GetSubcategoriesByCategory(string categoryId)
        {
            if (string.IsNullOrEmpty(categoryId))
            {
                return Json(new List<SelectListItem>());
            }

            var subcategories = _unitOfWork.Subcategory.GetAll(s => s.CategoryId == categoryId).Select(s => new SelectListItem
            {
                Text = s.Name,
                Value = s.Id
            });
            return Json(subcategories);
        }

        [HttpGet]
        public IActionResult GetStepContent(int step)
        {
            ViewBag.CurrentStep = step;
            if (step == 2)
            {
                var categories = _unitOfWork.Category.GetAll();
                return PartialView("_CreateStepTwo", categories);
            }
            return PartialView("_CreateStepOne");
        }

        [HttpGet]
        public IActionResult GetPartialView(string viewName, string courseId)
        {
            // Get the course with related data for all partial views
            var course = _unitOfWork.Course.Get(c => c.Id == courseId,
                includeProperties: "CourseLevel,Category,Subcategory,CourseOutcomes,CourseRequirements");

            var landingPageVM = new LandingPageViewModel
            {
                Course = course,
                LevelList = _unitOfWork.CourseLevel.GetAll().Select(c => new SelectListItem
                {
                    Text = c.Name,
                    Value = c.Id
                }),
                CategoryList = _unitOfWork.Category.GetAll().Select(c => new SelectListItem
                {
                    Text = c.Name,
                    Value = c.Id
                }),
                SubcategoryList = course.CategoryId != null ?
                    _unitOfWork.Subcategory.GetAll(s => s.CategoryId == course.CategoryId).Select(s => new SelectListItem
                    {
                        Value = s.Id,
                        Text = s.Name
                    }) :
                    _unitOfWork.Subcategory.GetAll().Select(s => new SelectListItem
                    {
                        Value = s.Id,
                        Text = s.Name
                    })
            };

            if (course == null || landingPageVM == null)
            {
                return NotFound();
            }

            return viewName switch
            {
                "intended-learners" => PartialView("_IntendedLearners", course),
                "curriculum" => PartialView("_Curriculum", course),
                "landing-page" => PartialView("_LandingPage", landingPageVM),
                "pricing" => PartialView("_Pricing", course),
                _ => PartialView("_IntendedLearners", course)
            };
        }
    }

}