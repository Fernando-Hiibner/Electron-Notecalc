const {readDirectory, readUpperDirectory, newFileButtonClickCallback, newFolderButtonClickCallback, deleteButtonClickCallback, refreshDirectory} = require('sidebar');
const {toolbarOptions, showColorPicker} = require('quill-increment');
const highlight = require('highlight.js');
const {contextBridge} = require('electron');
const Quill = require('quill');
const path = require('path');


function sliceMainFolderName(sliceIndex, currentFolderName) {
    if(path.basename(process.cwd()).length <= 10 || path.basename(process.cwd()).length <= sliceIndex) {
        currentFolderName.innerText = path.basename(process.cwd()).toUpperCase();
    }
    else {
        if(sliceIndex < 8) {
            sliceIndex = 8;
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
       ,collapseButton = document.createElement('button')
       ,refreshButton = document.createElement('button');

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


    refreshButton.setAttribute('class', 'sidebarHeaderButtons');
    refreshButton.setAttribute('id', 'refreshButton');
    refreshButton.addEventListener('click', () => {
        refreshDirectory(process.cwd(), fatherNode);
    });

    collapseButton.setAttribute('class', 'sidebarHeaderButtons');
    collapseButton.setAttribute('id', 'collapseButton');
    collapseButton.addEventListener('click', () => {
        let activeSpans = document.getElementsByClassName('folder-down');
        while(activeSpans.length >= 1) {
            activeSpans[0].classList.remove('folder-down');
        }
        let openNests = document.getElementsByClassName('nested active');
        while(openNests.length >= 1) {
            openNests[0].classList.remove('active');
        }
    })

    sidebarHeaderButtonsDiv.appendChild(newFileButton);
    sidebarHeaderButtonsDiv.appendChild(newFolderButton);
    sidebarHeaderButtonsDiv.appendChild(refreshButton);
    sidebarHeaderButtonsDiv.appendChild(collapseButton);

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