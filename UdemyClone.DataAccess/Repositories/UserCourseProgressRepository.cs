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
    public class UserCourseProgressRepository : Repository<UserCourseProgress>, IUserCourseProgressRepository
    {
        private ApplicationDbContext _db;
        public UserCourseProgressRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(UserCourseProgress userCourseProgress)
        {
            _db.UserCourseProgresses.Update(userCourseProgress);
        }
    }
}
