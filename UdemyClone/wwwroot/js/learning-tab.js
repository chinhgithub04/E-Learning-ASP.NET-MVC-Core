document.addEventListener('DOMContentLoaded', function () {
    history.replaceState({ section: currentSection }, '', `/User/MyCourse/Index/${currentSection}`);

    setInitialActiveTab(currentSection);
    loadSection(currentSection, false);

    const tabLink = document.querySelectorAll('.tab-link');
    tabLink.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            changeActiveTab(this);
            const section = this.dataset.tab;
            loadSection(section);
        });
    });


    function setInitialActiveTab(section) {
        const tabLink = document.querySelectorAll('.tab-link');
        const activeTab = document.querySelector(`.tab-link[data-tab="${section}"]`);

        if (activeTab) {
            // Remove active styles from all tabs first
            tabLink.forEach(function (item) {
                item.classList.remove('text-orange-500', 'border-orange-300');
                item.classList.add('text-gray-700', 'border-transparent');
            });

            // Add active styles to the current section tab
            activeTab.classList.add('text-orange-500', 'border-orange-300');
            activeTab.classList.remove('text-gray-700', 'border-transparent');
        }
    }


    function loadSection(section, updateHistory = true) {
        fetch(`/User/MyCourse/GetPartialView?viewName=${section}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(function (html) {
                document.getElementById('content-area').innerHTML = html;

                if (updateHistory) {
                    history.pushState({ section: section }, '', `/User/MyCourse/Index/${section}`);
                }
            })
    }

    function changeActiveTab(clickedTab) {
        tabLink.forEach(function (item) {
            item.classList.remove('text-orange-500', 'border-orange-300');
            item.classList.add('text-gray-700', 'border-transparent');
        });

        clickedTab.classList.add('text-orange-500', 'border-orange-300');
        clickedTab.classList.remove('text-gray-700', 'border-transparent');
    }
});