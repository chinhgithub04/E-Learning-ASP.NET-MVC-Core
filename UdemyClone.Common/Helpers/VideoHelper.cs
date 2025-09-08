using FFMpegCore;
using Microsoft.AspNetCore.Hosting;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UdemyClone.Common.Helpers
{
    public static class VideoHelper
    {
        public static async Task<TimeSpan?> GetVideoDurationAsync(string filePath, IWebHostEnvironment webHostEnvironment)
        {
            try
            {
                var wwwRootPath = webHostEnvironment.WebRootPath;
                var fullVideoPath = Path.Combine(wwwRootPath, filePath.TrimStart('/'));
                var mediaInfo = await FFProbe.AnalyseAsync(fullVideoPath);
                return mediaInfo.Duration;
            }
            catch (Exception)
            {
                return null;
            }
        }
    }
}