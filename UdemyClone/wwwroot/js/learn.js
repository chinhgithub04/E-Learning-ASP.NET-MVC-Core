document.addEventListener('DOMContentLoaded', function () {
    let video = document.getElementById('courseVideo');
    let progressUpdateInterval;
    let lastProgressUpdate = 0;
    const PROGRESS_UPDATE_INTERVAL = 5000;

    initializePage();

    function initializePage() {
        if (video) {
            setupVideoEventListeners();
        }

        setupSectionToggle();

        setupSidebarToggle();

        setupKeyboardShortcuts();
    }

    function setupVideoEventListeners() {
        video.addEventListener('timeupdate', function () {
            updateVideoProgress();
        });

        video.addEventListener('loadedmetadata', function () {
            console.log('Video loaded successfully');
        });

        video.addEventListener('error', function () {
            showError('Failed to load video. Please try refreshing the page.');
        });

        video.addEventListener('ended', function () {
            const videoId = video.getAttribute('data-video-id');
            if (videoId) {
                ToggleVideoCompletion(videoId, true);
            }
        });
    }

    function updateVideoProgress() {
        if (!video ) return;

        const currentTime = video.currentTime;
        const now = Date.now();

        if (now - lastProgressUpdate >= PROGRESS_UPDATE_INTERVAL) {
            lastProgressUpdate = now;

            const videoId = video.getAttribute('data-video-id');
            if (videoId) {
                updateVideoProgressOnServer(videoId, currentTime);
            }
        }
    }

    function updateVideoProgressOnServer(videoId, currentTime) {
        fetch('/User/Course/UpdateVideoProgress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': getAntiForgeryToken()
            },
            body: JSON.stringify({
                VideoId: videoId,
                CurrentTime: currentTime
            })
        })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    console.error('Failed to update progress:', data.message);
                }
            })
            .catch(error => {
                console.error('Failed to update video progress:', error);
            });
    }

    function setupSectionToggle() {
        const sectionHeaders = document.querySelectorAll('.section-header');

        sectionHeaders.forEach(header => {
            header.addEventListener('click', function () {
                const content = this.nextElementSibling;
                const chevron = this.querySelector('.section-chevron');

                if (content && content.classList.contains('section-content')) {
                    toggleSlide(content, 200);
                    chevron.classList.toggle('rotate-180');
                }
            });
        });

        // Expand section containing current video by default
        const sectionContents = document.querySelectorAll('.section-content');
        sectionContents.forEach(content => {
            const hasCurrentVideo = content.querySelector('.border-orange-500');
            const header = content.previousElementSibling;
            const chevron = header ? header.querySelector('.section-chevron') : null;

            if (hasCurrentVideo) {
                content.style.display = 'block';
                if (chevron) {
                    chevron.classList.add('rotate-180');
                }
            } else {
                content.style.display = 'none';
            }
        });
    }

    function setupSidebarToggle() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('courseSidebar');
        const mainContent = document.getElementById('mainContent');

        if (sidebarToggle && sidebar && mainContent) {
            sidebarToggle.addEventListener('click', function () {
                const isHidden = sidebar.style.transform === 'translateX(100%)';

                if (isHidden) {
                    // Show sidebar
                    sidebar.style.transform = 'translateX(0)';
                    sidebar.style.width = '24rem'; // w-96 = 24rem
                    this.querySelector('i').className = 'fas fa-chevron-left';
                    this.style.right = '24rem'; // w-96 = 24rem
                    this.title = 'Hide Sidebar';
                } else {
                    // Hide sidebar
                    sidebar.style.transform = 'translateX(100%)';
                    sidebar.style.width = '0';
                    this.querySelector('i').className = 'fas fa-chevron-right';
                    this.style.right = '0';
                    this.title = 'Show Sidebar';
                }
            });
        }
    }

    // Function to expand section containing a specific video
    function expandSectionForVideo(videoId) {
        // Find the video item
        const videoItem = document.querySelector(`div[data-video-id="${videoId}"]`);
        if (!videoItem) return;

        // Find the section containing this video
        const sectionContent = videoItem.closest('.section-content');
        if (!sectionContent) return;

        // Get the section header
        const sectionHeader = sectionContent.previousElementSibling;
        if (!sectionHeader || !sectionHeader.classList.contains('section-header')) return;

        // Get the chevron icon
        const chevron = sectionHeader.querySelector('.section-chevron');

        // Check if section is currently collapsed
        const isCollapsed = sectionContent.style.display === 'none' || !sectionContent.style.display;

        if (isCollapsed) {
            // Expand the section
            toggleSlide(sectionContent, 200);
            if (chevron) {
                chevron.classList.add('rotate-180');
            }
        }
    }

    // Global function to load video without page refresh
    window.loadVideo = function (videoId) {
        fetch(`/User/Course/Learn?courseId=${video.getAttribute('data-course-id')}&lectureId=${videoId}`)
            .then(response => response.text())
            .then(html => {
                // Parse the response to get the new video data
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // Update video source
                const newVideoElement = doc.getElementById('courseVideo');
                if (newVideoElement) {
                    const newVideoUrl = newVideoElement.querySelector('source')?.getAttribute('src');
                    if (newVideoUrl) {
                        video.src = newVideoUrl;
                        video.setAttribute('data-video-id', videoId);
                        video.load();
                    }
                }

                // Update current video highlighting
                document.querySelectorAll('.video-item').forEach(item => {
                    item.classList.remove('border-orange-500', 'bg-gray-700');
                    item.classList.add('border-transparent');
                });

                // Highlight new current video
                const newCurrentItem = document.querySelector(`div[data-video-id="${videoId}"]`);
                if (newCurrentItem) {
                    newCurrentItem.classList.add('border-orange-500', 'bg-gray-700');
                    newCurrentItem.classList.remove('border-transparent');
                }

                // Expand section containing the new video and optionally collapse others
                expandSectionForVideo(videoId);

                // Optional: Uncomment the line below if you want to collapse all other sections
                // collapseOtherSections(videoId);

                // Update Previous/Next buttons
                updateNavigationButtons(doc);

                // Update URL without page refresh
                const newUrl = `/User/Course/Learn?courseId=${video.getAttribute('data-course-id')}&lectureId=${videoId}`;
                window.history.pushState({ videoId: videoId }, '', newUrl);

                // Scroll the new current video into view
                if (newCurrentItem) {
                    newCurrentItem.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'nearest'
                    });
                }

            })
            .catch(error => {
                console.error('Error loading video:', error);
                showError('Failed to load video');
            });
    };

    function updateNavigationButtons(doc) {
        // Get the new video controls from the parsed response
        const newVideoControls = doc.querySelector('#video-controls');
        const currentVideoControls = document.getElementById('video-controls');

        if (newVideoControls && currentVideoControls) {
            // Replace the entire video controls section
            currentVideoControls.innerHTML = newVideoControls.innerHTML;
        } else {
            // Fallback: Update individual buttons
            updatePreviousButton(doc);
            updateNextButton(doc);
        }
    }

    function updatePreviousButton(doc) {
        const newPreviousBtn = doc.getElementById('previous-btn');
        const currentPreviousBtn = document.getElementById('previous-btn');

        if (newPreviousBtn && currentPreviousBtn) {
            // Copy all attributes and content
            currentPreviousBtn.innerHTML = newPreviousBtn.innerHTML;
            currentPreviousBtn.className = newPreviousBtn.className;
            currentPreviousBtn.disabled = newPreviousBtn.disabled;

            // Copy onclick attribute if it exists
            const onclickAttr = newPreviousBtn.getAttribute('onclick');
            if (onclickAttr) {
                currentPreviousBtn.setAttribute('onclick', onclickAttr);
                currentPreviousBtn.removeAttribute('disabled');
            } else {
                currentPreviousBtn.removeAttribute('onclick');
                currentPreviousBtn.disabled = true;
            }
        }
    }

    function updateNextButton(doc) {
        const newNextBtn = doc.getElementById('next-btn');
        const currentNextBtn = document.getElementById('next-btn');

        if (newNextBtn && currentNextBtn) {
            // Copy all attributes and content
            currentNextBtn.innerHTML = newNextBtn.innerHTML;
            currentNextBtn.className = newNextBtn.className;
            currentNextBtn.disabled = newNextBtn.disabled;

            // Copy onclick attribute if it exists
            const onclickAttr = newNextBtn.getAttribute('onclick');
            if (onclickAttr) {
                currentNextBtn.setAttribute('onclick', onclickAttr);
                currentNextBtn.removeAttribute('disabled');
            } else {
                currentNextBtn.removeAttribute('onclick');
                currentNextBtn.disabled = true;
            }
        }
    }

    // Global function to toggle video completion
    window.toggleVideoCompletion = function (videoId, checkbox) {
        const isCompleted = checkbox.checked;
        ToggleVideoCompletion(videoId, isCompleted);
    };

    function ToggleVideoCompletion(videoId, isCompleted) {
        fetch('/User/Course/ToggleVideoCompletion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': getAntiForgeryToken()
            },
            body: JSON.stringify({ VideoId: videoId, IsCompleted: isCompleted })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update checkbox state
                    const checkbox = document.querySelector(`input[data-video-id="${videoId}"]`);
                    if (checkbox) {
                        checkbox.checked = isCompleted;
                    }

                    // Update progress in header
                    updateProgressDisplay(data.progress, data.completedVideos);

                    // Update section completion counts
                    updateSectionCompletionCounts();

                } else {
                    const checkbox = document.querySelector(`input[data-video-id="${videoId}"]`);
                    if (checkbox) {
                        checkbox.checked = !isCompleted;
                    }
                }
            })
            .catch(error => {
                showError('Failed to update video completion status');
                console.error('Error:', error);
                // Revert checkbox if failed
                const checkbox = document.querySelector(`input[data-video-id="${videoId}"]`);
                if (checkbox) {
                    checkbox.checked = !isCompleted;
                }
            });
    }

    function updateSectionCompletionCounts() {
        // Update section completion counts
        document.querySelectorAll('.section-header').forEach(header => {
            const sectionContent = header.nextElementSibling;
            if (sectionContent) {
                const checkboxes = sectionContent.querySelectorAll('input[type="checkbox"]');
                const completed = sectionContent.querySelectorAll('input[type="checkbox"]:checked').length;
                const total = checkboxes.length;

                const lectureInfo = header.querySelector('.text-sm.text-gray-400');
                if (lectureInfo) {
                    const text = lectureInfo.textContent;
                    const newText = text.replace(/\d+\/\d+ lectures/, `${completed}/${total} lectures`);
                    lectureInfo.textContent = newText;
                }
            }
        });
    }

    function updateProgressDisplay(newProgress, completedVideos) {
        // Update header progress bar
        const headerProgressBar = document.querySelector('.progress-bar');
        if (headerProgressBar) {
            headerProgressBar.style.width = newProgress + '%';
        }

        // Update header progress text
        const headerProgressText = document.querySelector('.progress-text');
        if (headerProgressText) {
            headerProgressText.textContent = completedVideos;
        }
    }

    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function (e) {
            // Ignore if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.which || e.keyCode) {
                case 32: // Spacebar - play/pause
                    e.preventDefault();
                    if (video) {
                        if (video.paused) {
                            video.play();
                        } else {
                            video.pause();
                        }
                    }
                    break;

                case 37: // Left arrow - seek backward 10s
                    e.preventDefault();
                    if (video) {
                        video.currentTime = Math.max(0, video.currentTime - 10);
                    }
                    break;

                case 39: // Right arrow - seek forward 10s
                    e.preventDefault();
                    if (video) {
                        video.currentTime = Math.min(video.duration, video.currentTime + 10);
                    }
                    break;

                case 70: // F - fullscreen
                    e.preventDefault();
                    if (video) {
                        if (video.requestFullscreen) {
                            video.requestFullscreen();
                        }
                    }
                    break;
            }
        });
    }

    function showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: message,
            timer: 2000,
            showConfirmButton: false,
            background: '#374151',
            color: '#fff'
        });
    }

    function showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: message,
            background: '#374151',
            color: '#fff'
        });
    }

    // Helper function to get anti-forgery token
    function getAntiForgeryToken() {
        const token = document.querySelector('input[name="__RequestVerificationToken"]');
        return token ? token.value : '';
    }

    // Helper function for slide toggle animation
    function toggleSlide(element, duration = 300) {
        if (element.style.display === 'none' || !element.style.display) {
            // Show element
            element.style.display = 'block';
            element.style.height = '0px';
            element.style.overflow = 'hidden';
            element.style.transition = `height ${duration}ms ease`;

            // Get the full height
            const height = element.scrollHeight + 'px';

            // Animate to full height
            requestAnimationFrame(() => {
                element.style.height = height;
            });

            // Clean up after animation
            setTimeout(() => {
                element.style.height = '';
                element.style.overflow = '';
                element.style.transition = '';
            }, duration);
        } else {
            // Hide element
            element.style.height = element.scrollHeight + 'px';
            element.style.overflow = 'hidden';
            element.style.transition = `height ${duration}ms ease`;

            requestAnimationFrame(() => {
                element.style.height = '0px';
            });

            // Hide after animation
            setTimeout(() => {
                element.style.display = 'none';
                element.style.height = '';
                element.style.overflow = '';
                element.style.transition = '';
            }, duration);
        }
    }

    window.toggleResourcesDropdown = function (button) {
        const dropdown = button.nextElementSibling;
        const chevron = button.querySelector('.fa-chevron-down');

        // Close all other dropdowns first
        document.querySelectorAll('.resources-dropdown').forEach(otherDropdown => {
            if (otherDropdown !== dropdown) {
                otherDropdown.classList.add('hidden');

                // Reset other chevrons
                const otherToggle = otherDropdown.previousElementSibling;
                if (otherToggle) {
                    const otherChevron = otherToggle.querySelector('.fa-chevron-down');
                    if (otherChevron) {
                        otherChevron.style.transform = 'rotate(0deg)';
                    }
                }
            }
        });

        // Toggle current dropdown
        if (dropdown.classList.contains('hidden')) {
            dropdown.classList.remove('hidden');
            if (chevron) {
                chevron.style.transform = 'rotate(180deg)';
            }
        } else {
            dropdown.classList.add('hidden');
            if (chevron) {
                chevron.style.transform = 'rotate(0deg)';
            }
        }
    };


    // Handle browser back/forward buttons
    window.addEventListener('popstate', function (event) {
        if (event.state && event.state.videoId) {
            loadVideo(event.state.videoId);
        }
    });

    // Clean up intervals when page unloads
    window.addEventListener('beforeunload', function () {
        if (progressUpdateInterval) {
            clearInterval(progressUpdateInterval);
        }
    });
});