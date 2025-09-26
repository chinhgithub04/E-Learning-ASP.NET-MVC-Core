document.addEventListener('DOMContentLoaded', function () {
    const removeFromCartBtn = document.querySelectorAll('.remove-from-cart');

    removeFromCartBtn.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

            const cartId = e.currentTarget.getAttribute('data-cart-id');
            const cartItem = e.currentTarget.closest('.cart-item');

            fetch('/User/Cart/RemoveFromCart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cartId)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        cartItem.style.transition = 'opacity 0.3s ease';
                        cartItem.style.opacity = '0';

                        setTimeout(() => {
                            cartItem.remove();
                            window.location.reload();
                        }, 300);
                    } else {
                        alert(data.message || 'Error removing course from cart.');
                    }
                })
                .catch(error => {
                    alert('An error occurred while removing the course.');
                });
        });
    });
});