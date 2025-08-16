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
    public class CourseRequirementRepository : Repository<CourseRequirement>, ICourseRequirementRepository
    {
        private readonly ApplicationDbContext _db;
        public CourseRequirementRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(CourseRequirement courseRequirement)
        {
            _db.CourseRequirements.Update(courseRequirement);
        }
    }
}
