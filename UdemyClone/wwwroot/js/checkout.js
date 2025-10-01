document.addEventListener('DOMContentLoaded', function () {
    const checkoutBtn = document.getElementById('checkout');
    const courseIdList = Array.from(document.querySelectorAll('input[name="CourseId"]')).map(li => li.value);

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function () {
            const returnUrl = window.location.href;

            fetch('/User/Checkout/Checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    courseIds: courseIdList,
                    returnUrl: returnUrl
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.checkoutUrl) {
                        window.location.href = data.checkoutUrl;
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        });
    }
});