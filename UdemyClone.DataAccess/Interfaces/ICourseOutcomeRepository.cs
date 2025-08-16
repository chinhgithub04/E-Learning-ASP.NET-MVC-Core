using NuGet.Protocol.Core.Types;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UdemyClone.DataAccess.Repositories;
using UdemyClone.Models;

namespace UdemyClone.DataAccess.Interfaces
{
    public interface ICourseOutcomeRepository : IRepository<CourseOutcome>
    {
        void Update(CourseOutcome courseOutcome);
    }
}
