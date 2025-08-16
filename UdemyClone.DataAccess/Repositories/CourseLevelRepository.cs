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
    public class CourseLevelRepository : Repository<CourseLevel>, ICourseLevelRepository
    {
        private readonly ApplicationDbContext _db;
        public CourseLevelRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(CourseLevel courseLevel)
        {
            _db.CourseLevels.Update(courseLevel);
        }
    }
}
