using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UdemyClone.DataAccess.Interfaces
{
    public interface IUnitOfWork
    {
        ICategoryRepository Category { get; }
        ISubcategoryRepository Subcategory { get; }
        IInstructorRepository Instructor { get; }
        ICourseLevelRepository CourseLevel { get; }
        ICourseRepository Course { get; }
        ICourseOutcomeRepository CourseOutcome { get; }
        ICourseRequirementRepository CourseRequirement { get; }
        void Save();
    }
}
