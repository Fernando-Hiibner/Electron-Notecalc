const {app, globalShortcut} = require('electron');
const Quill = require('quill');
const path = require('path');
const fs = require('fs');
const { read } = require('original-fs');

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

    // Sidebar
    var sidebar = document.getElementById('sidebar');

    var fatherNode = document.createElement('ul');
    fatherNode.setAttribute('id', 'fatherNode');
    sidebar.appendChild(fatherNode);

    readDirectory(process.cwd(), fatherNode);
});