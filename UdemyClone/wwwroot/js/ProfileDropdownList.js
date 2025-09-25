document.addEventListener('DOMContentLoaded', function () {
    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dropDownContainer = document.getElementById('dropDownContainer');
    const signOutButton = document.getElementById('signOutButton');
    const logoutForm = document.getElementById('logoutForm');

    if (dropdownButton && dropdownMenu && dropDownContainer) {
        // Toggle dropdown when clicking the button
        dropdownButton.addEventListener('click', function (event) {
            event.stopPropagation();
            dropdownMenu.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function (event) {
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

        if (signOutButton && logoutForm) {
            signOutButton.addEventListener('click', function () {
                logoutForm.submit();
            });
        }
    }

});