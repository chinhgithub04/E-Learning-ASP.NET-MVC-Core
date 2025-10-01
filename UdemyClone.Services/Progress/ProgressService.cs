using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UdemyClone.DataAccess.Interfaces;
using UdemyClone.Models;

namespace UdemyClone.Services.Progress
{
    public class ProgressService : IProgressService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ProgressService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<UserCourseProgress> GetOrCreateCourseProgressAsync(string userId, string courseId)
        {
            var courseProgress = _unitOfWork.UserCourseProgress.Get(
                ucp => ucp.ApplicationUserId == userId && ucp.CourseId == courseId,
                includeProperties: "CurrentVideo");

            if (courseProgress == null)
            {
                courseProgress = new UserCourseProgress
                {
                    Id = Guid.NewGuid().ToString(),
                    ApplicationUserId = userId,
                    CourseId = courseId,
                    CompletedVideos = 0,
                    ProgressPercentage = 0,
                };

                _unitOfWork.UserCourseProgress.Add(courseProgress);
                await _unitOfWork.SaveAsync();
            }

            return courseProgress;
        }

        public async Task<UserVideoProgress> GetOrCreateVideoProgressAsync(string userId, string videoId)
        {
            var video = _unitOfWork.CourseVideo.Get(v => v.Id == videoId, includeProperties: "CourseSection");
            if (video == null)
            {
                throw new Exception("Video not found.");
            }

            var courseProgress = await GetOrCreateCourseProgressAsync(userId, video.CourseSection.CourseId);

            var videoProgress = _unitOfWork.UserVideoProgress.Get(
                uvp => uvp.UserCourseProgressId == courseProgress.Id && uvp.CourseVideoId == videoId);

            if (videoProgress == null)
            {
                videoProgress = new UserVideoProgress
                {
                    Id = Guid.NewGuid().ToString(),
                    UserCourseProgressId = courseProgress.Id,
                    CourseVideoId = videoId,
                    CurrentTime = TimeSpan.Zero,
                    IsCompleted = false
                };

                _unitOfWork.UserVideoProgress.Add(videoProgress);
                await _unitOfWork.SaveAsync();
            }

            return videoProgress;
        }

        public async Task UpdateVideoProgressAsync(string userId, string videoId, TimeSpan currentTime)
        {
            var videoProgress = await GetOrCreateVideoProgressAsync(userId, videoId);
            var video = _unitOfWork.CourseVideo.Get(v => v.Id == videoId, includeProperties: "CourseSection");

            videoProgress.CurrentTime = currentTime;

            if (video?.Duration.HasValue == true && video.Duration.Value.TotalSeconds > 0)
            {
                var watchPercentage = (decimal)(currentTime.TotalSeconds / video.Duration.Value.TotalSeconds * 100);

                if (watchPercentage >= 90 && !videoProgress.IsCompleted)
                {
                    videoProgress.IsCompleted = true;

                    await CalculateCourseProgressAsync(userId, video.CourseSection.CourseId);
                }
            }

            _unitOfWork.UserVideoProgress.Update(videoProgress);

            var courseProgress = await GetOrCreateCourseProgressAsync(userId, video.CourseSection.CourseId);
            courseProgress.CurrentVideoId = videoId;
            _unitOfWork.UserCourseProgress.Update(courseProgress);

            await _unitOfWork.SaveAsync();
        }

        public async Task ToggleVideoCompletionAsync(string userId, string videoId, bool isCompleted)
        {
            var videoProgress = await GetOrCreateVideoProgressAsync(userId, videoId);
            var video = _unitOfWork.CourseVideo.Get(v => v.Id == videoId, includeProperties: "CourseSection");

            if (videoProgress.IsCompleted != isCompleted)
            {
                videoProgress.IsCompleted = isCompleted;
                _unitOfWork.UserVideoProgress.Update(videoProgress);
                await _unitOfWork.SaveAsync();

                await CalculateCourseProgressAsync(userId, video.CourseSection.CourseId);
            }
        }

        public async Task<decimal> CalculateCourseProgressAsync(string userId, string courseId)
        {
            var courseProgress = await GetOrCreateCourseProgressAsync(userId, courseId);
            var course = _unitOfWork.Course.Get(c => c.Id == courseId, includeProperties: "CourseSections.CourseVideos");

            var allVideoIds = course.CourseSections
                .SelectMany(s => s.CourseVideos)
                .Where(v => !string.IsNullOrEmpty(v.VideoUrl))
                .Select(v => v.Id)
                .ToList();

            var completedVideoIds = _unitOfWork.UserVideoProgress.GetAll(
                uvp => uvp.UserCourseProgressId == courseProgress.Id && uvp.IsCompleted)
                .Select(uvp => uvp.CourseVideoId)
                .ToList();

            int completedVideos = allVideoIds.Count(videoId => completedVideoIds.Contains(videoId));

            courseProgress.CompletedVideos = completedVideos;
            courseProgress.ProgressPercentage = allVideoIds.Count > 0 ? Math.Round((decimal)completedVideos / allVideoIds.Count * 100, 2) : 0;

            _unitOfWork.UserCourseProgress.Update(courseProgress);
            await _unitOfWork.SaveAsync();

            return courseProgress.ProgressPercentage;
        }

        public async Task<CourseVideo?> GetLastWatchedVideoAsync(string userId, string courseId)
        {
            var courseProgress = await GetOrCreateCourseProgressAsync(userId, courseId);
            return courseProgress?.CurrentVideo;
        }
    }
}