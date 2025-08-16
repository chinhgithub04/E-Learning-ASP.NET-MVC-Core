function saveIntendedLearners() {
    const form = document.getElementById('intended-learners-form');
    if (!form) return;

    const formData = new FormData(form);
    const data = {
        CourseId: formData.get('CourseId'),
        LearningOutcomes: formData.getAll('LearningOutcomes[]').filter(value => value.trim() !== ''),
        Prerequisites: formData.getAll('Prerequisites[]').filter(value => value.trim() !== '')
    };

    // Show loading state
    const saveButton = document.getElementById('save-button');
    const originalText = saveButton.textContent;
    saveButton.textContent = 'Saving...';
    saveButton.disabled = true;

    fetch('/Instructor/Course/SaveIntendedLearners', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]')?.value
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: result.message,
                    timer: 2000,
                    showConfirmButton: false
                });
                // Reset the change tracking after successful save
                captureOriginalFormData();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: result.message
                });
            }
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'An error occurred while saving. Please try again.'
            });
        })
        .finally(() => {
            // Restore button state
            saveButton.textContent = originalText;
            toggleSaveButton();
        });
}

window.saveIntendedLearners = saveIntendedLearners;