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
    public class CourseResourceRepository : Repository<CourseResource>, ICourseResourceRepository
    {
        private readonly ApplicationDbContext _db;
        public CourseResourceRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(CourseResource courseResource)
        {
            _db.Update(courseResource);
        }
    }
}