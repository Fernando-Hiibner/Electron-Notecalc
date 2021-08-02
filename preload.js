const highlight = require('highlight.js');
const Quill = require('quill');
const path = require('path');
const fs = require('fs');

function recursiveAsyncReadDir(directory, done) {
    var folders = [];
    var files = [];
    fs.readdir(directory, function(err, list) {
      if (err) return done(err);
      var i = 0;
      (function next() {
        var file = list[i++];
        if (!file) return done(null, folders, files);
        file = path.resolve(directory, file);
        fs.stat(file, function(err, stat) {
            if (stat && stat.isDirectory()) folders.push(file);
            else files.push(file);
            next();
        });
      })();
    });
}

function recursiveDepthCalc(el, sum) {
    if(el.parentElement.id === 'fatherNode') {
        return sum;
    }
    else if (el.tagName !== 'UL') {
        return recursiveDepthCalc(el.parentElement, sum);
    }
    else {
        return recursiveDepthCalc(el.parentElement, sum+1);
    }
}

function readDirectory(directory, node) {
    if(node.id !== 'fatherNode') {
        var nestedUL = document.createElement('ul');
        nestedUL.setAttribute('class', 'nested');
        node.appendChild(nestedUL);
    }
    else {
        nestedUL = document.getElementById('fatherNode');
    }

    recursiveAsyncReadDir(directory, (err, folders, files) => {
        if(folders) {
            folders.forEach((folder) => {
                let folderLI = document.createElement('li');
                let folderSPAN = document.createElement('span');
                folderSPAN.setAttribute('class', 'folder');
                folderSPAN.innerText = path.basename(folder)
                folderLI.appendChild(folderSPAN);
                nestedUL.appendChild(folderLI);
                depth = recursiveDepthCalc(folderLI, 0);
                folderSPAN.style.paddingLeft = `${depth*0.5}cm`
                folderSPAN.addEventListener('click', () => {
                    if(!folderSPAN.parentElement.querySelector(".nested")) {
                        readDirectory(path.join(directory, path.basename(folder)), folderLI);
                    }
                    folderSPAN.parentElement.querySelector(".nested").classList.toggle("active");
                    folderSPAN.classList.toggle("folder-down");
                });
            });
        }
        if(files) {
            files.forEach((file) => {
                let fileLI = document.createElement('li');
                let fileSPAN = document.createElement('span');
                fileSPAN.setAttribute('class', 'file');
                fileSPAN.innerText = path.basename(file);
                fileLI.appendChild(fileSPAN);
                nestedUL.appendChild(fileLI);
                depth = recursiveDepthCalc(fileLI, 0);
                fileSPAN.style.paddingLeft = `${depth*0.5}cm`;
            });
        }
    });
}

