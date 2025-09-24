document.addEventListener('DOMContentLoaded', function () {
    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dropDownContainer = document.getElementById('dropDownContainer');

    // Toggle dropdown when clicking the button
    dropdownButton.addEventListener('click', function (event) {
        event.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (event) {
        event.stopPropagation();
        if (!dropDownContainer.contains(event.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });

    // Close dropdown when pressing escape key
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            dropdownMenu.classList.add('hidden');
        }
    });
    
});