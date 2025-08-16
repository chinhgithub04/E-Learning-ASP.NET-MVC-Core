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
    public class CourseOutcomeRepository : Repository<CourseOutcome>, ICourseOutcomeRepository
    {
        private readonly ApplicationDbContext _db;
        public CourseOutcomeRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(CourseOutcome courseOutcome)
        {
            _db.Update(courseOutcome);
        }
    }
}
