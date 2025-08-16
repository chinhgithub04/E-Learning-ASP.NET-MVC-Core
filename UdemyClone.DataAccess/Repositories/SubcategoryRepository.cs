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
    public class SubcategoryRepository : Repository<Subcategory>, ISubcategoryRepository
    {
        private readonly ApplicationDbContext _db;
        public SubcategoryRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(Subcategory subcategory)
        {
            _db.Subcategories.Update(subcategory);
        }
    }
}
