function initializeCurriculum() {
    const curriculumForm = document.getElementById('curriculum-form');

    if (!curriculumForm) {
        return;
    }

    function showNotification(isSuccess, message) {
        Swal.fire({
            icon: isSuccess ? 'success' : 'error',
            title: isSuccess ? 'Success!' : 'Error',
            text: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
    }

    curriculumForm.addEventListener('click', function (e) {
        const target = e.target;

        // Edit Section Title
        if (target.closest('.edit-section-title')) {
            const button = target.closest('.edit-section-title');
            const titleDiv = button.closest('.title-div');
            const titleForm = titleDiv.nextElementSibling;

            titleDiv.classList.add('hidden');
            titleForm.classList.remove('hidden');

            const titleInput = titleForm.querySelector('.title-input');
            titleInput.focus();
            titleInput.select();
        }

        // Cancel Section Title Edit
        if (target.closest('.cancel-section-title')) {
            const button = target.closest('.cancel-section-title');
            const titleForm = button.closest('.title-form');
            const sectionId = titleForm.querySelector('input[name="SectionId"').value;
            const titleDiv = titleForm.previousElementSibling;

            if (sectionId) {
                titleForm.classList.add('hidden');
                titleDiv.classList.remove('hidden');
            } else {
                const inputRow = titleDiv.closest('.input-row');
                inputRow?.remove();
            }
        }

        // Save Section Title
        if (target.closest('.save-section-title')) {
            const button = target.closest('.save-section-title');
            const titleForm = button.closest('.title-form');
            const titleDiv = titleForm.previousElementSibling;
            const sectionElement = titleForm.querySelector('input[name="SectionId"]');
            const sectionId = sectionElement.value;
            const titleInput = titleForm.querySelector('input[name="SectionTitle"]');
            const newTitle = titleInput.value.trim();
            const courseId = document.getElementById('CourseId').value;
            const displayOrder = titleForm.querySelector('input[name="DisplayOrder"]').value;

            if (!newTitle) {
                alert('Section title cannot be empty');
                return;
            }

            const formData = new FormData();
            formData.append('Id', sectionId);
            formData.append('Title', newTitle);
            formData.append('CourseId', courseId);
            formData.append('DisplayOrder', displayOrder);

            fetch('/Instructor/Course/SaveSectionTitle', {
                method: 'POST',
                headers: {
                    'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]')?.value
                },
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {

                        if (!sectionId) {
                            sectionElement.value = data.id;
                        }

                        const sectionDisplayOrder = titleDiv.querySelector('.section-display-order');
                        sectionDisplayOrder.textContent = `${displayOrder}:`;
                        const sectionTitle = titleDiv.querySelector('.section-title');
                        sectionTitle.textContent = ` ${newTitle}`;

                        const inputRow = titleDiv.closest('.input-row');
                        const dragButton = inputRow.querySelector('.drag-handle');
                        const removeButton = inputRow.querySelector('.remove-section');
                        const lectureListAndAddLectureBtn = titleForm.nextElementSibling;

                        if (dragButton && removeButton && dragButton.classList.contains('hidden') && removeButton.classList.contains('hidden')) {
                            dragButton.classList.remove('hidden');
                            removeButton.classList.remove('hidden');
                        }

                        if (lectureListAndAddLectureBtn && lectureListAndAddLectureBtn.classList.contains('hidden')) {
                            lectureListAndAddLectureBtn.classList.remove('hidden');
                        }

                        titleForm.classList.add('hidden');
                        titleDiv.classList.remove('hidden');
                        showNotification(true, data.message);
                    } else {
                        showNotification(false, data.message || 'Failed to save section title');
                    }
                })
                .catch(error => {
                    console.error('Error saving section title:', error);
                    showNotification(false, 'An unexpected error occurred');
                });
        }

        // Toggle Lecture Detail View
        if (target.closest('.lecture-show-detail')) {
            const button = target.closest('.lecture-show-detail');
            const lectureDetail = button.closest('.lecture-header').nextElementSibling;

            if (lectureDetail?.classList.contains('lecture-detail')) {
                lectureDetail.classList.toggle('hidden');
                const chevronIcon = button.querySelector('svg');
                chevronIcon.style.transform = lectureDetail.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        }

        // Change Video
        if (target.closest('.lecture-change-video-btn')) {
            const button = target.closest('.lecture-change-video-btn');
            const lectureInformation = button.closest('.lecture-information');
            const lectureUploadVideo = lectureInformation.previousElementSibling;

            if (lectureInformation && lectureUploadVideo) {
                lectureInformation.classList.add('hidden');
                lectureUploadVideo.classList.remove('hidden');

                const closeUploadBtn = lectureUploadVideo.querySelector('.lecture-close-upload-video-btn');
                if (closeUploadBtn && closeUploadBtn.classList.contains('hidden')) {
                    closeUploadBtn.classList.remove('hidden');
                }
            }
        }

        // Close Upload Video panel
        if (target.closest('.lecture-close-upload-video-btn')) {
            const button = target.closest('.lecture-close-upload-video-btn');
            const lectureUploadVideo = button.closest('.lecture-upload-video');
            const lectureInformation = lectureUploadVideo.nextElementSibling;

            if (lectureInformation && lectureUploadVideo) {
                lectureInformation.classList.remove('hidden');
                lectureUploadVideo.classList.add('hidden');
            }
        }

        // Edit Lecture Title
        if (target.closest('.lecture-title-edit')) {
            const button = target.closest('.lecture-title-edit');
            const lectureTitleDiv = button.closest('.lecture-title-div');
            const lectureTitleForm = lectureTitleDiv.nextElementSibling;

            lectureTitleDiv.classList.add('hidden');
            lectureTitleForm.classList.remove('hidden');

            const titleInput = lectureTitleForm.querySelector('.lecture-title-input');
            titleInput.focus();
            titleInput.select();
        }

        // Cancel Lecture Title Edit
        if (target.closest('.cancel-lecture-title')) {
            const button = target.closest('.cancel-lecture-title');
            const lectureTitleForm = button.closest('.lecture-title-form');
            const lectureId = lectureTitleForm.querySelector('input[name="LectureId"]').value;

            if (!lectureId) {
                const lectureInputRow = button.closest('.lecture-input-row');
                lectureInputRow?.remove();
            } else {
                const lectureTitleDiv = lectureTitleForm.previousElementSibling;
                lectureTitleForm.classList.add('hidden');
                lectureTitleDiv.classList.remove('hidden');
            }
        }

        // Save Lecture Title
        if (target.closest('.save-lecture-title')) {
            const button = target.closest('.save-lecture-title');
            const lectureTitleForm = button.closest('.lecture-title-form');
            const lectureTitleDiv = lectureTitleForm.previousElementSibling;
            const lectureId = lectureTitleForm.querySelector('input[name="LectureId"]').value;
            const lectureTitle = lectureTitleForm.querySelector('input[name="LectureTitle"]').value.trim();
            const sectionId = lectureTitleForm.querySelector('input[name="SectionId"]').value;
            const displayOrder = lectureTitleForm.querySelector('input[name="DisplayOrder"]').value;

            if (!lectureTitle) {
                alert('Lecture title cannot be empty');
                return;
            }

            const formData = new FormData();
            formData.append('Id', lectureId);
            formData.append('Title', lectureTitle);
            formData.append('CourseSectionId', sectionId)
            formData.append('DisplayOrder', displayOrder);

            fetch('/Instructor/Course/SaveLectureTitle/', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const lectureDisplayOrder = lectureTitleDiv.querySelector('.lecture-display-order');
                        lectureDisplayOrder.textContent = displayOrder + ':';

                        const displayTitle = lectureTitleDiv.querySelector('.lecture-title');
                        displayTitle.textContent = ` ${lectureTitle}`;

                        if (!lectureId) {
                            lectureTitleForm.querySelector('input[name="LectureId"]').value = data.id;
                        }

                        const lectureInputRow = lectureTitleDiv.closest('.lecture-input-row');
                        const videoUploadForm = lectureInputRow.querySelector('.video-upload-form');
                        const videoIdInput = videoUploadForm.querySelector('input[name="VideoId"]');

                        if (videoIdInput && !videoIdInput.value) {
                            videoIdInput.value = data.id;
                        }

                        lectureTitleForm.classList.add('hidden');
                        lectureTitleDiv.classList.remove('hidden');

                        const lectureHeader = lectureTitleForm.parentElement;
                        const lectureDetail = lectureHeader.nextElementSibling;
                        const lectureVideoTitle = lectureDetail.querySelector('.lecture-video-title');
                        if (lectureVideoTitle) {
                            lectureVideoTitle.textContent = lectureTitle;
                        }

                        const resourceUploadForm = lectureInputRow.querySelector('.resource-upload-form');
                        const courseVideo = resourceUploadForm.querySelector('input[name="CourseVideoId"]');
                        if (courseVideo && !courseVideo.value) {
                            courseVideo.value = data.id;
                        }

                        showNotification(true, data.message);
                    } else {
                        showNotification(false, data.message || 'Failed to save lecture title');
                    }
                })
                .catch(error => {
                    console.error('Error saving lecture title:', error);
                    showNotification(false, 'An unexpected error occurred');
                });
        }

        // Trigger lecture video file input
        if (target.closest('.lecture-upload-button')) {
            e.preventDefault();
            const button = target.closest('.lecture-upload-button');
            const lectureInput = button.closest('.lecture-drop-area').querySelector('.lecture-input');
            lectureInput?.click();
        }

        // Trigger resource file input
        if (target.closest('.resource-upload-btn')) {
            e.preventDefault();
            const button = target.closest('.resource-upload-btn');
            const resourceFileInput = button.nextElementSibling.querySelector('.resource-file-input');
            resourceFileInput?.click();
        }

        // Delete a resource
        if (target.closest('.resource-delete-btn')) {
            e.preventDefault();
            const button = target.closest('.resource-delete-btn');
            const resourceItem = button.parentElement;
            const resourceDeleteForm = button.previousElementSibling;
            const resourceId = resourceDeleteForm.querySelector('input[name="CourseResourceId"]').value;

            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    const formData = new FormData();
                    formData.append('id', resourceId);

                    fetch('/Instructor/Course/DeleteResource', {
                        method: 'POST',
                        body: formData
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                resourceItem.remove();
                                showNotification(true, data.message);
                            } else {
                                showNotification(false, data.message || 'Failed to delete resource');
                            }
                        })
                        .catch(error => {
                            console.error('Error deleting resource:', error);
                            showNotification(false, 'An unexpected error occurred.');
                        });
                }
            });

        }

        // Add a new lecture
        if (target.closest('.add-lecture-btn')) {
            e.preventDefault();
            addLecture(target.closest('.add-lecture-btn'));
        }

        // Delete a lecture
        if (target.closest('.lecture-delete')) {
            const button = target.closest('.lecture-delete');
            const lectureTitleDiv = button.closest('.lecture-title-div');
            const lectureTitleForm = lectureTitleDiv.nextElementSibling;
            const lectureId = lectureTitleForm.querySelector('input[name="LectureId"]').value;

            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    const formData = new FormData();
                    formData.append('id', lectureId);

                    fetch('/Instructor/Course/DeleteLecture', {
                        method: 'POST',
                        body: formData
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                const deletedLectureInputRow = lectureTitleDiv.closest('.lecture-input-row');
                                const lectureList = deletedLectureInputRow.parentElement;

                                deletedLectureInputRow.remove();

                                const remainingRows = lectureList.querySelectorAll('.lecture-input-row');

                                remainingRows.forEach((row, index) => {
                                    const newDisplayOrder = index + 1;

                                    const lectureDisplayOrder = row.querySelectorAll('.lecture-display-order');
                                    if (lectureDisplayOrder && lectureDisplayOrder.length > 0) {
                                        lectureDisplayOrder.forEach(element => {
                                            element.textContent = newDisplayOrder + ':';
                                        });
                                    }                                    

                                    const displayOrderInput = row.querySelector('input[name="DisplayOrder"]');
                                    if (displayOrderInput) {
                                        displayOrderInput.value = newDisplayOrder;
                                    }
                                });

                                updateCourseDuration(data.courseDuration);

                                showNotification(true, data.message);
                            } else {
                                showNotification(false, data.message || 'Failed to delete lecture');
                            }
                        })
                        .catch(error => {
                            console.error('Error deleting lecture:', error);
                            showNotification(false, 'An unexpected error occurred.');
                        });
                }
            });
        }

        //Add new section
        if (target.closest('.add-section-btn')) {
            const sectionList = this.querySelector('.input-list');
            const sectionRows = sectionList.querySelectorAll('.input-row');
            const nextSectionDisplayOrder = sectionRows.length + 1;

            if (!courseId) {
                showNotification(false, 'Course ID not found. Please refresh the page.');
                return;
            }

            const newSection = document.createElement('div');
            newSection.classList.add('input-row', 'flex', 'items-center', 'space-x-6');
            newSection.innerHTML = `
                <button type="button" class="drag-handle hidden cursor-grab rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600" title="Drag to reorder">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h5 lucide lucide-align-justify-icon lucide-align-justify w-5"><path d="M3 12h18" /><path d="M3 18h18" /><path d="M3 6h18" /></svg>
                </button>
                <div class="section-container w-full rounded-lg border border-gray-300">
                    <div class="title-div flex hidden items-center justify-between bg-gray-50 px-6 py-4">
                        <div class="flex items-center space-x-3">
                            <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                            </svg>
                            <div class="font-medium text-gray-900">
                                Section
                                <span class="section-display-order">${nextSectionDisplayOrder}:</span>
                                <span class="section-title"> Introduction</span>
                            </div>
                            <button type="button" class="edit-section-title cursor-pointer rounded p-2 hover:bg-gray-200" title="Edit section">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-icon lucide-pencil h-4 w-4"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" /></svg>
                            </button>
                        </div>
                    </div>

                    <form class="title-form m-2 flex items-center justify-between border bg-white px-6 py-4">
                        <input type="hidden" value="" name="SectionId" />
                        <input type="hidden" value="${nextSectionDisplayOrder}" name="DisplayOrder" />
                        <div class="flex w-full items-center space-x-3">
                            <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                            </svg>
                            <div class="flex w-full items-center space-x-4">
                                <div class="font-medium text-gray-900">
                                    Section
                                    <span class="section-display-order">${nextSectionDisplayOrder}</span>
                                </div>
                                <input type="text" class="title-input w-96 flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" placeholder="Enter section title" value="Introduction" name="SectionTitle" />
                                <button type="button" class="save-section-title cursor-pointer rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 focus:ring-2 focus:outline-none">
                                    Save
                                </button>
                                <button type="button" class="cancel-section-title cursor-pointer rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 focus:outline-none">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>

                    <div class="lecture-list-and-add-lecture-btn hidden space-y-3 px-6 py-4">
                        <div class="lecture-input-list space-y-3">
                        </div>
                        <button class="add-lecture-btn cursor-pointer text-sm font-medium text-orange-600 hover:text-orange-700">+ Add lecture</button>
                    </div>
                </div>
                <button type="button" class="remove-section hidden cursor-pointer rounded p-1 text-red-500 hover:bg-gray-200 hover:text-red-700" title="Delete this section">
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            `;

            sectionList.appendChild(newSection);

            const titleInput = newSection.querySelector('.title-input');
            titleInput.focus();
            titleInput.select();

        }

        // Delete a section
        if (e.target.closest('.remove-section')) {
            const button = e.target.closest('.remove-section');
            const inputRow = button.closest('.input-row');
            const sectionId = inputRow.querySelector('input[name="SectionId"]').value;

            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    const formData = new FormData();
                    formData.append('id', sectionId);

                    fetch('/Instructor/Course/DeleteSection', {
                        method: 'POST',
                        body: formData
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                const inputList = inputRow.parentElement;
                                inputRow.remove();
                                const inputRows = inputList.querySelectorAll('.input-row');

                                inputRows.forEach((row, index) => {
                                    const newOrder = index + 1;

                                    const sectionDisplayOrder = row.querySelector('.section-display-order');
                                    sectionDisplayOrder.textContent = `${newOrder}:`;

                                    const sectionOrderInput = row.querySelector('input[name="DisplayOrder"]');
                                    sectionOrderInput.value = newOrder;
                                });

                                updateCourseDuration(data.courseDuration);

                                showNotification(true, data.message);
                            }
                            else {
                                showNotification(false, data.message);
                            }
                        })
                        .catch(error => {
                            showNotification(false, error.message);
                        });
                }
            });
        }
    });

    curriculumForm.addEventListener('change', function (e) {
        const target = e.target;

        // Toggle Lecture Preview
        if (target.classList.contains('toggle-preview')) {
            const form = target.closest('.video-preview-form');
            const videoId = form.querySelector('input[name="VideoId"]').value;

            if (!videoId) {
                showNotification(false, 'Cannot find the lecture. Please save the lecture first.');
                target.checked = !target.checked;
                return;
            }

            const formData = new FormData();
            formData.append('id', videoId);

            fetch('/Instructor/Course/TogglePreviewButton', {
                method: 'POST',
                headers: {
                    'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]')?.value
                },
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showNotification(true, data.message);
                    } else {
                        target.checked = !target.checked;
                        showNotification(false, data.message || 'Failed to toggle preview status.');
                    }
                })
                .catch(error => {
                    target.checked = !target.checked;
                    showNotification(false, 'An unexpected error occurred.');
                });
        }
    });

    // Handle hover events for showing lecture utility buttons
    curriculumForm.addEventListener('mouseover', function (e) {
        const lectureHeader = e.target.closest('.lecture-header');
        if (lectureHeader && !lectureHeader.classList.contains('hover-active')) {
            lectureHeader.classList.add('hover-active');
            const buttons = lectureHeader.querySelectorAll('.lecture-group-ultility-button');
            buttons.forEach(btn => btn.classList.remove('hidden', 'invisible'));
        }
    });

    curriculumForm.addEventListener('mouseout', function (e) {
        const lectureHeader = e.target.closest('.lecture-header');
        if (lectureHeader && lectureHeader.classList.contains('hover-active')) {
            lectureHeader.classList.remove('hover-active');
            const buttons = lectureHeader.querySelectorAll('.lecture-group-ultility-button');
            buttons.forEach(btn => {
                if (btn.matches('.lecture-drag-handle')) {
                    btn.classList.add('invisible');
                } else {
                    btn.classList.add('hidden');
                }
            });
        }
    });

    // Handle keydown events for forms
    curriculumForm.addEventListener('keydown', function (e) {
        // Section title form shortcuts
        if (e.target.matches('.title-input')) {
            const titleForm = e.target.closest('.title-form');
            if (e.key === 'Enter') {
                e.preventDefault();
                titleForm.querySelector('.save-section-title').click();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                titleForm.querySelector('.cancel-section-title').click();
            }
        }

        // Lecture title form shortcuts
        if (e.target.matches('.lecture-title-input')) {
            const lectureTitleForm = e.target.closest('.lecture-title-form');
            if (e.key === 'Enter') {
                e.preventDefault();
                lectureTitleForm.querySelector('.save-lecture-title').click();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                lectureTitleForm.querySelector('.cancel-lecture-title').click();
            }
        }
    });

    // Handle file input changes and drag-and-drop
    function setupFileInputs(container) {
        // Video upload
        container.querySelectorAll('.lecture-drop-area').forEach(dropArea => {
            dropArea.addEventListener('dragover', e => {
                e.preventDefault();
                dropArea.classList.add('border-orange-400', 'bg-orange-50');
            });
            dropArea.addEventListener('dragleave', e => {
                e.preventDefault();
                dropArea.classList.remove('border-orange-400', 'bg-orange-50');
            });
            dropArea.addEventListener('drop', e => {
                e.preventDefault();
                dropArea.classList.remove('border-orange-400', 'bg-orange-50');
                const files = e.dataTransfer.files;
                if (files.length > 0 && files[0].type.startsWith('video/')) {
                    uploadLecture(files[0], dropArea.closest('form'));
                } else {
                    alert('Please drop a valid video file.');
                }
            });
        });

        container.querySelectorAll('.lecture-input').forEach(input => {
            input.addEventListener('change', e => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('video/')) {
                    uploadLecture(file, input.closest('.video-upload-form'));
                } else if (file) {
                    alert('Please select a video file.');
                }

                e.target.value = ''
            });
        });

        // Resource upload
        container.querySelectorAll('.resource-file-input').forEach(input => {
            input.addEventListener('change', e => {
                const files = e.target.files;
                if (files && files.length > 0) {
                    uploadResource(files, input.closest('.resource-upload-form'));
                }
                e.target.value = ''
            });
        });

        // 
    }

    setupFileInputs(curriculumForm);

    function initializeSortable() {
        // Lecture
        const lectureLists = curriculumForm.querySelectorAll('.lecture-input-list');
        lectureLists.forEach(list => {
            new Sortable(list, {
                animation: 150,
                handle: '.lecture-drag-handle',
                ghostClass: 'opacity-60',
                onEnd: function (evt) {
                    const items = Array.from(evt.to.children).map((row, index) => {
                        const id = row.querySelector('input[name="LectureId"]').value;
                        const newOrder = index + 1;

                        // Update display order on the UI
                        const displayOrderSpan = row.querySelectorAll('.lecture-display-order');
                        if (displayOrderSpan && displayOrderSpan.length > 0) {
                            displayOrderSpan.forEach(element => {
                                element.textContent = `${newOrder}: `;
                            })
                        }
                        const displayOrderInput = row.querySelector('input[name="DisplayOrder"]');
                        if (displayOrderInput) {
                            displayOrderInput.value = newOrder;
                        }

                        return { id, displayOrder: newOrder };
                    });

                    // Filter out any items that don't have an ID
                    const itemsToUpdate = items.filter(item => item.id);

                    if (itemsToUpdate.length > 0) {
                        fetch('/Instructor/Course/UpdateLectureOrder', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]')?.value
                            },
                            body: JSON.stringify(itemsToUpdate)
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (!data.success) {
                                    showNotification(false, data.message || 'Failed to update lecture order. Please reload the page and try again.'); 
                                }
                            })
                            .catch(error => {
                                showNotification(false, 'An unexpected error occurred.');
                            });
                    }
                }
            });
        });

        // Section
        const sectionList = curriculumForm.querySelector('.input-list');
        new Sortable(sectionList, {
            animation: 150,
            handle: '.drag-handle',
            ghostClass: 'opacity-60',
            onEnd: function (evt) {
                const items = Array.from(evt.to.children).map((row, index) => {
                    const id = row.querySelector('input[name="SectionId"]').value;
                    const newOrder = index + 1;

                    const sectionDisplayOrder = row.querySelectorAll('.section-display-order');
                    if (sectionDisplayOrder && sectionDisplayOrder.length > 0) {
                        sectionDisplayOrder.forEach(element => {
                            element.textContent = `${newOrder}: `;
                        })
                    }

                    const displayOrderInput = row.querySelector('input[name="DisplayOrder"]');
                    if (displayOrderInput) {
                        displayOrderInput.value = newOrder;
                    }

                    return { id, displayOrder: newOrder };
                });

                const itemsToUpdate = items.filter(item => item.id);

                if (itemsToUpdate.length > 0) {
                    fetch('/Instructor/Course/UpdateSectionOrder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]')?.value
                        },
                        body: JSON.stringify(itemsToUpdate)
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (!data.success) {
                                showNotification(false, data.message || 'Failed to update section order. Please reload the page and try again.');
                            }
                        })
                        .catch(error => {
                            showNotification(false, error.message);
                        });
                }
            }
        });
    }

    initializeSortable();

    function uploadLecture(file, form) {
        const videoIdInput = form.querySelector('input[name="VideoId"]');
        if (!videoIdInput) return;

        const lectureUploadVideo = form.closest('.lecture-upload-video');
        const lectureInformation = lectureUploadVideo.nextElementSibling;
        const lectureUploadProgress = lectureInformation?.nextElementSibling;

        if (lectureUploadVideo) {
            lectureUploadVideo.classList.add('hidden');
        }
        if (lectureUploadProgress && lectureUploadProgress.classList.contains('lecture-upload-progress')) {
            lectureUploadProgress.classList.remove('hidden');

            const uploadFilename = lectureUploadProgress.querySelector('.upload-filename');
            const uploadPercentage = lectureUploadProgress.querySelector('.upload-percentage');
            const uploadProgressBar = lectureUploadProgress.querySelector('.upload-progress-bar');
            const uploadSpeedElement = lectureUploadProgress.querySelector('.upload-speed');

            if (uploadFilename) {
                uploadFilename.textContent = file.name;
            }
            if (uploadPercentage) {
                uploadPercentage.textContent = '0%';
            }
            if (uploadProgressBar) {
                uploadProgressBar.style.width = '0%';
            }
            if (uploadSpeedElement) {
                uploadSpeedElement.textContent = '0 MB/s';
            }
        }

        const formData = new FormData();
        formData.append('Id', videoIdInput.value);
        formData.append('VideoFile', file);

        const xhr = new XMLHttpRequest();

        // Upload speed variables
        let startTime = Date.now();
        let lastTime = startTime;
        let lastLoaded = 0;

        // Track upload progress
        xhr.upload.addEventListener('progress', function (e) {
            if (e.lengthComputable && lectureUploadProgress) {
                const percentComplete = Math.round((e.loaded / e.total) * 100);
                const currentTime = Date.now();
                const timeElapsed = (currentTime - lastTime) / 1000; // Convert to seconds

                // Calculate speed
                let speed = 0;
                if (timeElapsed > 0) {
                    const bytesTransferred = e.loaded - lastLoaded;
                    speed = bytesTransferred / timeElapsed; // bytes per second
                }

                // Update tracking variables
                lastTime = currentTime;
                lastLoaded = e.loaded;

                // Update UI elements
                const uploadPercentage = lectureUploadProgress.querySelector('.upload-percentage');
                const uploadProgressBar = lectureUploadProgress.querySelector('.upload-progress-bar');
                const uploadSpeedElement = lectureUploadProgress.querySelector('.upload-speed');

                if (uploadPercentage) {
                    uploadPercentage.textContent = `${percentComplete}%`;
                }
                if (uploadProgressBar) {
                    uploadProgressBar.style.width = `${percentComplete}%`;
                }
                if (uploadSpeedElement) {
                    // Format speed for display
                    let speedText;
                    if (speed >= 1024 * 1024) {
                        speedText = `${(speed / (1024 * 1024)).toFixed(1)} MB/s`;
                    } else if (speed >= 1024) {
                        speedText = `${(speed / 1024).toFixed(1)} KB/s`;
                    } else {
                        speedText = `${speed.toFixed(0)} B/s`;
                    }
                    uploadSpeedElement.textContent = speedText;
                }
            }
        });

        xhr.onload = function () {
            // Hide progress bar
            if (lectureUploadProgress) {
                lectureUploadProgress.classList.add('hidden');
            }

            if (xhr.status === 200) {
                try {
                    const data = JSON.parse(xhr.responseText);

                    if (data.success) {
                        if (lectureInformation) {
                            const lectureVideoTitle = lectureInformation.querySelector('.lecture-video-title');
                            const lectureVideoDuration = lectureInformation.querySelector('.lecture-video-duration');

                            if (lectureVideoTitle && lectureVideoDuration) {
                                // update title and duration in the information section
                                lectureVideoTitle.textContent = data.title;

                                const formattedDuration = formatTimeSpan(data.lectureDuration);
                                lectureVideoDuration.textContent = formattedDuration;

                                const lectureDetail = lectureUploadVideo.parentElement;
                                const lectureHeader = lectureDetail.previousElementSibling;

                                if (lectureHeader) {
                                    // update duration in the header section
                                    const lectureDuration = lectureHeader.querySelector('.lecture-duration');

                                    if (lectureDuration) {
                                        lectureDuration.textContent = formattedDuration;
                                        lectureDuration.classList.remove('hidden');
                                    }
                                }
                            }

                            const videoPreViewForm = lectureInformation.querySelector('.video-preview-form');
                            const videoPreviewIdInput = videoPreViewForm.querySelector('input[name="VideoId"]');
                            if (videoPreviewIdInput) {
                                videoPreviewIdInput.value = videoIdInput.value;
                            }

                            lectureUploadVideo.classList.add('hidden');
                            lectureInformation.classList.remove('hidden');
                        }

                        updateCourseDuration(data.courseDuration);

                        showNotification(true, data.message);
                    } else {
                        // Show lecture information on error
                        if (lectureInformation) {
                            lectureInformation.classList.remove('hidden');
                        }
                        showNotification(false, data.message);
                    }
                } catch (error) {
                    // Show lecture information on parse error
                    if (lectureInformation) {
                        lectureInformation.classList.remove('hidden');
                    }
                    showNotification(false, 'Failed to parse server response');
                }
            } else {
                // Show lecture information on HTTP error
                if (lectureInformation) {
                    lectureInformation.classList.remove('hidden');
                }
                showNotification(false, 'Upload failed with status: ' + xhr.status);
            }
        };

        xhr.onerror = function () {
            // Hide progress bar and show lecture information on network error
            if (lectureUploadProgress) {
                lectureUploadProgress.classList.add('hidden');
            }
            if (lectureInformation) {
                lectureInformation.classList.remove('hidden');
            }
            showNotification(false, 'Network error occurred during upload');
        };

        // Handle cancel upload button
        if (lectureUploadProgress) {
            const cancelBtn = lectureUploadProgress.querySelector('.cancel-upload-btn');
            if (cancelBtn) {
                cancelBtn.onclick = function () {
                    xhr.abort();
                    lectureUploadProgress.classList.add('hidden');
                    if (lectureInformation && lectureInformation.querySelector('.lecture-video-title')) {
                        // Show information if video already exists
                        lectureInformation.classList.remove('hidden');
                    } else {
                        // Show upload area if no video exists
                        lectureUploadVideo.classList.remove('hidden');
                    }
                    showNotification(false, 'Upload cancelled');
                };
            }
        }

        xhr.open('POST', '/Instructor/Course/UpdateCourseVideoAsync', true);
        xhr.send(formData);
    }

    function updateCourseDuration(duration) {
        const courseTotalDuration = document.getElementById('course-total-duration');
        const formattedCourseDuration = formatCourseDuration(duration);

        if (formattedCourseDuration !== '') {
            if (courseTotalDuration) {
                courseTotalDuration.textContent = formattedCourseDuration;
            } else {
                const manageHeader = document.getElementById('return-header');

                courseTotalDurationSpan = document.createElement('span');
                courseTotalDurationSpan.className = 'text-sm font-medium text-white';
                courseTotalDurationSpan.id = 'course-total-duration';
                courseTotalDurationSpan.innerHTML = formattedCourseDuration;

                manageHeader.appendChild(courseTotalDurationSpan);
            }
        } else {
            if (courseTotalDuration) {
                courseTotalDuration.remove();
            }
        }

        
    }

    function formatTimeSpan(timeSpanString) {
        if (!timeSpanString) return '0:00';

        const parts = timeSpanString.split(':');

        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = Math.floor(parseFloat(parts[2]));

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    function formatCourseDuration(timeSpanString) {
        if (!timeSpanString) return '';

        const parts = timeSpanString.split(':');

        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = Math.floor(parseFloat(parts[2]));

        if (hours > 0) {
            return `${hours.toString()}hour ${minutes.toString()}min of video content uploaded`;
        } else if (minutes > 1) {
            return `${minutes.toString()}min of video content uploaded`;
        } else if (seconds > 0) {
            return `1min of video content uploaded`;
        } else {
            return ``;
        }
    }

    function uploadResource(files, form) {
        const videoIdInput = form.querySelector('input[name="CourseVideoId"]');
        if (!videoIdInput) return;

        const resourceHolder = form.closest('.course-resource-holder');
        const resourceList = resourceHolder.querySelector('.course-resource-list');
        const resourceUploadProgress = resourceList.nextElementSibling;

        if (resourceUploadProgress && resourceUploadProgress.classList.contains('resource-upload-progress')) {

            const resourceUploadCount = resourceUploadProgress.querySelector('.resource-upload-count');
            if (resourceUploadCount) {
                resourceUploadCount.textContent = `${files.length} files uploading`;
            }
            resourceUploadProgress.classList.remove('hidden');
        }

        const formData = new FormData();
        formData.append('CourseVideoId', videoIdInput.value);
        for (let i = 0; i < files.length; i++) {
            formData.append('ResourceFiles', files[i]);
        }

        const xhr = new XMLHttpRequest();

        let lastTime = Date.now();
        let lastLoaded = 0;

        xhr.upload.addEventListener('progress', function (e) {
            if (e.lengthComputable && resourceUploadProgress) {
                const percentComplete = Math.round((e.loaded / e.total) * 100);
                const currentTime = Date.now();
                const timeElapsed = (currentTime - lastTime) / 1000;

                let speed = 0;
                if (timeElapsed > 0) {
                    const bytesTransferred = e.loaded - lastLoaded;
                    speed = bytesTransferred / timeElapsed;
                }

                lastTime = currentTime;
                lastLoaded = e.loaded;

                const resourceUploadPercentage = resourceUploadProgress.querySelector('.resource-upload-percentage');
                const resourceUploadProgressBar = resourceUploadProgress.querySelector('.resource-upload-progress-bar');
                const resourceUploadSpeed = resourceUploadProgress.querySelector('.resource-upload-speed');

                if (resourceUploadPercentage) {
                    resourceUploadPercentage.textContent = `${percentComplete}%`;
                }
                if (resourceUploadProgressBar) {
                    resourceUploadProgressBar.style.width = `${percentComplete}%`;
                }
                if (resourceUploadSpeed) {
                    let speedText;
                    if (speed >= 1024 * 1024) {
                        speedText = `${(speed / (1024 * 1024)).toFixed(1)} MB/s`;
                    } else if (speed >= 1024) {
                        speedText = `${(speed / 1024).toFixed(1)} KB/s`;
                    } else {
                        speedText = `${speed.toFixed(0)} B/s`;
                    }
                    resourceUploadSpeed.textContent = speedText;
                }
            }
        });

        xhr.onload = function () {
            resourceUploadProgress.classList.add('hidden');

            if (xhr.status === 200) {
                try {
                    const data = JSON.parse(xhr.responseText);

                    if (data.success) {
                        data.uploadedFiles.forEach(file => {
                            // Format file size properly
                            const sizeInMB = file.size / (1024.0 * 1024.0);
                            const formattedSize = sizeInMB >= 1 ? `${sizeInMB.toFixed(1)} MB` : `${(file.size / 1024.0).toFixed(1)} KB`;

                            const newResourceItem = document.createElement('div');
                            newResourceItem.className = 'course-resource-item mt-3 flex items-center justify-between rounded-md border border-gray-200 p-3';
                            newResourceItem.innerHTML = `
                            <div class="flex items-center space-x-3">
                                <div class="flex h-8 w-8 items-center justify-center rounded bg-blue-100">
                                    <svg class="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                                    </svg>
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-gray-900">
                                        ${file.name}
                                    </p>
                                    <p class="text-xs text-gray-500">
                                        ${formattedSize}
                                    </p>
                                </div>
                            </div>

                            <form class="resource-delete-form hidden" enctype="multipart/form-data">
                                <input type="hidden" value="${file.id || ''}" name="CourseResourceId" />
                            </form>

                            <button type="button" class="resource-delete-btn inline-flex cursor-pointer items-center rounded-md border border-red-300 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:outline-none">
                                <svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                                </svg>
                                Delete
                            </button>
                        `;

                            resourceList.appendChild(newResourceItem);
                        });
                        showNotification(true, data.message);
                    } else {
                        showNotification(false, data.message);
                    }
                } catch (error) {
                    console.error('Error parsing response:', error);
                    showNotification(false, 'Failed to parse server response');
                }
            } else {
                showNotification(false, 'Upload failed with status: ' + xhr.status);
            }
        };

        xhr.onerror = function () {
            resourceUploadProgress.classList.add('hidden');
            showNotification(false, 'Network error occurred during upload');
        };

        const cancelBtn = resourceUploadProgress.querySelector('.cancel-resource-upload-btn');
        if (cancelBtn) {
            cancelBtn.onclick = function () {
                xhr.abort();
                resourceUploadProgress.classList.add('hidden');
                showNotification(false, 'Upload cancelled');
            }
        }

        xhr.open('POST', '/Instructor/Course/AddCourseResourceAsync', true);
        xhr.send(formData);
    }
    function addLecture(button) {
        const sectionContainer = button.closest('.section-container');
        const sectionId = sectionContainer.querySelector('input[name="SectionId"]').value;
        const lectureInputList = button.previousElementSibling;
        const existingLectures = lectureInputList.querySelectorAll('.lecture-input-row');
        const nextDisplayOrder = existingLectures.length + 1;
        const defaultTitle = `Lecture ${nextDisplayOrder}`;

        const newRow = document.createElement('div');
        newRow.classList.add('lecture-input-row', 'bg-gray-100', 'text-sm', 'text-gray-600');
        newRow.innerHTML = `
            <div class="lecture-header border px-4 py-2">
                <div class="lecture-title-div flex items-center justify-between hidden">
                    <div class="flex items-center space-x-2">
                        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path></svg>
                        <div>Lecture
                            <span class="lecture-display-order">${nextDisplayOrder}</span>
                            <span class="lecture-title"></span>
                        </div>
                        <div class="lecture-duration rounded bg-green-100 px-2 py-1 text-xs text-green-80 hidden">
                        </div>
                        <button type="button" class="lecture-title-edit lecture-group-ultility-button hidden cursor-pointer rounded p-1 hover:bg-gray-300" title="Edit title">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-icon lucide-pencil h-4 w-4"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" /></svg>
                        </button>
                        <button type="button" class="lecture-delete lecture-group-ultility-button hidden cursor-pointer rounded p-1 text-red-500 hover:bg-gray-300" title="Delete lecture">
                            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        </button>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button type="button" class="lecture-show-detail cursor-pointer rounded p-1 hover:bg-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down h-4 w-4"><path d="m6 9 6 6 6-6" /></svg>
                        </button>
                        <button type="button" class="lecture-drag-handle lecture-group-ultility-button invisible cursor-grab rounded p-1 hover:bg-gray-300" title="Reorder lecture">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-align-justify-icon lucide-align-justify h-4 w-4"><path d="M3 12h18" /><path d="M3 18h18" /><path d="M3 6h18" /></svg>
                        </button>
                    </div>
                </div>
                <form class="lecture-title-form flex items-center justify-between border bg-white px-4 py-2">
                    <input type="hidden" name="LectureId" value="" />
                    <input type="hidden" name="SectionId" value="${sectionId}"/>
                    <input type="hidden" name="DisplayOrder" value="${nextDisplayOrder}"/>
                    <div class="flex w-full items-center space-x-2">
                        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path></svg>
                        <div>Lecture
                            <span class="lecture-display-order">${nextDisplayOrder}: </span>
                        </div>                          
                        <input type="text" class="lecture-title-input w-96 flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" placeholder="Enter lecture title" name="LectureTitle" value="Introduction" />
                        <button type="button" class="save-lecture-title cursor-pointer rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 focus:ring-2 focus:outline-none">Save</button>
                        <button type="button" class="cancel-lecture-title cursor-pointer rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 focus:outline-none">Cancel</button>
                    </div>
                </form>
            </div>
            <div class="lecture-detail hidden border border-t-0 px-4 pt-2 pb-4 text-lg font-bold">
                <div class="lecture-upload-video">
                    <div class="flex items-center justify-between border-b border-gray-600 pb-3">
                        <span>Upload Video</span>
                        <button type="button" class="lecture-close-upload-video-btn hidden cursor-pointer rounded p-1 hover:bg-gray-300" title="Close"><svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button>
                    </div>
                    <form class="video-upload-form mt-4 space-y-4 text-sm font-normal" enctype="multipart/form-data">
                        <input type="hidden" name="VideoId" value="" />
                        <div class="lecture-drop-area rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-colors hover:border-orange-400 hover:bg-orange-50">
                            <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200"><svg class="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg></div>
                            <input class="lecture-input" hidden type="file" accept="video/*" />
                            <h4 class="mb-2 text-lg font-medium text-gray-900">Drag and drop a video file</h4>
                            <p class="mb-4 text-gray-600">or click to browse from your computer</p>
                            <button type="button" class="lecture-upload-button inline-flex cursor-pointer items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"><svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>Select Video File</button>
                        </div>
                        <div class="flex"><svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg><div class="ml-3"><p class="text-sm"><strong>Note:</strong> All files should be at least 720p and less than 4.0 GB.</p></div></div>
                    </form>
                </div>
                <div class="lecture-information mt-4 space-y-4 text-sm font-normal hidden">
                    <!-- Video Information Section -->
                    <div class="rounded-lg border border-gray-200 bg-white p-4">
                        <div class="flex items-start justify-between">
                            <div class="flex items-start space-x-4">
                                <!-- Video Thumbnail -->
                                <div class="flex-shrink-0">
                                    <div class="relative h-23 w-32 overflow-hidden rounded-lg bg-gray-100">
                                        <div class="flex h-full items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-timer-icon lucide-timer h-8 w-8 text-gray-500"><line x1="10" x2="14" y1="2" y2="2" /><line x1="12" x2="15" y1="14" y2="11" /><circle cx="12" cy="14" r="8" /></svg>
                                        </div>
                                        <!-- Play button overlay -->
                                        <div class="absolute inset-0 flex items-center justify-center">
                                            <div class="bg-opacity-60 rounded-full bg-black p-2">
                                                <svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Video Details -->
                                <div class="flex-1 space-y-2">
                                    <h4 class="lecture-video-title font-medium text-gray-900">Introduction</h4>
                                    <div class="flex items-center space-x-2">
                                        <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        <span class="lecture-video-duration text-gray-600">00:00</span>
                                    </div>

                                    <!-- Action Buttons -->
                                    <div class="flex space-x-3 pt-2">
                                        <button type="button" class="inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:outline-none">
                                            <svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                            </svg>
                                            Review
                                        </button>
                                        <button type="button" class="lecture-change-video-btn inline-flex cursor-pointer items-center rounded-md border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100 focus:ring-2 focus:ring-orange-500 focus:outline-none">
                                            <svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                            </svg>
                                            Change Video
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <!-- Preview text and toggle switch here -->
                            <form class="video-preview-form">
                                <input type="hidden" name="VideoId" value="" />
                                <label class="inline-flex cursor-pointer items-center">
                                    <span class="mr-3 text-sm font-medium text-gray-900">Preview</span>
                                    <div class="relative">
                                        <input type="checkbox" class="peer toggle-preview sr-only" />
                                        <div class="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-orange-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                                    </div>
                                </label>
                            </form>
                        </div>
                    </div>

                    <!-- Downloadable Materials Section -->
                    <div class="course-resource-holder rounded-lg border border-gray-200 bg-white p-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-2">
                                <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <h5 class="font-medium text-gray-900">Downloadable Material</h5>
                            </div>
                            <button type="button" class="resource-upload-btn inline-flex cursor-pointer items-center rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                + Resources
                            </button>
                            <form class="resource-upload-form hidden" enctype="multipart/form-data">
                                <input type="hidden" name="CourseVideoId" value="" />
                                <input class="resource-file-input" type="file" multiple hidden name="ResourceFiles" />
                            </form>
                        </div>
                        <div class="course-resource-list">
                        </div>
                        <div class="resource-upload-progress mt-4 hidden space-y-4 text-sm font-normal">
                            <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                <div class="mb-3 flex items-center justify-between">
                                    <div class="flex items-center space-x-2">
                                        <svg class="h-5 w-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span class="font-medium text-blue-900">Uploading Resources...</span>
                                    </div>
                                    <span class="resource-upload-percentage text-sm font-medium text-blue-700">0%</span>
                                </div>

                                <!-- Progress Bar -->
                                <div class="mb-3 h-2 w-full rounded-full bg-blue-200">
                                    <div class="resource-upload-progress-bar h-2 rounded-full bg-blue-500 transition-all duration-300" style="width: 0%"></div>
                                </div>

                                <!-- Upload Details -->
                                <div class="flex justify-between text-xs text-blue-700">
                                    <span class="resource-upload-count">Preparing upload...</span>
                                    <span class="resource-upload-speed">0 KB/s</span>
                                </div>

                                <!-- Cancel Button -->
                                <div class="mt-3 flex justify-end">
                                    <button type="button" class="cancel-resource-upload-btn inline-flex cursor-pointer items-center rounded-md border border-red-300 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:outline-none">
                                        <svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                        Cancel Upload
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="lecture-upload-progress mt-4 hidden space-y-4 text-sm font-normal">
                    <!-- Upload Progress Section -->
                    <div class="rounded-lg border border-orange-200 bg-orange-50 p-4">
                        <div class="mb-3 flex items-center justify-between">
                            <div class="flex items-center space-x-2">
                                <svg class="h-5 w-5 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span class="font-medium text-orange-900">Uploading Video...</span>
                            </div>
                            <span class="upload-percentage text-sm font-medium text-orange-700">0%</span>
                        </div>

                        <!-- Progress Bar -->
                        <div class="mb-3 h-2 w-full rounded-full bg-orange-200">
                            <div class="upload-progress-bar h-2 rounded-full bg-orange-500 transition-all duration-300" style="width: 0%"></div>
                        </div>

                        <!-- Upload Details -->
                        <div class="flex justify-between text-xs text-orange-700">
                            <span class="upload-filename">Preparing upload...</span>
                            <span class="upload-speed">0 MB/s</span>
                        </div>

                        <!-- Cancel Button -->
                        <div class="mt-3 flex justify-end">
                            <button type="button" class="cancel-upload-btn inline-flex cursor-pointer items-center rounded-md border border-red-300 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:outline-none">
                                <svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                                Cancel Upload
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        lectureInputList.appendChild(newRow);
        setupFileInputs(newRow);
        initializeSortable();

        const titleInput = newRow.querySelector('.lecture-title-input');
        titleInput.focus();
        titleInput.select();
    }
}

window.initializeCurriculum = initializeCurriculum;