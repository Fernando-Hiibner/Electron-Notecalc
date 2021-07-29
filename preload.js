const {app, globalShortcut} = require('electron');
const Quill = require('quill');
const path = require('path');
const fs = require('fs');


window.addEventListener('DOMContentLoaded', () => {
    // Create quill
    var editor = new Quill('.editor', {
        theme: 'snow',
        modules: {
            clipboard: {
                matchVisual: false
            },
            toolbar: false
        },
        scrollingContainer: '#scrolling-container'
    });

    // Async Read dir and place files and folders in the sidebar
    var sidebar = document.getElementById('sidebar');
    sidebar.innerText = path.basename(__dirname);
    fs.readdir(__dirname, (err, files) => {
        if (err) console.log(err);
        else {files.forEach(file => {
            fs.lstat(path.join(__dirname, file), (err, stats) => {
                if(err) console.log(err);
                else if (stats.isDirectory()) {
                    let fileLi = document.createElement('p');
                    fileLi.setAttribute('id', 'sidebarP');
                    fileLi.innerText = file;
                    sidebar.appendChild(fileLi);
                }
            });
        })}
    });
    fs.readdir(__dirname, (err, files) => {
        if (err) console.log(err);
        else {files.forEach(file => {
            fs.lstat(path.join(__dirname, file), (err, stats) => {
                if(err) console.log(err);
                else if (stats.isFile()) {
                    let fileLi = document.createElement('p');
                    fileLi.setAttribute('id', 'sidebarP');
                    fileLi.innerText = file;
                    sidebar.appendChild(fileLi);
                }
            });
        })}
    });
});