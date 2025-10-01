// Dropdown toggles
function initializeDropdowns() {
    const dropdowns = [
        { btn: 'categoryFilterBtn', dropdown: 'categoryDropdown' },
        { btn: 'progressFilterBtn', dropdown: 'progressDropdown' },
        { btn: 'sortBtn', dropdown: 'sortDropdown' }
    ];

    dropdowns.forEach(({ btn, dropdown }) => {
        const button = document.getElementById(btn);
        const dropdownEl = document.getElementById(dropdown);

        if (button && dropdownEl) {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                
                dropdowns.forEach(({ dropdown: otherDropdown }) => {
                    if (otherDropdown !== dropdown) {
                        document.getElementById(otherDropdown)?.classList.add('hidden');
                    }
                });

                dropdownEl.classList.toggle('hidden');
            });
        }
    });

    document.addEventListener('click', () => {
        dropdowns.forEach(({ dropdown }) => {
            document.getElementById(dropdown)?.classList.add('hidden');
        });
    });
}

let currentCategory = 'all';
let currentProgress = 'all';
let currentSort = 'recent';
let searchQuery = '';

function applyFiltersAndSort() {
    const cards = document.querySelectorAll('.course-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const categoryId = card.getAttribute('data-category-id');
        const title = card.getAttribute('data-title');
        const progress = parseFloat(card.getAttribute('data-progress'));

        let visible = true;

        if (currentCategory !== 'all' && categoryId !== currentCategory) {
            visible = false;
        }

        if (currentProgress !== 'all') {
            if (currentProgress === 'not-started' && progress > 0) visible = false;
            if (currentProgress === 'in-progress' && (progress === 0 || progress >= 100)) visible = false;
            if (currentProgress === 'completed' && progress < 100) visible = false;
        }

        if (searchQuery && !title.includes(searchQuery.toLowerCase())) {
            visible = false;
        }

        if (visible) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    const resultsCountEl = document.getElementById('resultsCount');
    if (resultsCountEl) {
        resultsCountEl.textContent = visibleCount;
    }

    const noResults = document.getElementById('noResults');
    const coursesGrid = document.getElementById('coursesGrid');
    if (visibleCount === 0) {
        noResults?.classList.remove('hidden');
        coursesGrid?.classList.add('hidden');
    } else {
        noResults?.classList.add('hidden');
        coursesGrid?.classList.remove('hidden');
    }

    const clearBtn = document.getElementById('clearFilters');
    if (currentCategory !== 'all' || currentProgress !== 'all' || searchQuery) {
        clearBtn?.classList.remove('hidden');
    } else {
        clearBtn?.classList.add('hidden');
    }

    sortCourses();
}

function sortCourses() {
    const grid = document.getElementById('coursesGrid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('.course-card:not(.hidden)'));

    cards.sort((a, b) => {
        if (currentSort === 'title-asc') {
            return a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'));
        } else if (currentSort === 'title-desc') {
            return b.getAttribute('data-title').localeCompare(a.getAttribute('data-title'));
        }
        return 0;
    });

    cards.forEach(card => grid.appendChild(card));
}

function updateDropdownSelection(options, value) {
    options.forEach(option => {
        const icon = option.querySelector('i.fa-check');
        const optionValue = option.getAttribute('data-category') || 
                          option.getAttribute('data-progress') || 
                          option.getAttribute('data-sort');
        
        if (optionValue === value) {
            icon?.classList.remove('invisible');
        } else {
            icon?.classList.add('invisible');
        }
    });
}

function initializeCourseCards() {
    document.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.course-action-btn')) {
                e.stopPropagation();
                return;
            }
            
            const courseId = this.getAttribute('data-course-id');
            if (courseId) {
                window.location.href = `/User/Course/Learn?courseId=${courseId}`;
            }
        });
    });
}

// Initialize on load
function initializeLearningPage() {
    initializeDropdowns();
    initializeCourseCards();

    document.querySelectorAll('.category-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            currentCategory = option.getAttribute('data-category');
            const categoryText = option.querySelector('span').textContent;
            const categoryFilterText = document.getElementById('categoryFilterText');
            if (categoryFilterText) {
                categoryFilterText.textContent = categoryText;
            }
            updateDropdownSelection(document.querySelectorAll('.category-option'), currentCategory);
            document.getElementById('categoryDropdown')?.classList.add('hidden');
            applyFiltersAndSort();
        });
    });

    document.querySelectorAll('.progress-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            currentProgress = option.getAttribute('data-progress');
            const progressText = option.querySelector('span').textContent;
            const progressFilterText = document.getElementById('progressFilterText');
            if (progressFilterText) {
                progressFilterText.textContent = progressText;
            }
            updateDropdownSelection(document.querySelectorAll('.progress-option'), currentProgress);
            document.getElementById('progressDropdown')?.classList.add('hidden');
            applyFiltersAndSort();
        });
    });

    document.querySelectorAll('.sort-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            currentSort = option.getAttribute('data-sort');
            const sortText = option.querySelector('span').textContent;
            const sortTextEl = document.getElementById('sortText');
            if (sortTextEl) {
                sortTextEl.textContent = sortText;
            }
            updateDropdownSelection(document.querySelectorAll('.sort-option'), currentSort);
            document.getElementById('sortDropdown')?.classList.add('hidden');
            applyFiltersAndSort();
        });
    });

    const searchInput = document.getElementById('courseSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            applyFiltersAndSort();
        });
    }

    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            currentCategory = 'all';
            currentProgress = 'all';
            searchQuery = '';
            
            if (searchInput) {
                searchInput.value = '';
            }
            
            const categoryFilterText = document.getElementById('categoryFilterText');
            const progressFilterText = document.getElementById('progressFilterText');
            
            if (categoryFilterText) {
                categoryFilterText.textContent = 'All Categories';
            }
            if (progressFilterText) {
                progressFilterText.textContent = 'All Progress';
            }
            
            updateDropdownSelection(document.querySelectorAll('.category-option'), 'all');
            updateDropdownSelection(document.querySelectorAll('.progress-option'), 'all');
            
            applyFiltersAndSort();
        });
    }

    updateDropdownSelection(document.querySelectorAll('.category-option'), 'all');
    updateDropdownSelection(document.querySelectorAll('.progress-option'), 'all');
    updateDropdownSelection(document.querySelectorAll('.sort-option'), 'recent');
}

if (typeof window !== 'undefined') {
    window.initializeLearningPage = initializeLearningPage;
}
