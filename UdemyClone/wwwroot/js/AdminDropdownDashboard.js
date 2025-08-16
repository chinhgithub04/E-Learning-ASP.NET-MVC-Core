function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const arrow = document.getElementById(dropdownId + '-arrow');

    dropdown.classList.toggle('hidden');
    arrow.classList.toggle('rotate-180');

    // Store dropdown state in localStorage
    const isOpen = !dropdown.classList.contains('hidden');
    localStorage.setItem('dropdown-' + dropdownId, isOpen ? 'open' : 'closed');
}

// Restore dropdown states when page loads
document.addEventListener('DOMContentLoaded', function () {
    // Check for stored dropdown states
    const dropdownIds = ['website-dropdown', 'users-dropdown'];

    dropdownIds.forEach(function (dropdownId) {
        const state = localStorage.getItem('dropdown-' + dropdownId);
        if (state === 'open') {
            const dropdown = document.getElementById(dropdownId);
            const arrow = document.getElementById(dropdownId + '-arrow');

            if (dropdown && arrow) {
                dropdown.classList.remove('hidden');
                arrow.classList.add('rotate-180');
            }
        }
    });
});