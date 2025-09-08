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
    public class UnitOfWork : IUnitOfWork
    {
        public ICategoryRepository Category { get; private set; }
        public ISubcategoryRepository Subcategory { get; private set; }
        public IInstructorRepository Instructor { get; private set; }

        public ICourseLevelRepository CourseLevel { get; private set; }

        public ICourseRepository Course { get; private set; }

        public ICourseOutcomeRepository CourseOutcome { get; private set; }

        public ICourseRequirementRepository CourseRequirement { get; private set; }

        public ICourseSectionRepository CourseSection { get; private set; }

        public ICourseVideoRepository CourseVideo { get; private set; } 
        public ICourseResourceRepository CourseResource { get; private set; }

        private readonly ApplicationDbContext _db;
        public UnitOfWork(ApplicationDbContext db)
        {
            _db = db;
            Category = new CategoryRepository(_db);
            Subcategory = new SubcategoryRepository(_db);
            Instructor = new InstructorRepository(_db);
            CourseLevel = new CourseLevelRepository(_db);
            Course = new CourseRepository(_db);
            CourseOutcome = new CourseOutcomeRepository(_db);
            CourseRequirement = new CourseRequirementRepository(_db);
            CourseSection = new CourseSectionRepository(_db);
            CourseVideo = new CourseVideoRepository(_db);
            CourseResource = new CourseResourceRepository(_db);
        }
        public void Save()
        {
            _db.SaveChanges();
        }
    }
}
