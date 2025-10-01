using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UdemyClone.Models;

namespace UdemyClone.DataAccess.Interfaces
{
    public interface IUserCourseProgressRepository : IRepository<UserCourseProgress>
    {
        void Update(UserCourseProgress userCourseProgress);
    }
}
