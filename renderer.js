document.addEventListener('DOMContentLoaded', function() {
    // Handle the resizing of the sidebar
    // Ref: https://htmldom.dev/create-resizable-split-views/
    // Mouse position
    let mouseX = 0;
    let mouseY = 0;

    // Width of the sidebar
    let sidebarWidth = 0;

    // Query the resizer handle and its siblings
    const handler = document.getElementById('handle');
    const sidebar = handler.previousElementSibling;
    const main = handler.nextElementSibling;

    // Handles the mousedown event
    const handleMouseDown = function(event) {
        // Current mouse position
        mouseX = event.clientX;
        mouseY = event.clientY;
        sidebarWidth = sidebar.getBoundingClientRect().width;

        // Atach the other two listeners to the document
        // They handle the calculation of the mouse movement and when it stops
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = function(event) {
        // Calculate how far the mouse has moved
        const distMouseX = event.clientX - mouseX;
        const distMouseY = event.clientY - mouseY;

        // Sets the new size of the sidebar
        const newSidebarWidth = (sidebarWidth + distMouseX) * 100 / handler.parentNode.getBoundingClientRect().width;
        let newSidebarWidthPX = (newSidebarWidth / 100) * handler.parentNode.getBoundingClientRect().width
        if(newSidebarWidthPX > 200 && newSidebarWidth <= 80) {
            // Calculates how many letters of the files and folders names should be show
            // Formula: floor of ((newSidebarWidthPX - scrollbarWidth)/fontSizeInPX)-numberOfDots
            let currentFolderName = document.getElementById('currentFolderName');
            window.bridge.sliceMainFolderName(Math.floor((newSidebarWidthPX-10)/14)-3, currentFolderName);
            sidebar.style.width = `${newSidebarWidth}%`;
        }
        else if (newSidebarWidth > 80) {
            let currentFolderName = document.getElementById('currentFolderName');
            window.bridge.sliceMainFolderName(Math.floor((newSidebarWidthPX-10)/14)-3, currentFolderName);
            sidebar.style.width = "80%";
        }
        else {
            sidebar.style.width = "200px";
        }

        // Changes the cursor appereance
        handler.style.cursor = 'col-resize';
        document.body.style.cursor = 'col-resize';

        // Blocks user selection
        sidebar.style.userSelect = 'none';
        sidebar.style.pointerEvents = 'none';

        main.style.userSelect = 'none';
        main.style.pointerEvents = 'none';
    };

    const handleMouseUp = function() {
        // Reset the cursor appereance and the selection when finished
        handler.style.removeProperty('cursor');
        document.body.style.removeProperty('cursor');

        sidebar.style.removeProperty('user-select');
        sidebar.style.removeProperty('pointer-events');

        main.style.removeProperty('user-select');
        main.style.removeProperty('pointer-events');

        // Remove the handlers of `mousemove` and `mouseup`
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    // FIXME isso não ta funcionando, esse ai é uma tentativa de tirar as seleções
    document.getElementsByTagName('BODY')[0].addEventListener('focusout', () => {
        let selections = document.getElementsByClassName('selected');
        while(selections.length >= 1) {
            selections[0].classList.toggle('selected');
        }
    })

    handler.addEventListener('mousedown', handleMouseDown);
})