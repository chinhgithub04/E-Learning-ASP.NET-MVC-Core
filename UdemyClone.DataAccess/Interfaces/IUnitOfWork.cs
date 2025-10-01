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
        ICourseSectionRepository CourseSection { get; }
        ICourseVideoRepository CourseVideo { get; }
        ICourseResourceRepository CourseResource { get; }
        ICartRepository Cart{ get; }
        IOrderHeaderRepository OrderHeader { get; }
        IOrderDetailRepository OrderDetail { get; }
        IApplicationUserRepository ApplicationUser { get; }
        IUserCourseProgressRepository UserCourseProgress { get; }
        IUserVideoProgressRepository UserVideoProgress { get; }
        void Save();
        Task SaveAsync();
    }
}
