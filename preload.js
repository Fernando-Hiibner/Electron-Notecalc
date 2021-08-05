const {readDirectory, readUpperDirectory, refreshDirectory} = require('sidebar');
const {toolbarOptions, showColorPicker} = require('quill-increment');
const highlight = require('highlight.js');
const {contextBridge} = require('electron');
const Quill = require('quill');
const path = require('path');
const del = require('del');
const fs = require('fs');


function sliceMainFolderName(sliceIndex, currentFolderName) {
    if(path.basename(process.cwd()).length < sliceIndex || path.basename(process.cwd()).length === sliceIndex) {
        currentFolderName.innerText = path.basename(process.cwd()).toUpperCase();
    }
    else {
        if(sliceIndex < 10) {
            sliceIndex = 10;
        }
        currentFolderName.innerText = path.basename(process.cwd()).toUpperCase().slice(0, sliceIndex) + "...";
    }
}

contextBridge.exposeInMainWorld('bridge', {
    sliceMainFolderName: (sliceIndex, currentFolderName) => {
        sliceMainFolderName(sliceIndex, currentFolderName);
    }
});

window.addEventListener('DOMContentLoaded', () => {
    // Change cwd to test folder
    process.chdir('C:\\Users\\fernandoaffonso\\Desktop\\Pessoal\\Estudos\\Javascript\\Electron 2 Test Folder');
    // Create quill
    let editor = new Quill('.editor', {
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

    let toolbar = editor.getModule('toolbar');
    toolbar.addHandler('color', (value) => {showColorPicker(value, editor)});
    toolbar.addHandler('background', (value) => {showColorPicker(value, editor)});

    // Sidebar
    let sidebar = document.getElementById('sidebar');

    // Upper Div
    let sidebarHeaderDiv = document.createElement('div')
       ,upperFolderButton = document.createElement('button')
       ,currentFolderName = document.createElement('strong');

    upperFolderButton.setAttribute('class', 'sidebarHeaderButtons');
    upperFolderButton.setAttribute('id', 'upperFolderButton');

    sidebarHeaderDiv.setAttribute('id', 'sidebarHeaderDiv');
    currentFolderName.setAttribute('id', 'currentFolderName');

    let sidebarHeaderButtonsDiv = document.createElement('div')
       ,newFileButton = document.createElement('button')
       ,newFolderButton = document.createElement('button')
       ,deleteButton = document.createElement('button');

    sidebarHeaderButtonsDiv.setAttribute('id', 'sidebarHeaderButtonsDiv');

    newFileButton.setAttribute('class', 'sidebarHeaderButtons');
    newFileButton.setAttribute('id', 'newFileButton');
    newFileButton.addEventListener('click', () => {
        if(document.getElementsByClassName('selected')[0]  !== undefined) {
            let el = document.getElementsByClassName('selected')[0]
            fs.lstat(el.id, (err, stat) => {
                if(err) throw err;
                if(stat && stat.isDirectory()) {
                    fs.writeFile(path.join(el.id, "Baozi.txt"), "OI!", (err) => {
                        if(err) console.log(err);
                        else {
                            refreshDirectory(el.id, el.parentElement);
                        }
                    });
                }
                else if(stat && stat.isFile()) {
                    fs.writeFile(path.join(path.dirname(el.id), "Baozi.txt"), "OI!", (err) => {
                        if(err) console.log(err);
                        else {
                            let elFolder = document.getElementById(path.dirname(el.id));
                            if(elFolder === null) {
                                refreshDirectory(path.dirname(el.id), fatherNode);
                            }
                            else {
                                refreshDirectory(path.dirname(el.id), elFolder.parentElement);
                            }
                        }
                    });
                }
            })
        }
        else {
            fs.writeFile(path.join(process.cwd(), "Baozi.txt"), "OI!", (err) => {
                if(err) console.log(err);
                else refreshDirectory(process.cwd(), fatherNode);
            })
        }
    })

    newFolderButton.setAttribute('class', 'sidebarHeaderButtons');
    newFolderButton.setAttribute('id', 'newFolderButton');
    newFolderButton.addEventListener('click', () => {
        if(document.getElementsByClassName('selected')[0]  !== undefined) {
            let el = document.getElementsByClassName('selected')[0]
            fs.lstat(el.id, (err, stat) => {
                if(err) throw err;
                if(stat && stat.isDirectory()) {
                    fs.mkdir(path.join(el.id, "Baozi"), (err) => {
                        if(err) console.log(err);
                        else {
                            refreshDirectory(el.id, el.parentElement);
                        }
                    });
                }
                else if(stat && stat.isFile()) {
                    fs.mkdir(path.join(path.dirname(el.id), "Baozi"), (err) => {
                        let elFolder = document.getElementById(path.dirname(el.id));
                        if(elFolder === null) {
                            refreshDirectory(path.dirname(el.id), fatherNode);
                        }
                        else {
                            refreshDirectory(path.dirname(el.id), elFolder.parentElement);
                        }
                    });
                }
            })
        }
        else {
            fs.mkdir(path.join(process.cwd(), "Baozi"), (err) => {
                if (err) console.log(err);
                else refreshDirectory(process.cwd(), fatherNode);
            });
        }
    })

    deleteButton.setAttribute('class', 'sidebarHeaderButtons');
    deleteButton.setAttribute('id', 'deleteButton');
    deleteButton.addEventListener('click', () => {
        if(document.getElementsByClassName('selected')[0]  !== undefined) {
            let el = document.getElementsByClassName('selected')[0];
            (async () => {
                try {
                    await del(el.id);
                }
                catch(err) {
                    console.log(err);
                }
            })();
            refreshDirectory(process.cwd(), fatherNode);
            console.log(fatherNode);
        }
        else {
            console.log("Hoje o deletar vai ser em número porque o arquivo não foi selecionado!")
        }
    })

    sidebarHeaderButtonsDiv.appendChild(newFileButton);
    sidebarHeaderButtonsDiv.appendChild(newFolderButton);
    sidebarHeaderButtonsDiv.appendChild(deleteButton);

    sidebarHeaderDiv.appendChild(upperFolderButton)
    sidebarHeaderDiv.appendChild(currentFolderName);
    sidebarHeaderDiv.appendChild(sidebarHeaderButtonsDiv);
    sliceMainFolderName(10, currentFolderName);

    let fatherNode = document.createElement('ul');
    fatherNode.setAttribute('id', 'fatherNode');

    upperFolderButton.addEventListener('click', () => {
        if (path.resolve(process.cwd(), '..') !== process.cwd()) {
            fatherNode = readUpperDirectory(path.resolve(process.cwd(), '..'), process.cwd(), fatherNode, currentFolderName);
        }
    });

    sidebar.appendChild(sidebarHeaderDiv);
    sidebar.appendChild(fatherNode);

    readDirectory(process.cwd(), fatherNode);
});