using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UdemyClone.Models;

namespace UdemyClone.DataAccess.Interfaces
{
    public interface IOrderHeaderRepository : IRepository<OrderHeader>
    {
        void Update(OrderHeader orderHeader);
        void UpdateStatus(string orderId, string orderStatus, string? paymentStatus = null);
        void UpdateStripePaymentId(string orderId, string sessionId, string paymentIntentId);
    }
}
