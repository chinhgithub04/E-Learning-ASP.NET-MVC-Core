using System.ComponentModel.DataAnnotations;

namespace UdemyClone.ViewModel
{
    public class IntendedLearnersViewModel
    {
        [Required]
        public string CourseId { get; set; }
        public List<string>? LearningOutcomes { get; set; }
        public List<string>? Prerequisites { get; set; }
    }
}