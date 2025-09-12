function initializePricingPageFunction() {
    const freeCard = document.getElementById('free-card');
    const paidCard = document.getElementById('paid-card');
    const priceHolder = document.getElementById('price-holder');
    const priceInput = priceHolder.querySelector('input[name="Price"]');
    const freeRadio = freeCard.querySelector('input[name="pricing"]');
    const paidRadio = paidCard.querySelector('input[name="pricing"]');

    let originalPrice = parseFloat(priceInput.value) || 0;
    let currentPricingType = originalPrice === 0 ? 'free' : 'paid';

    if (currentPricingType === 'paid') {
        priceHolder.classList.remove('hidden');

        if (originalPrice === 0) {
            priceInput.value = '1.99';
        }
    }

    freeCard.addEventListener('click', () => {
        priceHolder.classList.add('hidden');
        priceInput.value = '0';
        freeRadio.checked = true;
        paidRadio.checked = false;
        currentPricingType = 'free';

        if (typeof window.checkForChanges === 'function') {
            window.checkForChanges();
        }
    });

    paidCard.addEventListener('click', () => {
        priceHolder.classList.remove('hidden');
        freeRadio.checked = false;
        paidRadio.checked = true;
        currentPricingType = 'paid';

        const currentValue = parseFloat(priceInput.value) || 0;
        if (currentValue === 0) {
            priceInput.value = '1.99';
        }

        setTimeout(() => {
            priceInput.focus();
        }, 100);

        if (typeof window.checkForChanges === 'function') {
            window.checkForChanges();
        }
    });

    priceInput.addEventListener('blur', () => {
        const value = parseFloat(priceInput.value);

        if (isNaN(value) || value < 1.99) {
            priceInput.value = '1.99';
        }

        if (typeof window.checkForChanges === 'function') {
            window.checkForChanges();
        }
    });

    priceInput.addEventListener('input', () => {
        if (typeof window.checkForChanges === 'function') {
            window.checkForChanges();
        }
    });

    freeRadio.addEventListener('change', () => {
        if (freeRadio.checked) {
            priceHolder.classList.add('hidden');
            priceInput.value = '0';
            currentPricingType = 'free';

            if (typeof window.checkForChanges === 'function') {
                window.checkForChanges();
            }
        }
    });

    paidRadio.addEventListener('change', () => {
        if (paidRadio.checked) {
            priceHolder.classList.remove('hidden');
            currentPricingType = 'paid';

            const currentValue = parseFloat(priceInput.value) || 0;
            if (currentValue === 0) {
                priceInput.value = '1.99';
            }

            if (typeof window.checkForChanges === 'function') {
                window.checkForChanges();
            }
        }
    });

    window.originalPricingData = {
        pricingType: currentPricingType,
        price: originalPrice
    };

    function savePricing() {
        const priceInput = document.querySelector('input[name="Price"]');
        const courseIdInput = document.getElementById('CourseId');

        if (!priceInput || !courseIdInput) {
            alert('Unable to save pricing. Please refresh the page and try again.');
            return;
        }

        const saveButton = document.getElementById('save-button');
        const originalText = saveButton.textContent;
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';

        const pricingData = {
            Id: courseIdInput.value,
            Price: parseFloat(priceInput.value) || 0
        };

        fetch('/Instructor/Course/SavePricing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pricingData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        title: 'Success!',
                        text: data.message,
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    captureOriginalFormData();
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: data.message || 'An error occurred while saving pricing.',
                        icon: 'error',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            })
            .catch(error => {
                alert('An error occurred while saving pricing. Please try again.');
            })
            .finally(() => {
                saveButton.textContent = originalText;
                toggleSaveButton();
            });
    }
    window.savePricing = savePricing;
}

window.initializePricingPageFunction = initializePricingPageFunction;