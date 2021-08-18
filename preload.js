const {toolbarOptions, showColorPicker} = require('quill-increment');
const {contextBridge} = require('electron');
const highlight = require('highlight.js');
const Sidebar = require('sidebar');

const fs = require('fs');

const Quill = require('quill');
const ImageEdit  = require('quill-image-edit-module');
Quill.register('modules/imageEdit', ImageEdit);

var Delta = Quill.import('delta');

const path = require('path');

window.addEventListener('DOMContentLoaded', () => {
    // Change cwd to test folder
    // process.chdir('C:\\Users\\fernandoaffonso\\Desktop\\Pessoal\\Estudos\\Javascript\\Electron 2 Test Folder');
    // Create quill
    let editor = new Quill('.editor', {
        theme: 'snow',
        modules: {
            imageEdit: {
                modules: ['Resize', 'DisplaySize', 'Toolbar', 'Delete'],
            },
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

    let changes = new Delta();
    editor.on('text-change', (delta) => {
        changes = changes.compose(delta);
    });

    let toolbar = editor.getModule('toolbar');
    toolbar.addHandler('color', (value) => {showColorPicker(value, editor)});
    toolbar.addHandler('background', (value) => {showColorPicker(value, editor)});

    process.chdir(path.join(__dirname, "1D - Test Directory"));

    let sidebar = new Sidebar(document.getElementsByClassName('parent-container')[0], true);
    contextBridge.exposeInMainWorld('bridge', {
        sliceMainFolderName: (sliceIndex, currentFolderName) => {
            sidebar.sliceMainFolderName(sliceIndex, currentFolderName);
        },
        sliceIndexFunc: (px) => {
            sidebar.sliceIndexFunc(px);
        }
    });
    contextBridge.exposeInMainWorld('debug', {
        debugSelectionList: () => {
            console.log("Whole list: ", sidebar.selectionList);
            console.log("First element: ", sidebar.selectionList[0]);
            console.log("Last element: ", sidebar.selectionList[sidebar.selectionList.length - 1]);
        }
    });

    window.addEventListener('keyup', (event) => {
        if(event.ctrlKey && event.key === 's') {
            //fs.writeFileSync('./teste.txt', JSON.stringify(editor.getContents()))
            fs.writeFileSync('./teste.html', editor.root.innerHTML);
        }
        if(event.ctrlKey && event.key === 't') {
            editor.root.innerHTML = fs.readFileSync('./teste.html');
        }
    });
    window.addEventListener('fileClicked', (event) => {
        editor.root.innerHTML = fs.readFileSync(event.detail.filePath);
    });
});