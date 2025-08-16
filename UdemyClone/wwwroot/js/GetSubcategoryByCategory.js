function initializeCategorySubcategory() {
    const categorySelect = document.getElementById('categorySelect');
    const subcategoryContainer = document.getElementById('subcategoryContainer');
    const subcategorySelect = document.getElementById('subcategorySelect');

    if (!categorySelect || !subcategoryContainer || !subcategorySelect) {
        return;
    }

    categorySelect.addEventListener('change', handleCategoryChange);

    function handleCategoryChange() {
        const categoryId = this.value;

        if (categoryId) {
            subcategoryContainer.classList.remove('hidden');
            subcategorySelect.innerHTML = '<option value="">Loading...</option>';

            fetch(`/Instructor/Course/GetSubcategoriesByCategory?categoryId=${categoryId}`)
                .then(response => response.json())
                .then(data => {
                    subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';

                    data.forEach(subcategory => {
                        const option = document.createElement('option');
                        option.value = subcategory.value;
                        option.textContent = subcategory.text;
                        subcategorySelect.appendChild(option);
                    });
                })
                .catch(error => {
                    console.error('Error fetching subcategories:', error);
                    subcategorySelect.innerHTML = '<option value="">Error loading subcategories</option>';
                });
        } else {
            subcategoryContainer.classList.add('hidden');
            subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    initializeCategorySubcategory();
});

window.initializeCategorySubcategory = initializeCategorySubcategory;