function readUpperDirectory(upperDirectory, currentDirectory, fatherNode) {
    let currentFolderName = path.basename(currentDirectory);
    let newFatherNode = document.createElement('ul');
    newFatherNode.setAttribute('id', 'fatherNode');
    sidebar.appendChild(newFatherNode);

    recursiveAsyncReadDir(upperDirectory, (err, folders, files) => {
        if(folders) {
            folders.forEach((folder) => {
                let folderLI = document.createElement('li');
                let folderSPAN = document.createElement('span');
                folderSPAN.innerText = path.basename(folder)
                folderLI.appendChild(folderSPAN);
                if(path.basename(folder) === currentFolderName) {
                    fatherNode.removeAttribute('id');
                    fatherNode.setAttribute('class', 'nested');
                    folderLI.setAttribute('class', 'folder');
                    folderLI.appendChild(fatherNode);
                    newFatherNode.appendChild(folderLI);
                    for(let i = 0; i < fatherNode.childNodes.length; i++) {
                        if(fatherNode.childNodes[i].tagName === "LI") {
                            subDepth = recursiveDepthCalc(fatherNode.childNodes[i], 0);
                            for(let z = 0; z < fatherNode.childNodes[i].childNodes.length; z++) {
                                subChild = fatherNode.childNodes[i].childNodes[z];
                                if(subChild.tagName === "SPAN") {
                                    subChild.style.paddingLeft = `${subDepth*0.5}cm`
                                }
                            }
                        }
                    }
                    fatherNode.classList.toggle('active');
                    folderSPAN.classList.toggle('folder-down');
                }
                else {
                    folderLI.setAttribute('class', 'folder');
                    newFatherNode.appendChild(folderLI);
                }
                depth = recursiveDepthCalc(folderLI, 0);
                folderSPAN.style.paddingLeft = `${depth*0.5}cm`
                folderSPAN.addEventListener('click', () => {
                    if(!folderSPAN.parentElement.querySelector(".nested")) {
                        readDirectory(path.join(upperDirectory, path.basename(folder)), folderLI);
                    }
                    folderSPAN.parentElement.querySelector(".nested").classList.toggle("active");
                    if(folderSPAN.classList[0] !== "folder-down") {
                        folderSPAN.classList.toggle("folder-down");
                    }
                });
            });
        }
        if(files) {
            files.forEach((file) => {
                let fileLI = document.createElement('li');
                let fileSPAN = document.createElement('span');
                fileSPAN.setAttribute('class', 'file');
                fileSPAN.innerText = path.basename(file);
                fileLI.appendChild(fileSPAN);
                newFatherNode.appendChild(fileLI);
                depth = recursiveDepthCalc(fileLI, 0);
                fileSPAN.style.paddingLeft = `${depth*0.5}cm`;
            });
        }
    });
    process.chdir(upperDirectory);
    return newFatherNode;
}

window.addEventListener('DOMContentLoaded', () => {
    // Create quill
    var toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],

        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction

        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

        [{ 'color': ["#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466", "color-picker"] }, { 'background': ["#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466", "color-picker-bg"] }],
        [{ 'font': [] }],
        [{ 'align': [] }],

        ['image', 'video'],

        ['clean']                                         // remove formatting button
      ];
    var editor = new Quill('.editor', {
        theme: 'snow',
        modules: {
            clipboard: {
                matchVisual: true
            },
            toolbar: toolbarOptions,
            syntax: {
                highlight: (text) => highlight.highlightAuto(text).value,
            }
        },
        scrollingContainer: '#scrolling-container',
        placeholder: "Digite aqui..."
    });

    function showColorPicker(value) {
        if (value === 'color-picker') {
            let picker = document.getElementById('color-picker');
            if (!picker) {
                picker = document.createElement('input');
                picker.id = 'color-picker';
                picker.type = 'color';
                picker.style.display = 'none';
                picker.value = '#FF0000';
                document.body.appendChild(picker);
                picker.addEventListener('change', function() {
                    editor.format('color', picker.value);
                }, false);
            }
            picker.click();
        }
        else if (value === 'color-picker-bg') {
            let bgPicker = document.getElementById('color-picker-bg');
            if (!bgPicker) {
                bgPicker = document.createElement('input');
                bgPicker.id = 'color-picker-bg';
                bgPicker.type = 'color';
                bgPicker.style.display = 'none';
                bgPicker.value = '#FF0000';
                document.body.appendChild(bgPicker);
                bgPicker.addEventListener('change', function() {
                    editor.format('background', bgPicker.value);
                }, false);
            }
            bgPicker.click();
        }
        else {
            editor.format('color', value);
        }
    }

    var toolbar = editor.getModule('toolbar');
    toolbar.addHandler('color', showColorPicker);
    toolbar.addHandler('background', showColorPicker);

    // Sidebar
    var sidebar = document.getElementById('sidebar');

    var upperFolder = document.createElement('span');
    upperFolder.innerText = "Subir pasta";
    upperFolder.addEventListener('click', () => {
        if(path.resolve(process.cwd(), '..') !== process.cwd()) {
            fatherNode = readUpperDirectory(path.resolve(process.cwd(), '..'), process.cwd(), fatherNode);
        }
    });
    sidebar.appendChild(upperFolder);

    var fatherNode = document.createElement('ul');
    fatherNode.setAttribute('id', 'fatherNode');
    sidebar.appendChild(fatherNode);

    readDirectory(process.cwd(), fatherNode);
});