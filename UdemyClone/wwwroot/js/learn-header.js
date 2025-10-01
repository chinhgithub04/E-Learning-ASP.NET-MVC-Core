document.addEventListener('DOMContentLoaded', function () {
    const ratingModal = document.getElementById('ratingModal');
    const leaveRatingBtn = document.getElementById('leaveRatingBtn');
    const editRatingBtn = document.getElementById('editRatingBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelRatingBtn = document.getElementById('cancelRatingBtn');
    const submitRatingBtn = document.getElementById('submitRatingBtn');
    const reviewText = document.getElementById('reviewText');
    const charCount = document.getElementById('charCount');
    const starRating = document.getElementById('starRating');

    const menuButton = document.getElementById('menuButton');
    const menuDropdown = document.getElementById('menuDropdown');

    let selectedRating = 0;
    let isEditMode = false;

    initializeRatingModal();
    initializeMenuDropdown();

    function initializeRatingModal() {
        if (leaveRatingBtn) {
            leaveRatingBtn.addEventListener('click', function () {
                isEditMode = false;
                openRatingModal();
            });
        }

        if (editRatingBtn) {
            editRatingBtn.addEventListener('click', function () {
                isEditMode = true;
                loadExistingRating();
                openRatingModal();
                closeMenuDropdown();
            });
        }

        // Close modal buttons
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeRatingModal);
        }

        if (cancelRatingBtn) {
            cancelRatingBtn.addEventListener('click', closeRatingModal);
        }

        if (ratingModal) {
            ratingModal.addEventListener('click', function (e) {
                if (e.target === ratingModal) {
                    closeRatingModal();
                }
            });
        }

        if (starRating) {
            const stars = starRating.querySelectorAll('i');
            stars.forEach((star, index) => {

                star.addEventListener('click', function () {
                    selectedRating = parseInt(this.getAttribute('data-rating'));
                    updateStarDisplay(selectedRating);
                    enableSubmitButton();
                });

                star.addEventListener('mouseenter', function () {
                    const hoverRating = parseInt(this.getAttribute('data-rating'));
                    updateStarDisplay(hoverRating);
                });

                starRating.addEventListener('mouseleave', function () {
                    updateStarDisplay(selectedRating);
                });
            });
        }

        if (reviewText) {
            reviewText.addEventListener('input', function () {
                charCount.textContent = this.value.length;
            });
        }

        if (submitRatingBtn) {
            submitRatingBtn.addEventListener('click', submitRating);
        }
    }

    function initializeMenuDropdown() {
        if (menuButton && menuDropdown) {
            menuButton.addEventListener('click', function (e) {
                e.stopPropagation();
                toggleMenuDropdown();
            });

            document.addEventListener('click', function (e) {
                if (!menuDropdown.contains(e.target) && e.target !== menuButton) {
                    closeMenuDropdown();
                }
            });
        }
    }

    function openRatingModal() {
        if (ratingModal) {
            ratingModal.classList.remove('hidden');
            ratingModal.classList.add('flex');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeRatingModal() {
        if (ratingModal) {
            ratingModal.classList.add('hidden');
            ratingModal.classList.remove('flex');
            document.body.style.overflow = '';
            resetRatingForm();
        }
    }

    function toggleMenuDropdown() {
        if (menuDropdown) {
            menuDropdown.classList.toggle('hidden');
        }
    }

    function closeMenuDropdown() {
        if (menuDropdown) {
            menuDropdown.classList.add('hidden');
        }
    }

    function updateStarDisplay(rating) {
        const stars = starRating.querySelectorAll('i');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('text-gray-600');
                star.classList.add('text-orange-500');
            } else {
                star.classList.remove('text-orange-500');
                star.classList.add('text-gray-600');
            }
        });
    }

    function enableSubmitButton() {
        if (submitRatingBtn && selectedRating > 0) {
            submitRatingBtn.disabled = false;
        }
    }

    function resetRatingForm() {
        selectedRating = 0;
        updateStarDisplay(0);
        if (reviewText) {
            reviewText.value = '';
            charCount.textContent = '0';
        }
        if (submitRatingBtn) {
            submitRatingBtn.disabled = true;
        }
    }

    function loadExistingRating() {
        const courseId = document.getElementById('courseVideo')?.getAttribute('data-course-id');
        if (!courseId) return;

        fetch(`/User/Course/GetUserRating?courseId=${courseId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.rating) {
                    selectedRating = data.rating.rating;
                    updateStarDisplay(selectedRating);
                    if (reviewText && data.rating.review) {
                        reviewText.value = data.rating.review;
                        charCount.textContent = data.rating.review.length;
                    }
                    enableSubmitButton();
                }
            })
            .catch(error => {
                console.error('Error loading rating:', error);
            });
    }

    function submitRating() {
        if (selectedRating === 0) {
            showError('Please select a rating');
            return;
        }

        const courseId = document.getElementById('courseVideo')?.getAttribute('data-course-id');
        if (!courseId) {
            showError('Course ID not found');
            return;
        }

        const ratingData = {
            courseId: courseId,
            rating: selectedRating,
            review: reviewText ? reviewText.value : null
        };

        const url = isEditMode ? '/User/Course/UpdateRating' : '/User/Course/SubmitRating';

        submitRatingBtn.disabled = true;
        submitRatingBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Submitting...';

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': getAntiForgeryToken()
            },
            body: JSON.stringify(ratingData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSuccess(isEditMode ? 'Rating updated successfully!' : 'Thank you for your rating!');
                    
                    submitRatingBtn.disabled = false;
                    submitRatingBtn.innerHTML = 'Submit Rating';
                    
                    closeRatingModal();
                    
                    updateRatingUI(isEditMode);
                } else {
                    showError(data.message || 'Failed to submit rating');
                    submitRatingBtn.disabled = false;
                    submitRatingBtn.innerHTML = 'Submit Rating';
                }
            })
            .catch(error => {
                console.error('Error submitting rating:', error);
                showError('An error occurred while submitting your rating');
                submitRatingBtn.disabled = false;
                submitRatingBtn.innerHTML = 'Submit Rating';
            });
    }

    function showSuccess(message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: message,
                timer: 2000,
                showConfirmButton: false,
                background: '#374151',
                color: '#fff'
            });
        } else {
            alert(message);
        }
    }

    function showError(message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: message,
                background: '#374151',
                color: '#fff'
            });
        } else {
            alert(message);
        }
    }

    function updateRatingUI(wasEditMode) {
        if (!wasEditMode) {
            if (leaveRatingBtn) {
                leaveRatingBtn.remove();
            }

            const menuDropdownList = menuDropdown?.querySelector('ul');
            if (menuDropdownList) {
                const editRatingLi = document.createElement('li');
                editRatingLi.innerHTML = `
                    <button id="editRatingBtn" 
                            class="flex w-full items-center space-x-3 px-4 py-2 text-left text-gray-300 transition-colors hover:bg-gray-700 hover:text-white">
                        <i class="fas fa-star text-orange-500"></i>
                        <span>Edit your rating</span>
                    </button>
                `;

                const separator = document.createElement('li');
                separator.className = 'border-t border-gray-700';

                menuDropdownList.insertBefore(separator, menuDropdownList.firstChild);
                menuDropdownList.insertBefore(editRatingLi, menuDropdownList.firstChild);

                const newEditRatingBtn = document.getElementById('editRatingBtn');
                if (newEditRatingBtn) {
                    newEditRatingBtn.addEventListener('click', function () {
                        isEditMode = true;
                        loadExistingRating();
                        openRatingModal();
                        closeMenuDropdown();
                    });
                }
            }
        }
    }

    function getAntiForgeryToken() {
        const token = document.querySelector('input[name="__RequestVerificationToken"]');
        return token ? token.value : '';
    }
});
