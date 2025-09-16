using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Security.Claims;
using UdemyClone.Common.Constants;
using UdemyClone.Common.Helpers;
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
        public IActionResult Index(string? search = "", string sort = "created-desc")
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var courses = _unitOfWork.Course.GetAll(c => c.InstructorId == userId);

            courses = courses.Where(c => c.Title.Contains(search));

            courses = sort switch
            {
                "created-asc" => courses.OrderBy(c => c.CreatedAt),
                "created-desc" => courses.OrderByDescending(c => c.CreatedAt),
                "title-asc" => courses.OrderBy(c => c.Title),
                "title-desc" => courses.OrderByDescending(c => c.Title),
                "updated-desc" => courses.OrderByDescending(c => c.UpdatedAt ?? c.CreatedAt),
                "updated-asc" => courses.OrderBy(c => c.UpdatedAt ?? c.CreatedAt),
                "price-desc" => courses.OrderByDescending(c => c.Price ?? 0),
                "price-asc" => courses.OrderBy(c => c.Price ?? 0),
                "status-desc" => courses.OrderByDescending(c => c.Status),
                _ => courses.OrderByDescending(c => c.CreatedAt)
            };

            ViewBag.CurrentSearch = search;
            ViewBag.CurrentSort = sort;
            return View(courses);
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
        public IActionResult SaveSectionTitle(CourseSectionViewModel model)
        {
            try
            {
                // Add new section
                if (string.IsNullOrEmpty(model.Id))
                {
                    CourseSection courseSection = new CourseSection
                    {
                        Id = Guid.NewGuid().ToString(),
                        Title = model.Title,
                        DisplayOrder = model.DisplayOrder,
                        CourseId = model.CourseId
                    };

                    _unitOfWork.CourseSection.Add(courseSection);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Course section added successfully!", id = courseSection.Id });
                }
                else
                {
                    var courseSection = _unitOfWork.CourseSection.Get(c => c.Id == model.Id);
                    if (courseSection == null)
                    {
                        return Json(new { success = false, message = "Cannot find this section." });
                    }

                    courseSection.Title = model.Title;

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
        public IActionResult DeleteSection(string id)
        {
            try
            {
                if (string.IsNullOrEmpty(id))
                {
                    return Json(new { success = false, message = "Id not found"});
                }

                var courseSection = _unitOfWork.CourseSection.Get(c => c.Id == id, includeProperties: "CourseVideos,CourseVideos.CourseResources,Course");
                if (courseSection == null)
                {
                    return Json(new { success = false, message = "Cannot find this section" });
                }

                foreach (var video in courseSection.CourseVideos)
                {

                    if (!string.IsNullOrEmpty(video.VideoUrl))
                    {
                        FileHelper.DeleteFile(video.VideoUrl, _webHostEnvironment);
                    }

                    foreach (var resource in video.CourseResources)
                    {
                        if (!string.IsNullOrEmpty(resource.ResourceUrl))
                        {
                            FileHelper.DeleteFile(resource.ResourceUrl, _webHostEnvironment);
                        }
                    }
                }

                var nextSections = _unitOfWork.CourseSection.GetAll(s => s.DisplayOrder > courseSection.DisplayOrder);
                foreach (var section in nextSections)
                {
                    section.DisplayOrder -= 1;
                    _unitOfWork.CourseSection.Update(section);
                }

                _unitOfWork.CourseSection.Remove(courseSection);
                _unitOfWork.Save();

                UpdateCourseDuration(courseSection.CourseId);
                return Json(new { success = true, message = "Deleted successfully!", courseDuration = courseSection.Course.Duration });

            }
            catch (Exception e)
            {
                return Json(new { success = false, message = e.Message });

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
                return Json(new { success = false, message = "An error occurred while updating the lecture order." });
            }
        }

        [HttpPost]
        public IActionResult UpdateSectionOrder([FromBody] List<LectureOrderViewModel> items)
        {
            if (items == null || !items.Any())
            {
                return Json(new { success = false, message = "No items to update." });
            }

            try
            {
                var sectionsToUpdate = _unitOfWork.CourseSection.GetAll(s => items.Select(i => i.Id).Contains(s.Id)).ToList();

                if (sectionsToUpdate.Count != items.Count)
                {
                    return Json(new { success = false, message = "Some sections could not be found. Please refresh the page." });
                }

                foreach (var item in items)
                {
                    var section = sectionsToUpdate.FirstOrDefault(s => s.Id == item.Id);
                    if (section != null)
                    {
                        section.DisplayOrder = item.DisplayOrder;
                        _unitOfWork.CourseSection.Update(section);
                    }
                }

                _unitOfWork.Save();
                return Json(new { success = true, message = "Section order updated successfully." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "An error occurred while updating the section order." });
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

                var courseVideo = _unitOfWork.CourseVideo.Get(c => c.Id == id, includeProperties: "CourseResources,CourseSection,CourseSection.Course");
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

                    foreach (var resource in courseVideo.CourseResources)
                    {
                        if (!string.IsNullOrEmpty(resource.ResourceUrl))
                        {
                            FileHelper.DeleteFile(resource.ResourceUrl, _webHostEnvironment);
                        }
                    }

                    var nextCourseVideos = _unitOfWork.CourseVideo.GetAll(c => c.DisplayOrder > courseVideo.DisplayOrder);
                    foreach (var video in nextCourseVideos)
                    {
                        video.DisplayOrder -= 1;
                        _unitOfWork.CourseVideo.Update(video);
                    }

                    _unitOfWork.CourseVideo.Remove(courseVideo);
                    _unitOfWork.Save();

                    UpdateCourseSectionDuration(courseVideo.CourseSectionId);
                    return Json(new { success = true, message = "Lecture deleted successfully!", courseDuration = courseVideo.CourseSection.Course.Duration});

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

                UpdateCourseSectionDuration(courseVideo.CourseSectionId);

                return Json(new { success = true, message = "Video uploaded successfully.", title = courseVideo.Title, lectureDuration = duration, courseDuration = courseVideo.CourseSection.Course.Duration });
            }
            catch (Exception e)
            {
                return Json(new { success = false, message = "An error occurred during video upload." });
            }
        }

        public void UpdateCourseSectionDuration(string courseSectionId)
        {
            try
            {
                var courseSection = _unitOfWork.CourseSection.Get(c => c.Id == courseSectionId, includeProperties: "CourseVideos");

                if (courseSection == null)
                {
                    return;
                } 
                else
                {
                    var courseVideos = _unitOfWork.CourseVideo.GetAll(c => c.CourseSectionId == courseSectionId);

                    TimeSpan duration = TimeSpan.Zero;

                    foreach (var video in courseVideos)
                    {
                        if (video.Duration.HasValue)
                        {
                            duration += (TimeSpan) video.Duration;
                        }
                    }

                    courseSection.Duration = duration;

                    _unitOfWork.CourseSection.Update(courseSection);
                    _unitOfWork.Save();

                    UpdateCourseDuration(courseSection.CourseId);
                }
            }
            catch (Exception e)
            {
                
            }
        }

        public void UpdateCourseDuration (string courseId)
        {
            try
            {
                var course = _unitOfWork.Course.Get(c => c.Id == courseId, includeProperties: "CourseSections", tracked: true);
                if (course == null)
                {
                    return;
                }
                else
                {
                    var courseSections = _unitOfWork.CourseSection.GetAll(c => c.CourseId == courseId);

                    TimeSpan duration = TimeSpan.Zero;

                    foreach (var section in courseSections)
                    {
                        if (section.Duration.HasValue)
                        {
                            duration += (TimeSpan)section.Duration;
                        }
                    }

                    course.Duration = duration;

                    _unitOfWork.Save();

                }
            }
            catch (Exception e)
            {

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

        [HttpPost]
        public IActionResult SavePricing([FromBody] CoursePriceViewModel model)
        {
            try
            {
                var course = _unitOfWork.Course.Get(c => c.Id == model.Id);
                if (course == null)
                {
                    return Json(new { success = false, message = "Course not found." });
                }

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (course.InstructorId != userId)
                {
                    return Json(new { success = false, message = "Unauthorized access." });
                }

                if (model.Price > 0 && model.Price < 1.99m)
                {
                    model.Price = 1.99m;
                }

                course.Price = model.Price;
                course.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.Course.Update(course);
                _unitOfWork.Save();

                return Json(new { success = true, message = "Course pricing saved successfully!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "An error occurred while saving the pricing. Please try again." });
            }
        }

        [HttpPost]
        public IActionResult ReviewCourse([FromBody] string id)
        {
            try
            {
                if (string.IsNullOrEmpty(id))
                {
                    return Json(new { success = false, message = "Id not found" });
                }

                var course = _unitOfWork.Course.Get(c => c.Id == id, includeProperties: "CourseSections,CourseOutcomes,CourseRequirements,CourseSections.CourseVideos");
                if (course == null)
                {
                    return Json(new { success = false, message = "Course not found" });
                }

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (course.InstructorId != userId)
                {
                    return Json(new { success = false, message = "Unauthorized access." });
                }

                var hasCourseOutcomes = course.CourseOutcomes.Any() == true;
                var hasRequiremenes = course.CourseRequirements.Any() == true;
                var isCourseDurationGreaterThan30 = course.Duration >= TimeSpan.FromMinutes(30);
                var hasAtLeastFiveVideosInSections = course.CourseSections?.Any(s => s.CourseVideos.ToList().Count() >= 5 == true) == true;
                var hasTitle = !string.IsNullOrEmpty(course.Title);
                var hasSubTitle = !string.IsNullOrEmpty(course.Subtitle);
                var hasAtLeast200WordsDescription = course.Description?.Length >= 200;
                var hasLevel = course.CourseLevelId != null;
                var hasCategory = course.CategoryId != null;
                var hasSubcategory = course.SubcategoryId != null;
                var hasCourseImage = !string.IsNullOrEmpty(course.ImageUrl);

                var isEligibleToPublish = hasCourseOutcomes &&
                                          hasRequiremenes &&
                                          isCourseDurationGreaterThan30 &&
                                          hasAtLeastFiveVideosInSections &&
                                          hasTitle &&
                                          hasSubTitle &&
                                          hasAtLeast200WordsDescription &&
                                          hasLevel &&
                                          hasCategory &&
                                          hasSubcategory &&
                                          hasCourseImage;

                if (isEligibleToPublish)
                {
                    course.Status = CourseStatus.PendingReview;
                    course.UpdatedAt = DateTime.UtcNow;
                    _unitOfWork.Course.Update(course);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Update successful. We'll notify you when your course is ready to go live." });
                }
                else
                {
                    return Json(new {
                        success = false, 
                        message = "Your course is not eligible for publishing. Please complete the information and try again.",
                        hasCourseOutcomes = hasCourseOutcomes,
                        hasRequiremenes = hasRequiremenes,
                        isCourseDurationGreaterThan30 = isCourseDurationGreaterThan30,
                        hasAtLeastFiveVideosInSections = hasAtLeastFiveVideosInSections,
                        hasTitle = hasTitle,
                        hasSubTitle = hasSubTitle,
                        hasAtLeast200WordsDescription = hasAtLeast200WordsDescription,
                        hasLevel = hasLevel,
                        hasCategory = hasCategory,
                        hasSubcategory = hasSubcategory,
                        hasCourseImage = hasCourseImage
                    });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "An error occurred while saving the pricing. Please try again." });
            }
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
                "settings" => PartialView("_Settings", course),
                _ => PartialView("_IntendedLearners", course)
            };
        }
    }

}