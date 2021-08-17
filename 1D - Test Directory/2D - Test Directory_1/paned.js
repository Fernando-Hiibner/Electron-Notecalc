function docReady(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

docReady(() => {
    let mouseX = 0;

    let sidebarWidth = 0;

    let sidebar = document.getElementById('sidebar');
    let handler = document.getElementById('handle');
    let main = document.getElementsByClassName('main')[0];

    let handleMouseDown = (event) => {
        mouseX = event.clientX;
        sidebarWidth = sidebar.getBoundingClientRect().width;

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp);
    };

    let handleMouseMove = (event) => {
        let distMouseX = event.clientX - mouseX;

        let newSidebarWidth = (sidebarWidth + distMouseX) * 100 / handler.parentNode.getBoundingClientRect().width;
        let newSidebarWidthPX = (newSidebarWidth / 100) * handler.parentNode.getBoundingClientRect().width;

        if(newSidebarWidthPX > 200 && newSidebarWidth <= 80) {
            let currentFolderName = document.getElementById('currentFolderName');
            window.bridge.sliceMainFolderName(Math.floor( (newSidebarWidthPX - 40) / 14 ) - 3, currentFolderName);
            sidebar.style.width = `${newSidebarWidth}%`;
        }
        else if(newSidebarWidth > 80) {
            let currentFolderName = document.getElementById('currentFolderName');
            window.bridge.sliceMainFolderName(Math.floor( (newSidebarWidthPX - 40) / 14 ) - 3, currentFolderName);
            sidebar.style.width = "80%";
        }
        else {
            window.bridge.sliceMainFolderName(Math.floor( (newSidebarWidthPX - 40) / 14 ) - 3, currentFolderName);
            sidebar.style.width = "200px";
        }

        handler.style.cursor = "col-resize";
        document.body.style.cursor = "col-resize";

        sidebar.style.userSelect = "none";
        sidebar.style.pointerEvents = "none";

        main.style.userSelect = "none";
        main.style.pointerEvents = "none";
    };

    let handleMouseUp = () => {
        handler.style.removeProperty("cursor");
        document.body.style.removeProperty("cursor");

        sidebar.style.removeProperty("user-select");
        sidebar.style.removeProperty("pointer-events");

        main.style.removeProperty("user-select");
        main.style.removeProperty("pointer-events");

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    handler.addEventListener('mousedown', handleMouseDown);
});