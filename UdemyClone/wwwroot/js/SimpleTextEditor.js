function InitializeTextEditor() {
    if (tinymce.get('course-description')) {
        tinymce.remove('#course-description');
    }

    tinymce.init({
        selector: '#course-description',
        menubar: false,
        statusbar: false,
        plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
        toolbar: 'undo redo | fontsize | bold italic underline | numlist bullist',
    });
}

window.InitializeTextEditor = InitializeTextEditor;