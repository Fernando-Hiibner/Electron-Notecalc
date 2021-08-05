const path = require('path');
const fs = require('fs');

function recursiveAsyncReadDir(directory, done) {
    var folders = [];
    var files = [];
    fs.readdir(directory, function (err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, folders, files);
            file = path.resolve(directory, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) folders.push(file);
                else files.push(file);
                next();
            });
        })();
    });
}

function recursiveDepthCalc(el, sum) {
    if (el.parentElement.id === 'fatherNode') {
        return sum+1;
    }
    else if (el.tagName !== 'UL') {
        return recursiveDepthCalc(el.parentElement, sum);
    }
    else {
        return recursiveDepthCalc(el.parentElement, sum + 1);
    }
}

function readDirectory(directory, node, openFolders = []) {
    // Create a new UL if node !== 'fatherNode' (node === Sub-directory)
    if (node.id !== 'fatherNode') {
        var nestedUL = document.createElement('ul');
        nestedUL.setAttribute('class', 'nested');
        node.appendChild(nestedUL);
    }
    else {
        nestedUL = node;
    }

    // Async read the directory and create the folders and files in the sidebar
    recursiveAsyncReadDir(directory, (err, folders, files) => {
        if (folders) {
            folders.forEach((folder) => {
                // Create the folders
                let folderLI = document.createElement('li');
                let folderSPAN = document.createElement('span');
                folderSPAN.setAttribute('class', 'folder');
                folderSPAN.id = String(folder)
                folderSPAN.innerText = path.basename(folder);
                folderLI.appendChild(folderSPAN);
                nestedUL.appendChild(folderLI);
                // Calculates how depth the node is, in order to give him correct padding
                depth = recursiveDepthCalc(folderLI, 0);
                folderSPAN.style.paddingLeft = `${depth * 0.5}cm`
                // Folder click event
                folderSPAN.addEventListener('click', () => {
                    // Check if this folder is already loaded, if not, load it
                    if (!folderSPAN.parentElement.querySelector(".nested")) {
                        readDirectory(path.join(directory, path.basename(folder)), folderLI);
                    }
                    folderSPAN.parentElement.querySelector(".nested").classList.toggle("active");
                    folderSPAN.classList.toggle("folder-down");

                    if(document.getElementsByClassName('selected')[0] !== undefined) {
                        document.getElementsByClassName('selected')[0].classList.toggle('selected');
                    }
                    folderSPAN.classList.toggle('selected');
                });
                if(openFolders.includes(folderSPAN.id)) {
                    // Check if this folder is already loaded, if not, load it
                    if (!folderSPAN.parentElement.querySelector(".nested")) {
                        readDirectory(path.join(directory, path.basename(folder)), folderLI, openFolders);
                    }
                    folderSPAN.parentElement.querySelector(".nested").classList.toggle("active");
                    folderSPAN.classList.toggle("folder-down");
                };
            });
        }
        if (files) {
            files.forEach((file) => {
                // Create the files
                let fileLI = document.createElement('li');
                let fileSPAN = document.createElement('span');
                fileSPAN.setAttribute('class', 'file');
                fileSPAN.id = String(file)
                fileSPAN.innerText = path.basename(file);
                fileLI.appendChild(fileSPAN);
                nestedUL.appendChild(fileLI);
                // Calculates how depth the node is, in order to give him correct padding
                depth = recursiveDepthCalc(fileLI, 0);
                fileSPAN.style.paddingLeft = `${depth * 0.5}cm`;
                fileSPAN.addEventListener('click', () => {
                    if(document.getElementsByClassName('selected')[0]  !== undefined) {
                        document.getElementsByClassName('selected')[0].classList.toggle('selected');
                    }
                    fileSPAN.classList.toggle('selected');
                })
            });
        }
    });
    return nestedUL;
}

