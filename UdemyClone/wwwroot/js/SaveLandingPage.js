function saveLandingPage() {
    const form = document.getElementById('landing-page-form');
    if (!form) {
        return;
    }

    if (tinymce.get('course-description')) {
        tinymce.get('course-description').save();
    }

    const formData = new FormData(form);

    const input = isInputValid(formData);
    if (!input) {
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Please provide complete information requested.'
        });
        return;
    }

    const saveButton = document.getElementById('save-button');
    const originalText = saveButton.textContent;
    saveButton.textContent = 'Saving...';
    saveButton.disabled = true;

    fetch('/Instructor/Course/SaveLandingPageAsync', {
        method: 'POST',
        body: formData
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
            saveButton.textContent = originalText;
            toggleSaveButton();
        });
}

function isInputValid(formData) {
    var inputError = 0;
    const titleValidation = document.querySelector('span[name="title-validation"]');
    const courseLevelValidation = document.querySelector('span[name="course-level-validation"]');
    const categoryValidation = document.querySelector('span[name="category-validation"]');
    const subcategoryValidation = document.querySelector('span[name="subcategory-validation"]');

    if (!formData.get('Title')) {
        if (titleValidation) {
            titleValidation.classList.remove('hidden');
            inputError++;
        }
    } else {
        if (titleValidation) {
            titleValidation.classList.add('hidden');
        }
    }

    if (!formData.get('CourseLevelId')) {
        if (courseLevelValidation) {
            courseLevelValidation.classList.remove('hidden');
            inputError++;
        }
    } else {
        if (courseLevelValidation) {
            courseLevelValidation.classList.add('hidden');
        }
    }

    if (!formData.get('CategoryId')) {
        if (categoryValidation) {
            categoryValidation.classList.remove('hidden');
            inputError++;
        }
    } else {
        if (categoryValidation) {
            categoryValidation.classList.add('hidden');
        }
    }

    if (!formData.get('SubcategoryId')) {
        if (subcategoryValidation) {
            subcategoryValidation.classList.remove('hidden');
            inputError++;
        }
    } else {
        if (subcategoryValidation) {
            subcategoryValidation.classList.add('hidden');
        }
    }
    
    return inputError == 0;
}

document.addEventListener('DOMContentLoaded', () => {
    addInputListener();
});

function addInputListener() {
    const titleInput = document.querySelector('input[name="Title"]');
    const courseLevelInput = document.querySelector('select[name="CourseLevelId"]');
    const categoryInput = document.querySelector('select[name="CategoryId"]');
    const subcategoryInput = document.querySelector('select[name="SubcategoryId"]');

    const titleValidation = document.querySelector('span[name="title-validation"]');
    const courseLevelValidation = document.querySelector('span[name="course-level-validation"]');
    const categoryValidation = document.querySelector('span[name="category-validation"]');
    const subcategoryValidation = document.querySelector('span[name="subcategory-validation"]');

    if (!titleInput || !courseLevelInput || !categoryInput || !subcategoryInput || !titleValidation || !courseLevelValidation || !categoryValidation || !subcategoryValidation) return;

    titleInput.addEventListener('input', () => {
        if (!titleInput.value) {
            titleValidation.classList.remove('hidden');
        }
        else {
            titleValidation.classList.add('hidden');
        }
    });

    courseLevelInput.addEventListener('change', () => {
        if (!courseLevelInput.value) {
            courseLevelValidation.classList.remove('hidden');
        }
        else {
            courseLevelValidation.classList.add('hidden');
        }
    });

    categoryInput.addEventListener('change', () => {
        if (!categoryInput.value) {
            categoryValidation.classList.remove('hidden');
        }
        else {
            categoryValidation.classList.add('hidden');
        }
    });

    subcategoryInput.addEventListener('change', () => {
        if (!subcategoryInput.value) {
            subcategoryValidation.classList.remove('hidden');
        }
        else {
            subcategoryValidation.classList.add('hidden');
        }
    });

}

window.saveLandingPage = saveLandingPage;
window.addInputListener = addInputListener;