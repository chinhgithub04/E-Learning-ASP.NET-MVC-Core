function initializeSettingPageFunctions() {
    const courseStatusForm = document.getElementById('course-status-form');
    courseIdValue = document.getElementById('CourseId').value;

    if (!courseStatusForm) {
        return;
    }

    courseStatusForm.addEventListener('click', (e) => {
        const target = e.target;

        if (target.tagName === 'BUTTON') {
            if (target.id === 'publish-btn') {
                Swal.fire({
                    title: 'Publish your course?',
                    text: "New students will find your course via search and can enroll.",
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Publish'
                }).then((result) => {
                    if (result.isConfirmed) {
                        target.textContent = 'Publishing';
                        target.disabled = true;
                        publishCourse();
                    }
                });
            }

            if (target.id === 'unpublish-btn') {
                Swal.fire({
                    title: 'Unpublish your course?',
                    text: "New students cannot find your course via search, but existing students can still access content.",
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Unpublish'
                }).then((result) => {
                    if (result.isConfirmed) {
                        target.textContent = 'Publishing';
                        target.disabled = true;
                        unpublishCourse();
                    }
                });
            }

            if (target.id === 'delete-course') {
                Swal.fire({
                    title: 'Delete your course?',
                    text: "Are you sure you want to delete this course? This is permanent and cannot be undone.",
                    icon: 'warning',
                    iconColor: '#C72E2E',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Yes, delete it!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        target.textContent = 'Publishing';
                        target.disabled = true;
                        deleteCourse();
                    }
                });
            }
        }
    });

    function publishCourse() {
        fetch('/Instructor/Course/PublishCourse', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(courseIdValue)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Course Successfully Published!',
                        text: "Now new students will find your course via search and can enroll.",
                        confirmButtonText: 'Got it!',
                        confirmButtonColor: '#10b981',
                        width: '500px'
                    });

                    const settingsStatusContainer = document.getElementById('settings-status-container');

                    const publishCourseContainer = document.createElement('div');
                    publishCourseContainer.className = 'mb-4';
                    publishCourseContainer.innerHTML = `
                        <div class="mb-3 flex items-center space-x-2">
                            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                <svg class="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h4 class="text-sm font-medium text-gray-900">Published</h4>
                                <p class="text-sm text-gray-600">This course is currently live on the EduPress marketplace.</p>
                            </div>
                        </div>

                        <div class="ml-10">
                            <button id="unpublish-btn" type="button"
                                    class="mb-2 cursor-pointer rounded-lg border border-orange-500 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-100 focus:ring-2 focus:ring-orange-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-orange-50">
                                Unpublish
                            </button>
                            <p class="text-sm text-gray-500">New students cannot find your course via search, but existing students can still access content.</p>
                        </div>
                    `;

                    if (settingsStatusContainer.firstElementChild) {
                        settingsStatusContainer.replaceChild(publishCourseContainer, settingsStatusContainer.firstElementChild);
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Publish Failed',
                        text: data.message,
                        confirmButtonText: 'Try Again',
                        confirmButtonColor: '#ef4444',
                        width: '450px'
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Publishing  Failed',
                    text: error.message,
                    confirmButtonText: 'Try Again',
                    confirmButtonColor: '#ef4444',
                    width: '450px'
                });
            })
    }
    function unpublishCourse() {
        fetch('/Instructor/Course/UnpublishCourse', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(courseIdValue)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Course Successfully Unblished!',
                        text: "Now new students cannot find your course via search, but existing students can still access content.",
                        confirmButtonText: 'Got it!',
                        confirmButtonColor: '#10b981',
                        width: '500px'
                    });

                    const settingsStatusContainer = document.getElementById('settings-status-container');

                    const unpublishCourseContainer = document.createElement('div');
                    unpublishCourseContainer.className = 'mb-4';
                    unpublishCourseContainer.innerHTML = `
                        <div class="mb-3 flex items-center space-x-2">
                            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                                <svg class="h-4 w-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h4 class="text-sm font-medium text-gray-900">Ready to Publish</h4>
                                <p class="text-sm text-gray-600">This course is not published on the EduPress marketplace.</p>
                            </div>
                        </div>

                        <div class="ml-10">
                            <button id="publish-btn" type="button"
                                    class="mb-2 cursor-pointer rounded-lg border border-orange-500 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-100 focus:ring-2 focus:ring-orange-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-orange-50">
                                Publish
                            </button>
                            <p class="text-sm text-gray-500">New students will find your course via search and can enroll.</p>
                        </div>
                    `;

                    if (settingsStatusContainer.firstElementChild) {
                        settingsStatusContainer.replaceChild(unpublishCourseContainer, settingsStatusContainer.firstElementChild);
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Unpublish failed',
                        text: data.message,
                        confirmButtonText: 'Try Again',
                        confirmButtonColor: '#ef4444',
                        width: '450px'
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Unpublishing Failed',
                    text: error.message,
                    confirmButtonText: 'Try Again',
                    confirmButtonColor: '#ef4444',
                    width: '450px'
                });
            })
    }

    function deleteCourse() {
        fetch('/Instructor/Course/DeleteCourse', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(courseIdValue)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Course Successfully Deleted!',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        // Redirect về trang Instructor/Course
                        window.location.href = "/Instructor/Course";
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Delete  Failed',
                        toast: true,
                        text: data.message,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Delete  Failed',
                    toast: error.message,
                    text: data.message,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
            })
    }

}

window.initializeSettingPageFunctions = initializeSettingPageFunctions;