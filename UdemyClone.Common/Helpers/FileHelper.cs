using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting; // <-- Add this using directive
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UdemyClone.Common.Helpers
{
    public static class FileHelper
    {
        public static async Task<string> SaveFileAsync(IFormFile file, string subDirectory, IWebHostEnvironment webHostEnvironment)
        {
            try
            {
                var wwwRootPath = webHostEnvironment.WebRootPath;
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

        public static void DeleteFile(string filePath, IWebHostEnvironment webHostEnvironment)
        {
            try
            {
                if (!string.IsNullOrEmpty(filePath))
                {
                    var wwwRootPath = webHostEnvironment.WebRootPath;
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
    }
}