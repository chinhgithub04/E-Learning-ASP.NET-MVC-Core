function initializeReviewFilters() {
    const filterBtn = document.getElementById('reviewFilterBtn');
    const filterDropdown = document.getElementById('reviewFilterDropdown');
    const filterText = document.getElementById('reviewFilterText');
    const filterOptions = document.querySelectorAll('.review-filter-option');
    const reviewItems = document.querySelectorAll('.review-item');
    const reviewsList = document.getElementById('reviewsList');
    const noReviewsFound = document.getElementById('noReviewsFound');
    
    let currentFilter = 'all';
    
    if (filterBtn && filterDropdown) {
        filterBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            filterDropdown.classList.toggle('hidden');
        });
        
        document.addEventListener('click', function() {
            filterDropdown.classList.add('hidden');
        });
    }
    
    filterOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const filter = this.getAttribute('data-filter');
            currentFilter = filter;
            
            if (filterText) {
                filterText.textContent = this.querySelector('span').textContent;
            }
            
            filterOptions.forEach(opt => {
                const icon = opt.querySelector('i.fa-check');
                if (icon) {
                    if (opt === this) {
                        icon.classList.remove('invisible');
                    } else {
                        icon.classList.add('invisible');
                    }
                }
            });
            
            let visibleCount = 0;
            reviewItems.forEach(item => {
                const itemRating = item.getAttribute('data-rating');
                if (filter === 'all' || itemRating === filter) {
                    item.classList.remove('hidden');
                    visibleCount++;
                } else {
                    item.classList.add('hidden');
                }
            });
            
            if (visibleCount === 0 && reviewItems.length > 0) {
                if (reviewsList) {
                    reviewsList.classList.add('hidden');
                }
                if (noReviewsFound) {
                    noReviewsFound.classList.remove('hidden');
                }
            } else {
                if (reviewsList) {
                    reviewsList.classList.remove('hidden');
                }
                if (noReviewsFound) {
                    noReviewsFound.classList.add('hidden');
                }
            }
            
            if (filterDropdown) {
                filterDropdown.classList.add('hidden');
            }
        });
    });
    
    const loadMoreBtn = document.getElementById('loadMoreReviews');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            this.style.display = 'none';
        });
    }
    
    const allRatingsOption = document.querySelector('.review-filter-option[data-filter="all"]');
    if (allRatingsOption) {
        const checkIcon = allRatingsOption.querySelector('i.fa-check');
        if (checkIcon) {
            checkIcon.classList.remove('invisible');
        }
    }
}

if (typeof window !== 'undefined') {
    window.initializeReviewFilters = initializeReviewFilters;
}
