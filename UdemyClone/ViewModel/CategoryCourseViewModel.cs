using UdemyClone.Models;

namespace UdemyClone.ViewModel
{
    public class CategoryCourseViewModel
    {
        public IEnumerable<Category> Category { get; set; }
        public IEnumerable<Course> Course { get; set; }
    }
}
