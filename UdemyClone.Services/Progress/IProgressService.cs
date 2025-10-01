using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UdemyClone.Models;

namespace UdemyClone.Services.Progress
{
    public interface IProgressService
    {
        Task<UserCourseProgress> GetOrCreateCourseProgressAsync(string userId, string courseId);
        Task<UserVideoProgress> GetOrCreateVideoProgressAsync(string userId, string videoId);
        Task UpdateVideoProgressAsync(string userId, string videoId, TimeSpan currentTime);
        Task ToggleVideoCompletionAsync(string userId, string videoId, bool isCompleted);
        Task<decimal> CalculateCourseProgressAsync(string userId, string courseId);
        Task<CourseVideo?> GetLastWatchedVideoAsync(string userId, string courseId);
    }
}
