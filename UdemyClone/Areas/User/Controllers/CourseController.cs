using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Security.Claims;
using UdemyClone.Common.Constants;
using UdemyClone.DataAccess.Interfaces;
using UdemyClone.Models;
using UdemyClone.Services;
using UdemyClone.Services.Progress;
using UdemyClone.ViewModel;

namespace UdemyClone.Areas.User.Controllers
{
    [Area("User")]
    public class CourseController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProgressService _progressService;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public CourseController(IUnitOfWork unitOfWork, IProgressService progressService, IWebHostEnvironment webHostEnvironment)
        {
            _unitOfWork = unitOfWork;
            _progressService = progressService;
            _webHostEnvironment = webHostEnvironment;
        }

        public IActionResult Index(string id)
        {
            try
            {
                if (string.IsNullOrEmpty(id))
                {
                    return BadRequest();
                }

                var course = _unitOfWork.Course.Get(c => c.Id == id && c.Status == CourseStatus.Published, includeProperties: "Subcategory,Instructor,Instructor.ApplicationUser,CourseLevel,CourseOutcomes,CourseRequirements,CourseSections,CourseSections.CourseVideos,CourseSections.CourseVideos.CourseResources");

                if (course == null)
                {
                    return NotFound();
                }
                return View(course);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        public async Task<IActionResult> Learn(string courseId, string? lectureId)
        {
            try
            {
                if (string.IsNullOrEmpty(courseId))
                {
                    return BadRequest();
                }

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                // Check if user has access to this course
                var purchasedCourses = _unitOfWork.OrderHeader.GetAll(
                    o => o.ApplicationUserId == userId &&
                         o.OrderStatus == OrderStatus.Completed &&
                         o.PaymentStatus == PaymentStatus.Paid &&
                         !string.IsNullOrEmpty(o.PaymentIntentId),
                    includeProperties: "OrderDetails");

                var hasAccess = purchasedCourses.Any(o => o.OrderDetails.Any(od => od.CourseId == courseId));

                // Get the course with all videos
                var course = _unitOfWork.Course.Get(
                    c => c.Id == courseId,
                    includeProperties: "CourseSections,CourseSections.CourseVideos,CourseSections.CourseVideos.CourseResources,Instructor,Instructor.ApplicationUser");

                if (course == null)
                {
                    return NotFound();
                }

                // Check if course is free
                var isFree = !course.Price.HasValue || course.Price.Value == 0;

                if (!hasAccess && !isFree)
                {
                    TempData["error"] = "You don't have access to this course. Please purchase it first.";
                    return RedirectToAction("Index", new { id = courseId });
                }

                // Get all videos in order
                var allVideos = course.CourseSections
                    .OrderBy(s => s.DisplayOrder)
                    .SelectMany(s => s.CourseVideos.OrderBy(v => v.DisplayOrder))
                    .Where(v => !string.IsNullOrEmpty(v.VideoUrl))
                    .ToList();

                if (!allVideos.Any())
                {
                    TempData["error"] = "No videos available for this course.";
                    return RedirectToAction("Index", new { id = courseId });
                }

                // Get or create course progress
                var courseProgress = await _progressService.GetOrCreateCourseProgressAsync(userId, courseId);

                // Determine current video
                CourseVideo currentVideo;
                if (!string.IsNullOrEmpty(lectureId))
                {
                    currentVideo = allVideos.FirstOrDefault(v => v.Id == lectureId);
                    if (currentVideo == null)
                    {
                        currentVideo = allVideos.First();
                    }
                    else
                    {
                        // Update the current video ID when a specific lecture is requested
                        courseProgress.CurrentVideoId = currentVideo.Id;
                        _unitOfWork.UserCourseProgress.Update(courseProgress);
                        await _unitOfWork.SaveAsync();
                    }
                }
                else
                {
                    var lastWatchedVideo = await _progressService.GetLastWatchedVideoAsync(userId, courseId);
                    if (lastWatchedVideo != null)
                    {
                        currentVideo = allVideos.FirstOrDefault(v => v.Id == lastWatchedVideo.Id) ?? allVideos.First();
                    }
                    else
                    {
                        currentVideo = allVideos.First();
                    }
                }

                var currentIndex = allVideos.IndexOf(currentVideo);
                var nextVideo = currentIndex < allVideos.Count - 1 ? allVideos[currentIndex + 1] : null;
                var previousVideo = currentIndex > 0 ? allVideos[currentIndex - 1] : null;

                // Get video progresses
                var videoProgresses = _unitOfWork.UserVideoProgress.GetAll(
                    uvp => uvp.UserCourseProgressId == courseProgress.Id &&
                           allVideos.Select(v => v.Id).Contains(uvp.CourseVideoId),
                    includeProperties: "CourseVideo")
                    .ToList();

                var currentVideoProgress = await _progressService.GetOrCreateVideoProgressAsync(userId, currentVideo.Id);

                var viewModel = new LearnViewModel
                {
                    Course = course,
                    CurrentVideo = currentVideo,
                    NextVideo = nextVideo,
                    PreviousVideo = previousVideo,
                    CourseSections = course.CourseSections.OrderBy(s => s.DisplayOrder).ToList(),
                    CurrentVideoIndex = currentIndex + 1,
                    TotalVideos = allVideos.Count,
                    HasAccess = hasAccess || isFree,
                    CourseProgress = courseProgress,
                    CurrentVideoProgress = currentVideoProgress,
                    VideoProgresses = videoProgresses,
                    OverallProgress = courseProgress.ProgressPercentage
                };

                return View(viewModel);
            }
            catch (Exception ex)
            {
                TempData["error"] = "An error occurred while loading the course.";
                return RedirectToAction("Index", "Home");
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> UpdateVideoProgress([FromBody] VideoProgressModel model)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                await _progressService.UpdateVideoProgressAsync(
                    userId,
                    model.VideoId,
                    TimeSpan.FromSeconds(model.CurrentTime));

                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> ToggleVideoCompletion([FromBody] VideoToggleCompleteViewModel model)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                await _progressService.ToggleVideoCompletionAsync(userId, model.VideoId, model.IsCompleted);

                var video = _unitOfWork.CourseVideo.Get(v => v.Id == model.VideoId, includeProperties: "CourseSection");
                var courseProgress = await _progressService.GetOrCreateCourseProgressAsync(userId, video.CourseSection.CourseId);

                return Json(new { success = true, progress = courseProgress.ProgressPercentage, completedVideos = courseProgress.CompletedVideos });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        public IActionResult DownloadResource(string id)
        {
            try
            {
                if (string.IsNullOrEmpty(id))
                {
                    return BadRequest("Resource ID is required.");
                }

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                // Get the resource with course information
                var resource = _unitOfWork.CourseResource.Get(
                    r => r.Id == id,
                    includeProperties: "CourseVideo,CourseVideo.CourseSection,CourseVideo.CourseSection.Course");

                if (resource == null)
                {
                    return NotFound("Resource not found.");
                }

                var course = resource.CourseVideo.CourseSection.Course;

                // Check if user has access to this course
                var purchasedCourses = _unitOfWork.OrderHeader.GetAll(
                    o => o.ApplicationUserId == userId &&
                         o.OrderStatus == OrderStatus.Completed &&
                         o.PaymentStatus == PaymentStatus.Paid &&
                         !string.IsNullOrEmpty(o.PaymentIntentId),
                    includeProperties: "OrderDetails");

                var hasAccess = purchasedCourses.Any(o => o.OrderDetails.Any(od => od.CourseId == course.Id));

                // Check if course is free
                var isFree = !course.Price.HasValue || course.Price.Value == 0;

                if (!hasAccess && !isFree)
                {
                    return Forbid("You don't have access to this course.");
                }

                // Get the physical file path
                var filePath = Path.Combine(_webHostEnvironment.WebRootPath, resource.ResourceUrl.TrimStart('/'));

                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound("File not found on server.");
                }

                // Get MIME type
                var mimeType = GetMimeType(resource.ResourceName);

                // Return the file for download
                var fileBytes = System.IO.File.ReadAllBytes(filePath);
                return File(fileBytes, mimeType, resource.ResourceName);
            }
            catch (Exception ex)
            {
                return BadRequest("An error occurred while downloading the resource.");
            }
        }

        private string GetMimeType(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls" => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".ppt" => "application/vnd.ms-powerpoint",
                ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                ".txt" => "text/plain",
                ".zip" => "application/zip",
                ".rar" => "application/x-rar-compressed",
                ".7z" => "application/x-7z-compressed",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".mp3" => "audio/mpeg",
                ".mp4" => "video/mp4",
                ".avi" => "video/x-msvideo",
                _ => "application/octet-stream"
            };
        }

        public IActionResult Overview(string id)
        {
            var course = _unitOfWork.Course.Get(c => c.Id == id, includeProperties: "CourseOutcomes,CourseRequirements");
            return PartialView("_Overview", course);
        }

        public IActionResult Curriculum(string id)
        {
            var course = _unitOfWork.Course.Get(c => c.Id == id, includeProperties: "CourseSections,CourseSections.CourseVideos");
            return PartialView("_Curriculum", course);
        }

        public IActionResult Instructor(string id)
        {
            var course = _unitOfWork.Course.Get(c => c.Id == id, includeProperties: "Instructor.ApplicationUser");
            return PartialView("_Instructor", course);
        }

        public IActionResult Review(string id)
        {
            return PartialView("_Review");
        }
    }
}