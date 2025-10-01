using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UdemyClone.ViewModel
{
    public class CourseRatingStatsViewModel
    {
        public string CourseId { get; set; }
        public double AverageRating { get; set; }
        public int TotalRatings { get; set; }
        
        public Dictionary<int, int> RatingDistribution { get; set; } = new Dictionary<int, int>
        {
            { 5, 0 },
            { 4, 0 },
            { 3, 0 },
            { 2, 0 },
            { 1, 0 }
        };
        
        public Dictionary<int, double> RatingPercentages
        {
            get
            {
                if (TotalRatings == 0)
                {
                    return new Dictionary<int, double>
                    {
                        { 5, 0 }, { 4, 0 }, { 3, 0 }, { 2, 0 }, { 1, 0 }
                    };
                }
                
                return RatingDistribution.ToDictionary(
                    kvp => kvp.Key,
                    kvp => Math.Round((double)kvp.Value / TotalRatings * 100, 1)
                );
            }
        }
        
        public List<CourseRatingViewModel> RecentRatings { get; set; } = new List<CourseRatingViewModel>();
    }
}