function readUpperDirectory(upperDirectory, currentDirectory, fatherNode, folderNameText) {
    let currentFolderName = path.basename(currentDirectory);
    let newFatherNode = document.createElement('ul');
    newFatherNode.setAttribute('id', 'fatherNode');
    sidebar.appendChild(newFatherNode);

    recursiveAsyncReadDir(upperDirectory, (err, folders, files) => {
        if (folders) {
            folders.forEach((folder) => {
                let folderLI = document.createElement('li');
                let folderSPAN = document.createElement('span');
                folderSPAN.setAttribute('class', 'folder');
                folderSPAN.id = String(folder)
                folderSPAN.innerText = path.basename(folder);
                folderLI.appendChild(folderSPAN);
                // Check if the folder it is reading is the current folder we are, if it is, loads and childs the current nodes to the new father
                if (path.basename(folder) === currentFolderName) {
                    fatherNode.removeAttribute('id');
                    fatherNode.setAttribute('class', 'nested');
                    folderLI.appendChild(fatherNode);
                    newFatherNode.appendChild(folderLI);
                    let subLi = fatherNode.getElementsByTagName('LI')
                    for (let i = 0; i < subLi.length ; i++) {
                        let el = subLi[i];
                        let subDepth = recursiveDepthCalc(el, 0);
                        let elSpans =  el.getElementsByTagName('SPAN');
                        for (let z = 0; z < elSpans.length; z++) {
                            elSpans[z].style.paddingLeft = `${subDepth * 0.5}cm`;
                        }
                    }
                    fatherNode.classList.toggle('active');
                    folderSPAN.classList.toggle('folder-down');
                }
                else {
                    newFatherNode.appendChild(folderLI);
                }
                depth = recursiveDepthCalc(folderLI, 0);
                folderSPAN.style.paddingLeft = `${depth * 0.5}cm`
                folderSPAN.addEventListener('click', () => {
                    if (!folderSPAN.parentElement.querySelector(".nested")) {
                        readDirectory(path.join(upperDirectory, path.basename(folder)), folderLI);
                    }
                    folderSPAN.parentElement.querySelector(".nested").classList.toggle("active");
                    if (folderSPAN.classList[0] !== "folder-down") {
                        folderSPAN.classList.toggle("folder-down");
                    }

                    if(document.getElementsByClassName('selected')[0]  !== undefined) {
                        document.getElementsByClassName('selected')[0].classList.toggle('selected');
                    }
                    folderSPAN.classList.toggle('selected');
                });
            });
        }
        if (files) {
            files.forEach((file) => {
                let fileLI = document.createElement('li');
                let fileSPAN = document.createElement('span');
                fileSPAN.setAttribute('class', 'file');
                fileSPAN.id = String(file)
                fileSPAN.innerText = path.basename(file);
                fileLI.appendChild(fileSPAN);
                newFatherNode.appendChild(fileLI);
                depth = recursiveDepthCalc(fileLI, 0);
                fileSPAN.style.paddingLeft = `${depth * 0.5}cm`;
                fileSPAN.addEventListener('click', () => {
                    if(document.getElementsByClassName('selected')[0] !== undefined) {
                        document.getElementsByClassName('selected')[0].classList.toggle('selected');
                    }
                    fileSPAN.classList.toggle('selected');
                });
            });
        }
    });
    process.chdir(upperDirectory);
    folderNameText.innerText = path.basename(process.cwd()).toUpperCase();
    return newFatherNode;
}

function refreshDirectory(directory, node) {
    let childs = node.getElementsByTagName('UL');
    let openFolders = [];
    for (let i = 0; i < childs.length; i++) {
        if (childs[i].classList.contains('active')) {
            openFolders.push(childs[i].parentElement.firstChild.id);
        }
    }
    for(let i = 0; i < childs.length; i++) {
        if (childs[i].tagName === 'UL') {
            childs[i].parentElement.removeChild(childs[i])
        }
    }
    let newUl = readDirectory(directory, node, openFolders);
    if(newUl.id === 'fatherNode') {
        while(newUl.firstChild) {
            node.appendChild(newUl.firstChild);
            newUl.removeChild(newUl.firstChild);
        }
    }
    else {
        newUl.classList.toggle('active');
        node.appendChild(newUl);
    }
}

module.exports = {readDirectory, readUpperDirectory, refreshDirectory};