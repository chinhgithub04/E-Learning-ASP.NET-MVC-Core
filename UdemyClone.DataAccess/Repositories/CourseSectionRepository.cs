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
    public class CourseSectionRepository : Repository<CourseSection>, ICourseSectionRepository
    {
        private readonly ApplicationDbContext _db;
        public CourseSectionRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(CourseSection courseSection)
        {
            var existingEntity = _db.CourseSections.Find(courseSection.Id);
            if (existingEntity != null)
            {
                if (!string.IsNullOrEmpty(courseSection.Title))
                {
                    existingEntity.Title = courseSection.Title;
                }

                if (courseSection.DisplayOrder > 0)
                {
                    existingEntity.DisplayOrder = courseSection.DisplayOrder;
                }

                if (courseSection.Duration.HasValue)
                {
                    existingEntity.Duration = courseSection.Duration;
                }

                if (!string.IsNullOrEmpty(courseSection.CourseId))
                {
                    existingEntity.CourseId = courseSection.CourseId;
                }

                _db.CourseSections.Update(existingEntity);
            }
        }
    }
}
