document.addEventListener('DOMContentLoaded', function () {
    const signInTab = document.getElementById('signInTab');
    const signUpTab = document.getElementById('signUpTab');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const signInTabText = signInTab.querySelector('div:first-child');
    const signInBar = signInTab.querySelector('div:last-child');
    const signUpTabText = signUpTab.querySelector('div:first-child');
    const signUpBar = signUpTab.querySelector('div:last-child');
    const agreeCheckbox = document.getElementById('agreeToTermInput');
    const signUpButton = document.getElementById('signUpButton');

    function toggleSignUpButtonState() {
        signUpButton.disabled = !agreeCheckbox.checked;
    }

    toggleSignUpButtonState();

    agreeCheckbox.addEventListener('change', toggleSignUpButtonState);

    function clearValidationMessages() {
        // Clear model validation summaries
        const validationSummaries = document.querySelectorAll('.validation-summary-errors');
        validationSummaries.forEach(summary => {
            summary.innerHTML = '<ul></ul>'; // Clear the list of errors
            summary.classList.add('validation-summary-valid');
            summary.classList.remove('validation-summary-errors');
        });

        // Clear property validation messages
        const validationMessages = document.querySelectorAll('.field-validation-error');
        validationMessages.forEach(message => {
            message.textContent = '';
            message.classList.add('field-validation-valid');
            message.classList.remove('field-validation-error');
        });
    }

    signInTab.addEventListener('click', function () {
        signInForm.classList.remove('hidden');
        signUpForm.classList.add('hidden');

        signInTabText.classList.add('text-gray-900');
        signInTabText.classList.remove('text-gray-500');
        signInBar.classList.remove('hidden');

        signUpTabText.classList.add('text-gray-500');
        signUpTabText.classList.remove('text-gray-900');
        signUpBar.classList.add('hidden');

        clearValidationMessages();
    });

    signUpTab.addEventListener('click', function () {
        signUpForm.classList.remove('hidden');
        signInForm.classList.add('hidden');

        signUpTabText.classList.add('text-gray-900');
        signUpTabText.classList.remove('text-gray-500');
        signUpBar.classList.remove('hidden');

        signInTabText.classList.add('text-gray-500');
        signInTabText.classList.remove('text-gray-900');
        signInBar.classList.add('hidden');

        clearValidationMessages();
    });
});