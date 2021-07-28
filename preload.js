const Quill = require('quill');

window.addEventListener('DOMContentLoaded', () => {
    var editor = new Quill('.editor', {
        theme: 'snow',
        scrollingContainer: '#scrolling-container'
    });
})