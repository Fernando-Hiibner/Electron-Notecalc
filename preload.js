const {readDirectory, readUpperDirectory, newFileButtonClickCallback, newFolderButtonClickCallback, deleteButtonClickCallback} = require('sidebar');
const {toolbarOptions, showColorPicker} = require('quill-increment');
const highlight = require('highlight.js');
const {contextBridge} = require('electron');
const Quill = require('quill');
const path = require('path');


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
    // process.chdir('C:\\Users\\fernandoaffonso\\Desktop\\Pessoal\\Estudos\\Javascript\\Electron 2 Test Folder');
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
        newFileButtonClickCallback(fatherNode);
    })

    newFolderButton.setAttribute('class', 'sidebarHeaderButtons');
    newFolderButton.setAttribute('id', 'newFolderButton');
    newFolderButton.addEventListener('click', () => {
        newFolderButtonClickCallback(fatherNode);
    })

    deleteButton.setAttribute('class', 'sidebarHeaderButtons');
    deleteButton.setAttribute('id', 'deleteButton');
    deleteButton.addEventListener('click', () => {
        deleteButtonClickCallback(fatherNode);
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