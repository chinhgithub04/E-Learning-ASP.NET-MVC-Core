function initializeSettingPageFunctions() {
    courseIdValue = document.getElementById('CourseId').value;
    const publishBtn = document.getElementById('publish-btn');

    if (publishBtn) {
        publishBtn.addEventListener('click', () => {
            publishBtn.textContent = 'Publishing';
            publishBtn.disabled = true;
            submitForPublication();
        });
    }

    function submitForPublication() {
        fetch('/Instructor/Course/ReviewCourse', {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(courseIdValue)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: data.message,
                        toast: true,
                        position: 'top-right',
                        showConfirmButton: false,
                        timer: 3000
                    });
                }
                else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message,
                        toast: true,
                        position: 'top-right',
                        showConfirmButton: false,
                        timer: 3000
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message,
                    toast: true,
                    position: 'top-right',
                    showConfirmButton: false,
                    timer: 3000
                });
            });
    }
}

window.initializeSettingPageFunctions = initializeSettingPageFunctions;