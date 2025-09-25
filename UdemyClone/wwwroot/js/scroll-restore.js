document.addEventListener('DOMContentLoaded', function () {
    const scrollPosition = sessionStorage.getItem('scrollPosition');
    if (scrollPosition) {
        // Use a small timeout to ensure the page has finished rendering
        setTimeout(function () {
            window.scrollTo(0, parseInt(scrollPosition, 10));
            sessionStorage.removeItem('scrollPosition');
        }, 100);
    }
});