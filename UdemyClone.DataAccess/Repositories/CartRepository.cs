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
    public class CartRepository : Repository<Cart>, ICartRepository
    {
        private readonly ApplicationDbContext _db;
        public CartRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(Cart cart)
        {
            _db.Update(cart);
        }
    }
}
