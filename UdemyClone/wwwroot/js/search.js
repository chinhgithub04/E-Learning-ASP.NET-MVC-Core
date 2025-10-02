// Search page functionality
$(document).ready(function() {
    // Handle search form submission with Enter key
    $('.search-input').keypress(function(e) {
        if (e.which == 13) {
            $(this).closest('form').submit();
        }
    });

    // Auto-submit filter form when filters change
    $('#filterForm input[type="radio"], #filterForm select').change(function() {
        // Add a small delay to prevent rapid-fire submissions
        clearTimeout(window.filterTimeout);
        window.filterTimeout = setTimeout(function() {
            $('#filterForm').submit();
        }, 300);
    });

    // Price range validation
    $('input[name="minPrice"], input[name="maxPrice"]').on('input', function() {
        var minPrice = parseFloat($('input[name="minPrice"]').val()) || 0;
        var maxPrice = parseFloat($('input[name="maxPrice"]').val()) || 999999;
        
        if (minPrice > maxPrice) {
            $(this).addClass('border-red-500');
        } else {
            $('input[name="minPrice"], input[name="maxPrice"]').removeClass('border-red-500');
        }
    });

    // Reset page to 1 when filters change
    $('#filterForm').on('submit', function() {
        $('input[name="page"]').val('1');
    });

    // Search suggestions (could be enhanced with AJAX)
    $('.search-input').on('focus', function() {
        // Future enhancement: Show search suggestions
    });
});