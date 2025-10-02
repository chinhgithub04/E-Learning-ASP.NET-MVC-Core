function initializeCategorySubcategory() {
    const categoryDropdown = document.getElementById('categoryDropdown');
    const categoryMenu = document.getElementById('categoryMenu');
    const categoryText = document.getElementById('categoryText');
    const selectedCategoryId = document.getElementById('selectedCategoryId');
    const subcategoryContainer = document.getElementById('subcategoryContainer');
    const subcategoryDropdown = document.getElementById('subcategoryDropdown');
    const subcategoryMenu = document.getElementById('subcategoryMenu');
    const subcategoryText = document.getElementById('subcategoryText');
    const selectedSubcategoryId = document.getElementById('selectedSubcategoryId');

    if (!categoryDropdown || !subcategoryContainer || !subcategoryDropdown) {
        return;
    }

    // Initialize dropdown functionality
    initializeDropdown('categoryDropdown', 'categoryMenu', 'categoryText', 'selectedCategoryId');
    initializeDropdown('subcategoryDropdown', 'subcategoryMenu', 'subcategoryText', 'selectedSubcategoryId');
    initializeDropdown('courseLevelDropdown', 'courseLevelMenu', 'courseLevelText', 'selectedCourseLevelId');

    // Handle category selection to load subcategories
    categoryMenu.addEventListener('click', function(e) {
        if (e.target.hasAttribute('data-value')) {
            const categoryId = e.target.getAttribute('data-value');
            handleCategoryChange(categoryId);
        }
    });

    function initializeDropdown(buttonId, menuId, textId, hiddenInputId) {
        const button = document.getElementById(buttonId);
        const menu = document.getElementById(menuId);
        const text = document.getElementById(textId);
        const arrow = button?.querySelector('svg');
        
        if (!button || !menu || !text) return;
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close other dropdowns
            document.querySelectorAll('[id$="Menu"]').forEach(otherMenu => {
                if (otherMenu !== menu) {
                    otherMenu.classList.add('hidden');
                }
            });
            document.querySelectorAll('[id$="Dropdown"] svg').forEach(otherArrow => {
                if (otherArrow !== arrow) {
                    otherArrow.classList.remove('rotate-180');
                }
            });
            
            // Toggle current dropdown
            menu.classList.toggle('hidden');
            if (arrow) arrow.classList.toggle('rotate-180');
        });
        
        menu.addEventListener('click', function(e) {
            if (e.target.hasAttribute('data-value')) {
                e.preventDefault();
                const value = e.target.getAttribute('data-value');
                const displayText = e.target.getAttribute('data-text') || e.target.textContent.trim();
                
                // Update display text
                text.textContent = displayText;
                
                // Update hidden input if provided
                if (hiddenInputId) {
                    const hiddenInput = document.getElementById(hiddenInputId);
                    if (hiddenInput) {
                        hiddenInput.value = value;
                    }
                }
                
                // Update active state
                menu.querySelectorAll('[data-value]').forEach(item => {
                    item.classList.remove('bg-orange-50', 'text-orange-600');
                });
                e.target.classList.add('bg-orange-50', 'text-orange-600');
                
                // Close dropdown
                menu.classList.add('hidden');
                if (arrow) arrow.classList.remove('rotate-180');
                
                // Trigger change detection for unsaved changes
                if (typeof window.checkForChanges === 'function') {
                    window.checkForChanges();
                }
            }
        });
    }

    function handleCategoryChange(categoryId) {
        if (categoryId) {
            subcategoryContainer.classList.remove('hidden');
            
            // Reset subcategory
            subcategoryText.textContent = 'Loading...';
            selectedSubcategoryId.value = '';
            
            // Clear existing subcategories
            const subcategoryMenuContent = subcategoryMenu.querySelector('.max-h-60');
            subcategoryMenuContent.innerHTML = '<div class="cursor-pointer px-4 py-2 text-gray-900 hover:bg-orange-50 hover:text-orange-600" data-value="" data-text="Loading...">Loading...</div>';

            fetch(`/Instructor/Course/GetSubcategoriesByCategory?categoryId=${categoryId}`)
                .then(response => response.json())
                .then(data => {
                    subcategoryText.textContent = 'Select Subcategory';
                    subcategoryMenuContent.innerHTML = '<div class="cursor-pointer px-4 py-2 text-gray-900 hover:bg-orange-50 hover:text-orange-600" data-value="" data-text="Select Subcategory">Select Subcategory</div>';

                    data.forEach(subcategory => {
                        const div = document.createElement('div');
                        div.className = 'cursor-pointer px-4 py-2 text-gray-900 hover:bg-orange-50 hover:text-orange-600';
                        div.setAttribute('data-value', subcategory.value);
                        div.setAttribute('data-text', subcategory.text);
                        div.textContent = subcategory.text;
                        subcategoryMenuContent.appendChild(div);
                    });
                })
                .catch(error => {
                    console.error('Error fetching subcategories:', error);
                    subcategoryText.textContent = 'Select Subcategory';
                    subcategoryMenuContent.innerHTML = '<div class="cursor-pointer px-4 py-2 text-gray-900 hover:bg-orange-50 hover:text-orange-600" data-value="" data-text="Error loading">Error loading subcategories</div>';
                });
        } else {
            subcategoryContainer.classList.add('hidden');
            subcategoryText.textContent = 'Select Subcategory';
            selectedSubcategoryId.value = '';
        }
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        document.querySelectorAll('[id$="Menu"]').forEach(menu => {
            menu.classList.add('hidden');
        });
        document.querySelectorAll('[id$="Dropdown"] svg').forEach(arrow => {
            arrow.classList.remove('rotate-180');
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initializeCategorySubcategory();
});

window.initializeCategorySubcategory = initializeCategorySubcategory;