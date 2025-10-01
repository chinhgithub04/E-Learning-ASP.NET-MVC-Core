function initializeCurriculumnFunction() {
    const curriculum = document.getElementById('curriculum-sections');
    if (!curriculum) return;

    const sectionToggles = curriculum.querySelectorAll('.section-toggle');
    const expandToggleBtn = document.getElementById('expand-toggle-btn');
    let allExpanded = false;

    const toggleSection = (sectionToggle, forceState) => {
        const videoContainer = sectionToggle.nextElementSibling;
        const chevron = sectionToggle.querySelector('.lucide-chevron-down');
        if (!videoContainer) return;

        const isHidden = videoContainer.classList.contains('hidden');
        const expand = forceState !== undefined ? forceState : isHidden;

        if (expand) {
            videoContainer.classList.remove('hidden');
            chevron.classList.add('rotate-180');
        } else {
            videoContainer.classList.add('hidden');
            chevron.classList.remove('rotate-180');
        }
    };

    sectionToggles.forEach(toggle => {
        toggle.addEventListener('click', () => toggleSection(toggle));
    });

    if (expandToggleBtn) {
        expandToggleBtn.addEventListener('click', () => {
            allExpanded = !allExpanded;
            sectionToggles.forEach(toggle => toggleSection(toggle, allExpanded));
            expandToggleBtn.textContent = allExpanded ? 'Collapse all sections' : 'Expand all sections';
        });
    }

    initializePreviewModal();
}

function initializePreviewModal() {
    const previewModal = document.getElementById('previewModal');
    const closeModalBtn = document.getElementById('closePreviewModal');
    const previewVideoPlayer = document.getElementById('previewVideoPlayer');
    const previewVideoSource = document.getElementById('previewVideoSource');
    const modalVideoTitle = document.getElementById('modalVideoTitle');
    const modalSectionTitle = document.getElementById('modalSectionTitle');
    const previewLecturesList = document.getElementById('previewLecturesList');
    const previewCount = document.getElementById('previewCount');

    if (!previewModal) return;

    const allPreviewLectures = Array.from(document.querySelectorAll('.preview-btn')).map(btn => ({
        id: btn.getAttribute('data-video-id'),
        title: btn.getAttribute('data-video-title'),
        url: btn.getAttribute('data-video-url'),
        sectionTitle: btn.getAttribute('data-section-title'),
        element: btn
    }));

    function loadVideo(lecture) {
        previewVideoSource.src = lecture.url;
        previewVideoPlayer.load();
        modalVideoTitle.textContent = lecture.title;
        modalSectionTitle.textContent = lecture.sectionTitle;

        updateActivePreviewItem(lecture.id);
    }

    function populatePreviewList() {
        if (!previewLecturesList) return;

        previewLecturesList.innerHTML = '';
        
        if (allPreviewLectures.length === 0) {
            previewLecturesList.innerHTML = '<p class="p-4 text-sm text-gray-500">No preview lectures available</p>';
            return;
        }

        if (previewCount) {
            previewCount.textContent = `${allPreviewLectures.length} preview${allPreviewLectures.length !== 1 ? 's' : ''} available`;
        }

        allPreviewLectures.forEach((lecture, index) => {
            const lectureItem = document.createElement('div');
            lectureItem.className = 'preview-lecture-item cursor-pointer border-b border-gray-200 p-4 transition-colors hover:bg-gray-100';
            lectureItem.setAttribute('data-video-id', lecture.id);
            
            lectureItem.innerHTML = `
                <div class="flex items-start gap-3">
                    <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
                        <i class="fas fa-play text-sm text-orange-600"></i>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <p class="text-sm font-medium text-gray-900 line-clamp-2">${lecture.title}</p>
                                <p class="mt-1 text-xs text-gray-500">${lecture.sectionTitle}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            lectureItem.addEventListener('click', () => {
                loadVideo(lecture);
            });

            previewLecturesList.appendChild(lectureItem);
        });
    }

    function updateActivePreviewItem(videoId) {
        const items = previewLecturesList.querySelectorAll('.preview-lecture-item');
        items.forEach(item => {
            if (item.getAttribute('data-video-id') === videoId) {
                item.classList.add('bg-orange-50', 'border-r-4', 'border-r-orange-600');
                item.classList.remove('hover:bg-gray-100');
            } else {
                item.classList.remove('bg-orange-50', 'border-r-4', 'border-r-orange-600');
                item.classList.add('hover:bg-gray-100');
            }
        });
    }

    function openModal(lecture) {
        if (previewModal) {
            previewModal.classList.remove('hidden');
            previewModal.classList.add('flex');
            document.body.style.overflow = 'hidden';
            
            populatePreviewList();
            
            loadVideo(lecture);
        }
    }

    function closeModal() {
        if (previewModal) {
            previewModal.classList.add('hidden');
            previewModal.classList.remove('flex');
            document.body.style.overflow = '';
            
            previewVideoPlayer.pause();
            previewVideoSource.src = '';
        }
    }

    document.querySelectorAll('.preview-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const lecture = {
                id: btn.getAttribute('data-video-id'),
                title: btn.getAttribute('data-video-title'),
                url: btn.getAttribute('data-video-url'),
                sectionTitle: btn.getAttribute('data-section-title')
            };
            openModal(lecture);
        });
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (previewModal) {
        previewModal.addEventListener('click', (e) => {
            if (e.target === previewModal) {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !previewModal.classList.contains('hidden')) {
            closeModal();
        }
    });

    if (previewVideoPlayer) {
        previewVideoPlayer.addEventListener('ended', () => {
            const currentVideoId = previewVideoSource.src.split('/').pop().split('?')[0];
            const currentIndex = allPreviewLectures.findIndex(l => l.url.includes(currentVideoId));
            
            if (currentIndex !== -1 && currentIndex < allPreviewLectures.length - 1) {
                const nextLecture = allPreviewLectures[currentIndex + 1];
                loadVideo(nextLecture);
                previewVideoPlayer.play();
            }
        });
    }
}

window.initializeCurriculumnFunction = initializeCurriculumnFunction