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
    public class UserVideoProgressRepository : Repository<UserVideoProgress>, IUserVideoProgressRepository
    {
        private ApplicationDbContext _db;
        public UserVideoProgressRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(UserVideoProgress userVideoProgress)
        {
            _db.UserVideoProgresses.Update(userVideoProgress);
        }
    }
}
