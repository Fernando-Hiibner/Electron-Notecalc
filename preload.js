const {toolbarOptions, showColorPicker} = require('quill-increment');
const {contextBridge} = require('electron');
const highlight = require('highlight.js');
const {Sidebar} = require('sidebar');
const Quill = require('quill');

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

    new Sidebar(document.getElementsByClassName('parent-container')[0], true);

    contextBridge.exposeInMainWorld('bridge', {
        sliceMainFolderName: (sliceIndex, currentFolderName) => {
            Sidebar.sliceMainFolderName(sliceIndex, currentFolderName);
        }
    });
});