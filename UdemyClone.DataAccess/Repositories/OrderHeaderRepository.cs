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
    public class OrderHeaderRepository : Repository<OrderHeader>, IOrderHeaderRepository
    {
        private readonly ApplicationDbContext _db;
        public OrderHeaderRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(OrderHeader orderHeader)
        {
            _db.OrderHeaders.Update(orderHeader);
        }

        public void UpdateStatus(string orderId, string orderStatus, string? paymentStatus = null)
        {
            var orderHeader = _db.OrderHeaders.FirstOrDefault(u => u.Id == orderId);
            if (orderHeader != null)
            {
                orderHeader.OrderStatus = orderStatus;
                if (!string.IsNullOrEmpty(paymentStatus))
                {
                    orderHeader.PaymentStatus = paymentStatus;
                }
            }
        }

        public void UpdateStripePaymentId(string orderId, string sessionId, string paymentIntentId)
        {
            var orderHeader = _db.OrderHeaders.FirstOrDefault(u => u.Id == orderId);
            if (orderHeader != null)
            {
                if (!string.IsNullOrEmpty(sessionId))
                {
                    orderHeader.SessionId = sessionId;
                }
                if (!string.IsNullOrEmpty(paymentIntentId))
                {
                    orderHeader.PaymentIntentId = paymentIntentId;
                    orderHeader.PaymentDate = DateTime.Now;
                }
            }
        }
    }
}
