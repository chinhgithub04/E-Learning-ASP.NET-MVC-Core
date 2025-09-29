document.addEventListener('DOMContentLoaded', function () {
    initializeAddToCart();
});

function initializeAddToCart() {
    const buttons = document.querySelectorAll('.add-to-cart');

    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const courseId = button.dataset.courseId;

            e.stopPropagation();
            addToCart(courseId, button);
        });
    });

    function addToCart(courseId, buttonElement) {
        fetch('/User/Cart/AddToCart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(courseId),
        })
            .then(response => {
                if (response.redirected || !response.ok) {
                    sessionStorage.setItem('scrollPosition', window.scrollY);
                    window.location.href = `/Identity/Account/LoginRegister?returnUrl=${encodeURIComponent(window.location.pathname)}`;
                    throw new Error('Authentication required');
                }
                return response.json();
            })
            .then(data => {
                if (data) {
                    if (data.success) {
                        showSuccessAlert(buttonElement, data.message);

                        const actionButtonContainer = buttonElement.parentElement;

                        const goToCartBtn = document.createElement('a');

                        if (window.location.pathname.toLowerCase() === '/user/home/index' || window.location.pathname === '/') {
                            goToCartBtn.className = 'block w-full rounded-lg bg-orange-500 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-orange-600'
                        }
                        else {
                            goToCartBtn.className = 'block w-full cursor-pointer rounded-md bg-orange-500 py-3 text-center font-bold text-white hover:bg-orange-600';
                        }

                        goToCartBtn.href = '/User/Cart/Index';
                        goToCartBtn.textContent = 'Go to cart'

                        buttonElement.remove();
                        actionButtonContainer.insertBefore(goToCartBtn, actionButtonContainer.firstChild);
                        

                    } 
                    else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: data.message || 'Failed to add course to cart.',
                            confirmButtonColor: '#f97316'
                        });
                    }
                }
            })
            .catch(error => {
                if (error.message !== 'Authentication required') {
                    console.error('Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'An error occurred while adding the course to cart.',
                        confirmButtonColor: '#f97316'
                    });
                }
            });
    }

    function showSuccessAlert(buttonElement, message) {
        const courseTitle = buttonElement.dataset.courseTitle || 'Course';
        const courseImage = buttonElement.dataset.courseImage || '/img/course-image-placeholder.webp';
        const instructorName = buttonElement.dataset.instructorName || 'Unknown Instructor';
        const coursePrice = buttonElement.dataset.coursePrice || 'Free';

        Swal.fire({
            title: 'Added to Cart',
            html: `
                <div class="flex items-center space-x-3 text-left">
                    <div class="flex-shrink-0">
                        <img src="${courseImage}" alt="${courseTitle}" class="w-22 h-14 object-cover rounded border">
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="font-semibold text-gray-900 line-clamp-2 mb-1">${courseTitle}</h3>
                        <p class="text-xs text-gray-400 mb-2">By ${instructorName}</p>
                        <p class="text-sm font-bold text-orange-600">${coursePrice}</p>
                    </div>
                    <div class="flex items-center">
                        <a href="/User/Cart" class="ml-4 px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                            Go to cart
                        </a>
                    </div>
                </div>
            `,
            width: '700px',
            showCloseButton: true,
            showConfirmButton: false,
            showCancelButton: false,
        });
    }
}

window.initializeAddToCart = initializeAddToCart;