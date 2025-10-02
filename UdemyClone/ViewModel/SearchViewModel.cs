using UdemyClone.Models;

namespace UdemyClone.ViewModel
{
    public class SearchViewModel
    {
        public string? SearchQuery { get; set; }
        public string? CategoryId { get; set; }
        public string? SubcategoryId { get; set; }
        public string? CourseLevelId { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? SortBy { get; set; }
        public bool ShowFreeOnly { get; set; }
        public bool ShowPaidOnly { get; set; }
        
        public IEnumerable<Course> Courses { get; set; } = new List<Course>();
        public int TotalResults { get; set; }
        public int CurrentPage { get; set; } = 1;
        public int PageSize { get; set; } = 12;
        public int TotalPages => (int)Math.Ceiling((double)TotalResults / PageSize);
        
        public IEnumerable<Category> Categories { get; set; } = new List<Category>();
        public IEnumerable<Subcategory> Subcategories { get; set; } = new List<Subcategory>();
        public IEnumerable<CourseLevel> CourseLevels { get; set; } = new List<CourseLevel>();
    }
}