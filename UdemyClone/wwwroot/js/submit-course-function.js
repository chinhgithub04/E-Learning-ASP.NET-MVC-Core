function submitForReview(e) {
    createOverlay();

    const courseId = document.getElementById('CourseId').value;
    fetch('/Instructor/Course/ReviewCourse/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseId)
    })
        .then(res => res.json())
        .then(data => {
            removeOverlay();

            if (!data.success) {
                const missingRequirements = buildRequirementsList(data);

                Swal.fire({
                    showCloseButton: true,
                    title: "Why can't I submit for review?",
                    html: `
                        <div class="text-left leading-relaxed">
                            <p class="text-base mb-5 text-gray-600">
                                You're almost ready to submit your course. Here are a few more items you need.
                            </p>
                            ${missingRequirements}
                            <p class="text-base mb-5 text-gray-600">
                                Once you complete these steps, you will be able to successfully submit your course for review.
                            </p>
                        </div>
                    `,
                    showConfirmButton: false,
                    width: '650px',
                    customClass: {
                        popup: 'text-left',
                        title: 'text-xl font-bold text-gray-800'
                    }
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Course Successfully Submitted!',
                    html: `
                        <div class="text-center">
                            <div class="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                                <p class="text-sm text-green-800">
                                    <strong>What's Next?</strong><br>
                                    Our review team will evaluate your course within 2-3 business days. You'll receive an email notification once the review is complete.
                                </p>
                            </div>
                        </div>
                    `,
                    confirmButtonText: 'Got it!',
                    confirmButtonColor: '#10b981',
                    width: '500px'
                });

                e.target.disabled = true;

                const navBar = document.querySelector('nav');
                const submittedBadge = document.createElement('div');
                submittedBadge.className = 'mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3';
                submittedBadge.innerHTML = `
                    <div class="flex space-x-1">
                        <svg class="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                        </svg>
                        <p class="text-sm font-medium text-blue-700">Course submitted for review</p>
                    </div>
                    <div class="text-sm text-blue-700">
                        <p class="mt-1 text-blue-600">You'll receive an email notification once the review is complete.</p>
                    </div>
                `;
                navBar.appendChild(submittedBadge);
            }
        })
        .catch(error => {
            removeOverlay();
            Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                html: `
                    <div class="text-center">
                        <p class="text-gray-700 mb-4">We encountered an issue while submitting your course for review.</p>
                        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                            <p class="text-sm text-red-800">
                                <strong>Please try again.</strong> If the problem persists, contact our support team for assistance.
                            </p>
                        </div>
                    </div>
                `,
                confirmButtonText: 'Try Again',
                confirmButtonColor: '#ef4444',
                width: '450px'
            });
        });
}

function buildRequirementsList(data) {
    const courseId = document.getElementById('CourseId').value;
    let html = '';

    // Intended learners section
    const intendedLearners = [];
    if (!data.hasCourseOutcomes) intendedLearners.push('Define clear <b> learning outcomes </b>that describe the skills students will gain upon completion');
    if (!data.hasRequiremenes) intendedLearners.push('List any <b> prerequisites </b>, tools, or background knowledge students need before starting');

    if (intendedLearners.length > 0) {
        html += `
            <div class="mb-6">
                <h4 class="text-gray-800 mb-3 font-semibold text-lg flex items-center border-b border-gray-100 pb-2">
                    On the <a class="mx-1 text-orange-600 hover:text-orange-700 underline font-medium transition-colors duration-200" href="/Instructor/Course/Manage/${courseId}/intended-learners" target="_blank">Intended learners</a> page, you must
                </h4>
                <ul class="ml-8 space-y-3">
                    ${intendedLearners.map(item => `<li class="text-gray-700 text-sm leading-relaxed relative before:content-['•'] before:absolute before:-left-5 before:text-orange-500 before:font-bold before:text-lg">${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // Curriculum section
    const curriculumns = [];
    if (!data.isCourseDurationGreaterThan30) curriculumns.push('Have at least <b> 30 minutes </b> of video content');
    if (!data.hasAtLeastFiveVideosInSections) curriculumns.push('Have at least <b> 5 lectures </b>');

    if (curriculumns.length > 0) {
        html += `
            <div class="mb-6">
                <h4 class="text-gray-800 mb-3 font-semibold text-lg flex items-center border-b border-gray-100 pb-2">
                    On the <a class="mx-1 text-orange-600 hover:text-orange-700 underline font-medium transition-colors duration-200" href="/Instructor/Course/Manage/${courseId}/curriculum" target="_blank">Curriculum</a> page, you must
                </h4>
                <ul class="ml-8 space-y-3">
                    ${curriculumns.map(item => `<li class="text-gray-700 text-sm leading-relaxed relative before:content-['•'] before:absolute before:-left-5 before:text-orange-500 before:font-bold before:text-lg">${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // Landing page section
    const ladingPages = [];
    if (!data.hasTitle) ladingPages.push('Have a title');
    if (!data.hasSubTitle) ladingPages.push('Have a course <b> subtitle </b>');
    if (!data.hasAtLeast200WordsDescription) ladingPages.push('Have a course <b> description </b> with at least 200 words');
    if (!data.hasLevel) ladingPages.push('Select the <b> level </b> of your course');
    if (!data.hasCategory) ladingPages.push('Select the <b> category </b> of your course');
    if (!data.hasSubcategory) ladingPages.push('Select the <b> subcategory </b> of your course');
    if (!data.hasCourseImage) ladingPages.push('Upload a course <b> thumbnail image </b>');

    if (ladingPages.length > 0) {
        html += `
            <div class="mb-6">
                <h4 class="text-gray-800 mb-3 font-semibold text-lg flex items-center border-b border-gray-100 pb-2">
                    On the <a class="mx-1 text-orange-600 hover:text-orange-700 underline font-medium transition-colors duration-200" href="/Instructor/Course/Manage/${courseId}/landing-page" target="_blank">Course landing page</a> page, you must
                </h4>
                <ul class="ml-8 space-y-3">
                    ${ladingPages.map(item => `<li class="text-gray-700 text-sm leading-relaxed relative before:content-['•'] before:absolute before:-left-5 before:text-orange-500 before:font-bold before:text-lg">${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    return html;
}
function createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'fixed inset-0 bg-white/80 backdrop-blur flex items-center justify-center z-50';

    const spinner = document.createElement('div');
    spinner.className = 'animate-spin rounded-full h-12 w-12 border-b-4 border-orange-600 mb-4';

    const loadingText = document.createElement('p');
    loadingText.className = 'text-gray-600 font-medium';
    loadingText.textContent = 'Reviewing your course...';

    const container = document.createElement('div');
    container.className = 'flex flex-col items-center';
    container.appendChild(spinner);
    container.appendChild(loadingText);

    overlay.appendChild(container);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', () => {
        overlay.remove();
    })
}

function removeOverlay() {
    const overlayElement = document.getElementById('loading-overlay');
    if (overlayElement) {
        overlayElement.remove();
    }
}

window.submitForReview = submitForReview