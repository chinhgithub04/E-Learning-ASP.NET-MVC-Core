using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UdemyClone.DataAccess.Data;
using UdemyClone.DataAccess.Interfaces;
using UdemyClone.Models;

namespace UdemyClone.DataAccess.Repositories
{
    public class CourseVideoRepository : Repository<CourseVideo>, ICourseVideoRepository
    {
        private readonly ApplicationDbContext _db;
        public CourseVideoRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(CourseVideo courseVideo)
        {
            _db.CourseVideos.Update(courseVideo);
        }
    }
}