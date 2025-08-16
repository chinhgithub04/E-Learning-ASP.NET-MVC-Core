function initializeImageUpload() {
    const imageDropZone = document.getElementById('image-drop-zone');
    const textImagePreview = document.getElementById('text-image-preview')
    const uploadImageButton = document.getElementById('upload-image-btn');
    const courseImageInput = document.getElementById('course-image');
    const imagePreview = document.getElementById('course-image-preview');
    const imageUploadProgress = document.getElementById('image-upload-progress');
    const cropImageBtn = document.getElementById('crop-image-btn');
    const changeImageBtn = document.getElementById('change-image-btn');

    if (!imageDropZone || !uploadImageButton || !courseImageInput) {
        return;
    }

    // Handle Upload Image button click
    uploadImageButton.addEventListener('click', function () {
        courseImageInput.click();
    });

    // Handle image drop zone click
    imageDropZone.addEventListener('click', function () {
        courseImageInput.click();
    });

    changeImageBtn.addEventListener('click', function () {
        courseImageInput.click();
    });

    // Drag and drop functionality
    imageDropZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        imageDropZone.classList.add('border-orange-400', 'bg-orange-50');
    });

    imageDropZone.addEventListener('dragleave', function (e) {
        e.preventDefault();
        imageDropZone.classList.remove('border-orange-400', 'bg-orange-50');
    });

    imageDropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        imageDropZone.classList.remove('border-orange-400', 'bg-orange-50');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                handleImageUpload(file);
            }
        }
    });

    // Handle file selection
    courseImageInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
            // Trigger change detection
            if (typeof window.checkForChanges === 'function') {
                window.checkForChanges();
            }
        }
    });

    function handleImageUpload(file) {
        //Hide text image preview
        if (!textImagePreview.classList.contains('hidden')) {
            textImagePreview.classList.add('hidden');
        }

        // Show progress bar
        imageUploadProgress.classList.remove('hidden');

        // Get progress elements
        const progressBar = imageUploadProgress.querySelector('circle.image-progress');
        const progressText = imageUploadProgress.querySelector('span');

        // Use FileReader with progress events
        const reader = new FileReader();

        reader.onprogress = function (e) {
            if (e.lengthComputable) {
                const progress = (e.loaded / e.total) * 100;
                progressText.textContent = Math.round(progress) + '%';

                // Update circular progress bar
                const circumference = 2 * Math.PI * 28;
                const offset = circumference - (progress / 100) * circumference;
                progressBar.style.strokeDashoffset = offset;
            }
        };

        reader.onload = function (e) {
            // Hide progress bar
            imageUploadProgress.classList.add('hidden');

            // Show image preview
            imagePreview.src = e.target.result;
            imagePreview.classList.remove('hidden');

            // Hide upload button
            uploadImageButton.classList.add('hidden');

            // Show crop button
            changeImageBtn.classList.remove('hidden');
        };

        reader.onerror = function () {
            // Hide progress bar and show error
            imageUploadProgress.classList.add('hidden');
            alert('Error reading file');
        };

        // Start reading the file
        reader.readAsDataURL(file);
    }
}


function initializeVideoUpload() {
    const videoDropZone = document.getElementById('video-drop-zone');
    const uploadVideoButton = document.getElementById('upload-video-btn');
    const courseVideoInput = document.getElementById('promotional-video');
    const textVideoPreview = document.getElementById('text-video-preview');
    const promotionalVideoPreview = document.getElementById('promotional-video-preview');
    const videoUploadProgress = document.getElementById('video-upload-progress');
    const changeVideoBtn = document.getElementById('change-video-btn');

    if (!videoDropZone || !uploadVideoButton || !courseVideoInput) {
        return;
    }

    videoDropZone.addEventListener('click', function () {
        courseVideoInput.click();
    });

    uploadVideoButton.addEventListener('click', function () {
        courseVideoInput.click();
    });

    changeVideoBtn.addEventListener('click', function () {
        courseVideoInput.click();
    });

    videoDropZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        videoDropZone.classList.add('border-orange-400', 'bg-orange-50');
    });

    videoDropZone.addEventListener('dragleave', function (e) {
        e.preventDefault();
        videoDropZone.classList.remove('border-orange-400', 'bg-orange-50');
    });

    videoDropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        videoDropZone.classList.remove('border-orange-400', 'bg-orange-50');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('video/')) {
                handleVideoUpload(file);
            }
        }

    });

    courseVideoInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('video/')) {
            handleVideoUpload(file);
            // Trigger change detection
            if (typeof window.checkForChanges === 'function') {
                window.checkForChanges();
            }
        }
    });

    function handleVideoUpload(file) {
        if (!textVideoPreview.classList.contains('hidden')) {
            textVideoPreview.classList.add('hidden');
        }

        videoUploadProgress.classList.remove('hidden');
        const progressBar = videoUploadProgress.querySelector('circle.video-progress');
        const progressText = videoUploadProgress.querySelector('span');

        const reader = new FileReader();

        reader.onprogress = function (e) {
            if (e.lengthComputable) {
                const progress = (e.loaded / e.total) * 100;
                progressText.textContent = Math.round(progress) + '%';

                const circumference = 2 * Math.PI * 28;
                const offset = circumference - (progress / 100) * circumference;
                progressBar.style.strokeDashoffset = offset;
            }
        };

        reader.onload = function (e) {
            videoUploadProgress.classList.add('hidden');

            promotionalVideoPreview.src = e.target.result;
            promotionalVideoPreview.classList.remove('hidden');

            uploadVideoButton.classList.add('hidden');
            changeVideoBtn.classList.remove('hidden');
        }

        reader.onerror = function () {
            videoUploadProgress.classList.add('hidden');
            alert('Error reading video file');
        }
        reader.readAsDataURL(file);
    }
}

window.initializeImageUpload = initializeImageUpload;
window.initializeVideoUpload = initializeVideoUpload;