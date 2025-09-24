function initializeCurriculumnFunction() {
    const curriculum = document.getElementById('curriculum-sections');
    if (!curriculum) return;

    const sectionToggles = curriculum.querySelectorAll('.section-toggle');
    const expandToggleBtn = document.getElementById('expand-toggle-btn');
    let allExpanded = false;

    const toggleSection = (sectionToggle, forceState) => {
        const videoContainer = sectionToggle.nextElementSibling;
        const chevron = sectionToggle.querySelector('.lucide-chevron-down');
        if (!videoContainer) return;

        const isHidden = videoContainer.classList.contains('hidden');
        const expand = forceState !== undefined ? forceState : isHidden;

        if (expand) {
            videoContainer.classList.remove('hidden');
            chevron.classList.add('rotate-180');
        } else {
            videoContainer.classList.add('hidden');
            chevron.classList.remove('rotate-180');
        }
    };

    sectionToggles.forEach(toggle => {
        toggle.addEventListener('click', () => toggleSection(toggle));
    });

    if (expandToggleBtn) {
        expandToggleBtn.addEventListener('click', () => {
            allExpanded = !allExpanded;
            sectionToggles.forEach(toggle => toggleSection(toggle, allExpanded));
            expandToggleBtn.textContent = allExpanded ? 'Collapse all sections' : 'Expand all sections';
        });
    }
}

window.initializeCurriculumnFunction = initializeCurriculumnFunction