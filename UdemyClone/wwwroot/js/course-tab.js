document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('nav a[data-tab]');
    const contentArea = document.getElementById('content-area');
    const defaultTab = 'Overview';

    function setActiveTab(tabName) {
        tabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('text-orange-500', 'bg-gray-100');
                tab.classList.remove('text-gray-900');
            } else {
                tab.classList.remove('text-orange-500', 'bg-gray-100');
                tab.classList.add('text-gray-900');
            }
        });
    }

    function loadContent(tabName) {
        const url = `/User/Course/${tabName}?id=${courseId}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                contentArea.innerHTML = html;

                if (tabName === 'Curriculum') {
                    if (typeof window.initializeCurriculumnFunction === 'function') {
                        window.initializeCurriculumnFunction();
                    }
                } else if (tabName === 'Review') {
                    if (typeof window.initializeReviewFilters === 'function') {
                        window.initializeReviewFilters();
                    }
                }
            })
            .catch(error => {
                console.error('Error loading tab content:', error);
                contentArea.innerHTML = '<p class="text-red-500">Error loading content.</p>';
            });
    }

    setActiveTab(defaultTab);
    loadContent(defaultTab);

    tabs.forEach(tab => {
        tab.addEventListener('click', function (event) {
            event.preventDefault();
            const tabName = this.dataset.tab;
            setActiveTab(tabName);
            loadContent(tabName);
        });
    });
});