// Remove the DOMContentLoaded wrapper and create a function instead
function initializeStepOne() {
    const titleInput = document.getElementById('courseTitle');
    const charCount = document.getElementById('charCount');
    const continueBtn = document.getElementById('continueBtn');

    // Character counter and validation
    function updateCharCount() {
        const currentLength = titleInput.value.length;
        charCount.textContent = `${currentLength}/60`;

        // Enable/disable continue button based on input
        if (currentLength >= 10 && currentLength <= 60) {
            continueBtn.disabled = false;
            continueBtn.classList.remove('disabled:bg-gray-300');
            continueBtn.classList.add('bg-orange-500', 'hover:bg-orange-600');
        } else {
            continueBtn.disabled = true;
            continueBtn.classList.add('disabled:bg-gray-300');
            continueBtn.classList.remove('bg-orange-500', 'hover:bg-orange-600');
        }

        // Update character counter color
        if (currentLength == 60) {
            charCount.classList.add('text-red-500');
            charCount.classList.remove('text-gray-400');
        } else {
            charCount.classList.add('text-gray-400');
            charCount.classList.remove('text-red-500');
        }
    }

    // Auto-resize textarea and update counter
    titleInput.addEventListener('input', updateCharCount);

    // Initialize on page load
    updateCharCount();

    // Handle continue button click
    continueBtn.addEventListener('click', function () {
        if (!continueBtn.disabled) {
            // Store the title value before proceeding
            localStorage.setItem('courseTitle', titleInput.value);

            // The parent Create.cshtml will handle the navigation
            // through the loadStepContent function
        }
    });

    // Load saved title if exists
    const savedTitle = localStorage.getItem('courseTitle');
    if (savedTitle) {
        titleInput.value = savedTitle;
        updateCharCount();
    }
}