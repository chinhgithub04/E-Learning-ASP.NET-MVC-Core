// Dynamic Input Field Management with SortableJS
document.addEventListener('DOMContentLoaded', function () {
    let sortableInstances = {};

    // Initialize sortable on any existing containers when content loads
    function initializeAllSortables() {
        const containers = document.querySelectorAll('[id$="-container"]');
        containers.forEach(container => {
            updateFieldControls(container);
            initializeSortable(container.id);
        });

        // Setup change tracking after sortables are initialized
        setupChangeTracking();
    }

    // Setup change tracking for form inputs
    function setupChangeTracking() {
        // Track input changes
        document.addEventListener('input', function (e) {
            if (e.target.matches('input[name="LearningOutcomes[]"], input[name="Prerequisites[]"]')) {
                if (typeof window.checkForChanges === 'function') {
                    window.checkForChanges();
                }
            }
        });

        // Track paste events
        document.addEventListener('paste', function (e) {
            if (e.target.matches('input[name="LearningOutcomes[]"], input[name="Prerequisites[]"]')) {
                setTimeout(() => {
                    if (typeof window.checkForChanges === 'function') {
                        window.checkForChanges();
                    }
                }, 10);
            }
        });
    }

    // Handle Add More button clicks
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('add-more-btn')) {
            e.preventDefault();
            addInputField(e.target);
        }
    });

    // Handle Remove button clicks (using event delegation)
    document.addEventListener('click', function (e) {
        if (e.target.closest('.remove-input')) {
            e.preventDefault();
            removeInputField(e.target.closest('.remove-input'));
        }
    });

    function addInputField(button) {
        const containerId = button.getAttribute('data-container');
        const inputName = button.getAttribute('data-name');
        const placeholder = button.getAttribute('data-placeholder');
        const container = document.getElementById(containerId);

        if (!container) return;

        // Create new input row
        const newRow = document.createElement('div');
        newRow.className = 'flex items-center space-x-3 input-row';
        newRow.innerHTML = `
            <button type="button" class="drag-handle cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing" title="Drag to reorder">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h5 w-5 lucide lucide-align-justify-icon lucide-align-justify"><path d="M3 12h18" /><path d="M3 18h18" /><path d="M3 6h18" /></svg>
            </button>
            <input type="text" name="${inputName}" class="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500" 
                   placeholder="${placeholder}">
            <button type="button" class="cursor-pointer remove-input text-red-500 hover:text-red-700">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        `;

        // Find the sortable area (inputs-list) within the container
        let sortableArea = container.querySelector('.inputs-list');

        // Add to sortable area
        sortableArea.appendChild(newRow);

        // Update field controls and reinitialize sortable
        updateFieldControls(container);
        initializeSortable(containerId);

        // Focus on the new input
        const newInput = newRow.querySelector('input');
        if (newInput) {
            newInput.focus();
        }

        // Trigger change detection after adding a field
        if (typeof window.checkForChanges === 'function') {
            window.checkForChanges();
        }
    }

    function removeInputField(removeButton) {
        const inputRow = removeButton.closest('.input-row');
        const container = inputRow.closest('[id$="-container"]');

        if (!inputRow || !container) return;

        // Remove the input row
        inputRow.remove();

        // Update field controls and reinitialize sortable
        updateFieldControls(container);
        initializeSortable(container.id);

        // Trigger change detection after removing a field
        if (typeof window.checkForChanges === 'function') {
            window.checkForChanges();
        }
    }

    function updateFieldControls(container) {
        const inputRows = container.querySelectorAll('.input-row');
        const removeButtons = container.querySelectorAll('.remove-input');
        const dragHandles = container.querySelectorAll('.drag-handle');

        if (inputRows.length > 1) {
            // Show all remove buttons and drag handles when there's more than one input
            removeButtons.forEach(button => {
                button.classList.remove('hidden');
            });
            dragHandles.forEach(handle => {
                handle.classList.remove('hidden');
            });
        } else {
            // Hide all remove buttons and drag handles when there's only one input
            removeButtons.forEach(button => {
                button.classList.add('hidden');
            });
            dragHandles.forEach(handle => {
                handle.classList.add('hidden');
            });
        }
    }

    function initializeSortable(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Find the inputs-list area to make sortable (not the entire container)
        const sortableArea = container.querySelector('.inputs-list');
        if (!sortableArea) return;

        // Destroy existing sortable instance if it exists
        if (sortableInstances[containerId]) {
            sortableInstances[containerId].destroy();
        }

        // Create new sortable instance only for the inputs-list area
        sortableInstances[containerId] = new Sortable(sortableArea, {
            handle: '.drag-handle',
            animation: 200,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onStart: function (evt) {
                // Add custom styling when drag starts
                evt.item.classList.add('opacity-70');
            },
            onEnd: function (evt) {
                // Remove custom styling when drag ends
                evt.item.classList.remove('opacity-70');

                // Trigger change detection after reordering
                if (typeof window.checkForChanges === 'function') {
                    setTimeout(() => {
                        window.checkForChanges();
                    }, 10);
                }
            }
        });
    }

    // Initialize sortables on page load
    initializeAllSortables();

    // Expose function globally so it can be called after AJAX loads
    window.initializeAllSortables = initializeAllSortables;
});