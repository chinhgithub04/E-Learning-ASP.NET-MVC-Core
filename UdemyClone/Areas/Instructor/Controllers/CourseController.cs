using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Security.Claims;
using UdemyClone.Common.Constants;
using UdemyClone.DataAccess.Interfaces;
using UdemyClone.Models;
using UdemyClone.ViewModel;
using FFMpegCore;
using UdemyClone.Common.Helpers;

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

                var courseSection = new CourseSection
                {
                    Id = Guid.NewGuid().ToString(),
                    Title = "Introduction",
                    DisplayOrder = 1,
                    CourseId = course.Id
                };

                _unitOfWork.CourseSection.Add(courseSection);

                var courseVideo = new CourseVideo
                {
                    Id = Guid.NewGuid().ToString(),
                    Title = "Introduction",
                    DisplayOrder = 1,
                    CourseSectionId = courseSection.Id
                };

                _unitOfWork.CourseVideo.Add(courseVideo);

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

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (course.InstructorId != userId)
                {
                    return Json(new { success = false, message = "Unauthorized access." });
                }

                if (model.ImageFile != null && model.ImageFile.Length > 0)
                {
                    var imageFileName = await FileHelper.SaveFileAsync(model.ImageFile, $"img/course/{userId}", _webHostEnvironment);


                    if (!string.IsNullOrEmpty(imageFileName))
                    {
                        // Delete old image if exists
                        if (!string.IsNullOrEmpty(course.ImageUrl))
                        {
                            FileHelper.DeleteFile(course.ImageUrl, _webHostEnvironment);
                        }
                        course.ImageUrl = imageFileName;
                    }
                }

                if (model.VideoFile != null && model.VideoFile.Length > 0)
                {
                    var videoFileName = await FileHelper.SaveFileAsync(model.VideoFile, $"video/course/{userId}", _webHostEnvironment);
                    if (!string.IsNullOrEmpty(videoFileName))
                    {
                        // Delete old video if exists
                        if (!string.IsNullOrEmpty(course.PromotionVideoUrl))
                        {
                            FileHelper.DeleteFile(course.PromotionVideoUrl, _webHostEnvironment);
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

        [HttpPost]
        public IActionResult SaveSectionTitle(CourseSection courseSection)
        {
            try
            {
                if (string.IsNullOrEmpty(courseSection.Id))
                {
                    return Json(new { success = false, message = "Cannot find this section, please reload the page and try again!" });
                }
                else
                {
                    _unitOfWork.CourseSection.Update(courseSection);
                    _unitOfWork.Save();

                    return Json(new { success = true, message = "Course section title saved successfully!" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "An error occurred while saving the section title. Please try again." });
            }
        }

        [HttpPost]
        public IActionResult SaveLectureTitle(CourseLectureTitleViewModel model)
        {
            try
            {
                // Add new Lecture
                if (string.IsNullOrEmpty(model.Id))
                {
                    CourseVideo courseVideo = new CourseVideo
                    {
                        Id = Guid.NewGuid().ToString(),
                        Title = model.Title,
                        DisplayOrder = model.DisplayOrder,
                        CourseSectionId = model.CourseSectionId
                    };
                    _unitOfWork.CourseVideo.Add(courseVideo);
                    _unitOfWork.Save();

                    return Json(new { success = true, message = "Course lecture added successfully!", id = courseVideo.Id });
                }
                // Update lecture title
                else
                {
                    var courseVideo = _unitOfWork.CourseVideo.Get(c => c.Id == model.Id);
                    if (courseVideo == null)
                    {
                        return Json(new { success = false, message = "Cannot find this lecture." });
                    }

                    courseVideo.Title = model.Title;

                    _unitOfWork.CourseVideo.Update(courseVideo);
                    _unitOfWork.Save();

                    return Json(new { success = true, message = "Course lecture saved successfully!", id = courseVideo.Id });
                }
            }
            catch(Exception ex)
            {
                return Json(new { success = false, message = "An error occurred while saving the lecture title. Please try again." });
            }
        }

        [HttpPost]
        public IActionResult UpdateLectureOrder([FromBody] List<LectureOrderViewModel> items)
        {
            if (items == null || !items.Any())
            {
                return Json(new { success = false, message = "No items to update." });
            }

            try
            {
                var videosToUpdate = _unitOfWork.CourseVideo.GetAll(v => items.Select(i => i.Id).Contains(v.Id)).ToList();

                if (videosToUpdate.Count != items.Count)
                {
                    return Json(new { success = false, message = "Some lectures could not be found. Please refresh the page." });
                }

                foreach (var item in items)
                {
                    var video = videosToUpdate.FirstOrDefault(v => v.Id == item.Id);
                    if (video != null)
                    {
                        video.DisplayOrder = item.DisplayOrder;
                        _unitOfWork.CourseVideo.Update(video);
                    }
                }

                _unitOfWork.Save();
                return Json(new { success = true, message = "Lecture order updated successfully." });
            }
            catch (Exception ex)
            {
                // Log the exception
                return Json(new { success = false, message = "An error occurred while updating the lecture order." });
            }
        }


        [HttpPost]
        public IActionResult DeleteLecture (string id)
        {
            try
            {
                if (string.IsNullOrEmpty(id))
                {
                    return Json(new { success = false, message = "Lecture not found." });
                }

                var courseVideo = _unitOfWork.CourseVideo.Get(c => c.Id == id);
                if (courseVideo == null)
                {
                    return Json(new { success = false, message = "Lecture not found." });
                }
                else
                {
                    if (!string.IsNullOrEmpty(courseVideo.VideoUrl))
                    {
                        FileHelper.DeleteFile(courseVideo.VideoUrl, _webHostEnvironment);
                    }

                    var nextCourseVideos = _unitOfWork.CourseVideo.GetAll(c => c.DisplayOrder > courseVideo.DisplayOrder);
                    foreach (var video in nextCourseVideos)
                    {
                        video.DisplayOrder -= 1;
                        _unitOfWork.CourseVideo.Update(video);
                    }

                    _unitOfWork.CourseVideo.Remove(courseVideo);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Lecture deleted successfully!" });

                }
            } 
            catch (Exception e)
            {
                return Json(new { success = false, message = "An error occurred while deleting the lecture. Please try again." });
            }
        }

        [HttpPost]
        [Route("Instructor/Course/UpdateCourseVideoAsync")]
        [RequestFormLimits(MultipartBodyLengthLimit = 524288000)]
        [RequestSizeLimit(524288000)]
        public async Task<IActionResult> UpdateCourseVideoAsync([FromForm] CourseVideoViewModel model)
        {
            try
            {
                if (model.VideoFile == null || model.VideoFile.Length == 0)
                {
                    return Json(new { success = false, message = "No video file uploaded." });
                }

                var courseVideo = _unitOfWork.CourseVideo.Get(v => v.Id == model.Id, includeProperties: "CourseSection,CourseSection.Course");
                if (courseVideo == null)
                {
                    return Json(new { success = false, message = "Video not found." });
                }

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (courseVideo.CourseSection.Course.InstructorId != userId)
                {
                    return Json(new { success = false, message = "Unauthorized access." });
                }

                var videoUrl = await FileHelper.SaveFileAsync(model.VideoFile, $"video/course/{userId}", _webHostEnvironment);

                if (!string.IsNullOrEmpty(courseVideo.VideoUrl))
                {
                    FileHelper.DeleteFile(courseVideo.VideoUrl, _webHostEnvironment);
                }

                
                if (string.IsNullOrEmpty(videoUrl))
                {
                    return Json(new { success = false, message = "Failed to save video." });
                }

                var duration = await VideoHelper.GetVideoDurationAsync(videoUrl, _webHostEnvironment);

                courseVideo.VideoUrl = videoUrl;
                courseVideo.VideoSizeInBytes = model.VideoFile.Length;
                courseVideo.Duration = duration;
                courseVideo.UploadedAt = DateTime.UtcNow;

                _unitOfWork.CourseVideo.Update(courseVideo);
                _unitOfWork.Save();

                return Json(new { success = true, message = "Video uploaded successfully.", title = courseVideo.Title, duration = duration });
            }
            catch (Exception e)
            {
                return Json(new { success = false, message = "An error occurred during video upload." });
            }
        }

        [HttpPost]
        [Route("Instructor/Course/AddCourseResourceAsync")]
        [RequestFormLimits(MultipartBodyLengthLimit = 524288000)]
        [RequestSizeLimit(524288000)]
        public async Task<IActionResult> AddCourseResourceAsync([FromForm] CourseResourceViewModel model)
        {
            try
            {
                if (model.ResourceFiles == null || !model.ResourceFiles.Any())
                {
                    return Json(new { success = false, message = "No files uploaded." });
                }

                var courseVideo = _unitOfWork.CourseVideo.Get(v => v.Id == model.CourseVideoId, includeProperties: "CourseSection,CourseSection.Course");
                if (courseVideo == null)
                {
                    return Json(new { success = false, message = "Video not found." });
                }

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (courseVideo.CourseSection.Course.InstructorId != userId)
                {
                    return Json(new { success = false, message = "Unauthorized access." });
                }

                var uploadedFiles = new List<object>();
                var failedFiles = new List<string>();

                foreach (var file in model.ResourceFiles.Where(f => f != null && f.Length > 0))
                {
                    var resourceUrl = await FileHelper.SaveFileAsync(file, $"video/course/{userId}", _webHostEnvironment);
                    if (!string.IsNullOrEmpty(resourceUrl))
                    {
                        var courseResource = new CourseResource
                        {
                            Id = Guid.NewGuid().ToString(),
                            ResourceUrl = resourceUrl,
                            ResourceName = file.FileName,
                            ResourceSizeInBytes = file.Length,
                            CourseVideoId = model.CourseVideoId
                        };
                        _unitOfWork.CourseResource.Add(courseResource);
                        uploadedFiles.Add(new
                        {
                            name = file.FileName,
                            size = file.Length,
                            id = courseResource.Id
                        });
                    }
                    else
                    {
                        failedFiles.Add(file.FileName);
                    }
                }

                _unitOfWork.Save();

                var successMessage = uploadedFiles.Count > 0
                    ? $"{uploadedFiles.Count} file(s) uploaded successfully."
                    : "No files were uploaded.";

                if (failedFiles.Count > 0)
                {
                    successMessage += $" {failedFiles.Count} file(s) failed to upload.";
                }

                return Json(new
                {
                    success = uploadedFiles.Count > 0,
                    message = successMessage,
                    uploadedCount = uploadedFiles.Count,
                    failedCount = failedFiles.Count,
                    uploadedFiles = uploadedFiles,
                });
            }
            catch (Exception e)
            {
                return Json(new { success = false, message = "An error occurred during file upload." });
            }
        }

        [HttpPost]
        public IActionResult DeleteResource(string id)
        {
            try
            {
                if (string.IsNullOrEmpty(id))
                {
                    return Json(new { success = false, message = $"Cannot find the resource that have id '{id}'." });
                }

                var courseResoucre = _unitOfWork.CourseResource.Get(c => c.Id == id);

                if (courseResoucre == null)
                {
                    return Json(new { success = false, message = $"Cannot find the resource that have id '{id}'." });
                } 
                else
                {
                    if (!string.IsNullOrEmpty(courseResoucre.ResourceUrl))
                    {
                        FileHelper.DeleteFile(courseResoucre.ResourceUrl, _webHostEnvironment);
                    }

                    _unitOfWork.CourseResource.Remove(courseResoucre);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Resource deleted successfully!" });
                }

            } 
            catch (Exception e)
            {
                return Json(new { success = false, message = "An error occurred while deleting the resource. Please try again." });
            }
        }

        [HttpPost]
        public IActionResult TogglePreviewButton(string id)
        {
            try
            {
                if (string.IsNullOrEmpty(id))
                {
                    return Json(new { success = false, message = $"Cannot find the lecture that have id '{id}'." });
                }

                var courseLecture = _unitOfWork.CourseVideo.Get(c => c.Id == id);

                if (courseLecture == null)
                {
                    return Json(new { success = false, message = $"Cannot find the lecture that have id '{id}'." });
                }
                else
                {
                    courseLecture.IsPreview = !courseLecture.IsPreview;

                    _unitOfWork.CourseVideo.Update(courseLecture);
                    _unitOfWork.Save();

                    var message = courseLecture.IsPreview
                        ? "This lecture is now available for preview."
                        : "This lecture is no longer available for preview.";

                    return Json(new { success = true, message = message });
                }
            }
            catch (Exception e)
            {
                return Json(new { success = false, message = "An error occurred while toggling the preview. Please try again." });
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
                includeProperties: "CourseLevel,Category,Subcategory,CourseOutcomes,CourseRequirements,CourseSections,CourseSections.CourseVideos,CourseSections.CourseVideos.CourseResources");

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