const {ipcRenderer} = require('electron');
const Sidebar = require('sidebar');
const fs = require('fs');

//Quill things
const {toolbarOptions, showColorPicker} = require('quill-increment');
const ImageEdit  = require('quill-image-edit-module');
const highlight = require('highlight.js');
const Quill = require('quill');
const { type } = require('os');
var Delta = Quill.import('delta');

Quill.register('modules/imageEdit', ImageEdit);

class App extends Sidebar {
    constructor() {
        // Local CWD that will hold only the parent directorys
        let stat = fs.lstatSync(process.cwd());
        let processCWD = undefined;
        let currentWorkingFile = undefined;
        if(stat.isDirectory()) {
            processCWD = process.cwd();
            currentWorkingFile = undefined;
        }
        else if(stat.isFile()) {
            processCWD = path.dirname(process.cwd());
            currentWorkingFile = process.cwd();
        }

        // Initializing the sidebar
        super(document.getElementsByClassName('parent-container')[0], processCWD, currentWorkingFile, true);

        // Initializing the quill editor
        this.quillInit();

        window.addEventListener('keyup', (event) => {
            if(event.ctrlKey && !event.shiftKey && (event.key === 'S' || event.key === 's') && this.currentWorkingFile !== undefined) {
                fs.writeFileSync(this.currentWorkingFile, this.editor.root.innerHTML);
            }
            else if(event.ctrlKey && !event.shiftKey && (event.key === 'S' || event.key === 's') && this.currentWorkingFile === undefined) {
                ipcRenderer.invoke('showDialog', 'save', {properties: ['openFile', 'multiSelections']}).then((path) => {
                    fs.writeFileSync(path.filePath, this.editor.root.innerHTML);
                    this.currentWorkingFile = path.filePath;
                })
            }
            if(event.ctrlKey && event.shiftKey && (event.key === 'S' || event.key === 's')) {
                ipcRenderer.invoke('showDialog', 'save', {properties: ['openFile', 'multiSelections']}).then((path) => {
                    fs.writeFileSync(path.filePath, this.editor.root.innerHTML);
                    this.currentWorkingFile = path.filePath;
                })
            }

        });
        window.addEventListener('fileClicked', (event) => {
            //this.editor.root.innerHTML = fs.readFileSync(event.detail.filePath);
            let fileExtension = this.getExtension(event.detail.filePath);
            //FIXME ta lendo e travando ironicamente (Deveria ser assincrono, deve estar travando essa atribuição direta ao inner html)
            fs.readFile(event.detail.filePath, (err, data) => {
                if(err) throw err;
                //Isso é um buffer, converter ele direito pra string e tudo mais
                if(fileExtension !== 'html') {
                    this.editor.innerHTML = String(data);
                }
                else {
                    this.editor.insertText(0, String(data), 'api');
                }
            })
        });
    }

    quillInit() {
        this.editor = new Quill('.editor', {
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
        this.editor.on('text-change', (delta) => {
            changes = changes.compose(delta);
        });

        let toolbar = this.editor.getModule('toolbar');
        toolbar.addHandler('color', (value) => {showColorPicker(value, this.editor)});
        toolbar.addHandler('background', (value) => {showColorPicker(value, this.editor)});
    }
}

module.exports = App