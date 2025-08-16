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
    public class InstructorRepository : Repository<Instructor>, IInstructorRepository
    {
        private readonly ApplicationDbContext _db;
        public InstructorRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(Instructor instructor)
        {
            _db.Instructors.Update(instructor);
        }
    }
}
