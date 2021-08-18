const path = require('path');
const fs = require('fs');

class SidebarCore {
    dispatchFileClickEvent(caller, data) {
        caller.dispatchEvent(
            new CustomEvent('fileClicked', {detail: data
                                            ,bubbles: true
                                            ,cancelable: true
                                            ,composed: false})
        )
    }
    recursiveAsyncReadDir(directory, done) {
        let folders = [];
        let files = [];
        fs.readdir(directory, function (err, list) {
            if (err) return done(err);
            let i = 0;
            (function next() {
                let file = list[i++];
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

    recursiveDepthCalc(el, sum) {
        if (el.parentElement.id === 'fatherNode') {
            return sum+1;
        }
        else if (el.tagName !== 'UL') {
            return this.recursiveDepthCalc(el.parentElement, sum);
        }
        else {
            return this.recursiveDepthCalc(el.parentElement, sum + 1);
        }
    }

    getElOffset(el) {
        const rect = el.getBoundingClientRect();
        return {
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY
        };
    }

    getExtension(path) {
        let basename = path.split(/[\\/]/).pop()
           ,pos = basename.lastIndexOf(".");

        if (basename === "" || pos < 1) return "";

        return basename.slice(pos + 1);
    }
}
class Sidebar extends SidebarCore {
    constructor(parentNode, paned = false, hotkeys = true) {
        //Instantiate the super class
        super();
        // Creating the sidebar div in the DOM
        this.sidebar = document.createElement('div');
        this.sidebar.setAttribute('class', 'sidebar');
        this.sidebar.setAttribute('id', 'sidebar');
        this.sidebar.setAttribute('tabindex', '-1');
        parentNode.insertBefore(this.sidebar, parentNode.firstChild);

        // Creating the father node
        this.fatherNode = document.createElement('ul');
        this.fatherNode.setAttribute('id', 'fatherNode');

        // Creating the sidebarHeaderDiv and its buttons
        this.sidebarHeaderDiv = document.createElement('div');
        this.sidebarHeaderDiv.setAttribute('id', 'sidebarHeaderDiv');

        // Upper Folder Button
        this.upperFolderButton = document.createElement('button');
        this.upperFolderButton.setAttribute('class', 'sidebarHeaderButtons');
        this.upperFolderButton.setAttribute('id', 'upperFolderButton');
        this.upperFolderButton.addEventListener('click', () => {
            if (path.resolve(process.cwd(), '..') !== process.cwd()) {
                this.readUpperDirectory();
            }
        });

        // Current Folder Name
        this.currentFolderName = document.createElement('strong');
        this.currentFolderName.setAttribute('id', 'currentFolderName');

        // Div that will hold the sidebar buttons inside the main div
        this.sidebarHeaderButtonsDiv = document.createElement('div');
        this.sidebarHeaderButtonsDiv.setAttribute('id', 'sidebarHeaderButtonsDiv');

        // New file button
        this.newFileButton = document.createElement('button');
        this.newFileButton.setAttribute('class', 'sidebarHeaderButtons');
        this.newFileButton.setAttribute('id', 'newFileButton');
        this.newFileButton.addEventListener('click', () => {
            this.newFileButtonClickCallback();
        });

        // New folder button
        this.newFolderButton = document.createElement('button');
        this.newFolderButton.setAttribute('class', 'sidebarHeaderButtons');
        this.newFolderButton.setAttribute('id', 'newFolderButton');
        this.newFolderButton.addEventListener('click', () => {
            this.newFolderButtonClickCallback();
        });

        // Collapse Button
        this.collapseButton = document.createElement('button');
        this.collapseButton.setAttribute('class', 'sidebarHeaderButtons');
        this.collapseButton.setAttribute('id', 'collapseButton');
        this.collapseButton.addEventListener('click', () => {
            this.collapseButtonClickCallback();
        });

        // Refresh button
        this.refreshButton = document.createElement('button');
        this.refreshButton.setAttribute('class', 'sidebarHeaderButtons');
        this.refreshButton.setAttribute('id', 'refreshButton');
        this.refreshButton.addEventListener('click', () => {
            this.refreshDirectory(process.cwd(), this.fatherNode);
        });

        this.sidebarHeaderButtonsDiv.appendChild(this.newFileButton);
        this.sidebarHeaderButtonsDiv.appendChild(this.newFolderButton);
        this.sidebarHeaderButtonsDiv.appendChild(this.refreshButton);
        this.sidebarHeaderButtonsDiv.appendChild(this.collapseButton);

        this.sidebarHeaderDiv.appendChild(this.upperFolderButton);
        this.sidebarHeaderDiv.appendChild(this.currentFolderName);
        this.sidebarHeaderDiv.appendChild(this.sidebarHeaderButtonsDiv);
        this.sliceMainFolderName(10, this.currentFolderName);

        this.sidebar.appendChild(this.sidebarHeaderDiv);
        this.sidebar.appendChild(this.fatherNode);

        this.readDirectory(process.cwd(), this.fatherNode);

        // List that holds the selections made in the sidebar in order
        this.selectionList = [];

        // Adding the focusout event listener to the window, so the selection gets cleared when clicking outside the bar
        window.addEventListener('click', (event) => {
            if(!this.sidebar.contains(event.target) || event.target === this.sidebar) {
                while(this.selectionList.length > 0) {
                    document.getElementById(this.selectionList.pop()).classList.remove('selected');
                }
            }
        });

        window.addEventListener('keyup', (event) => {
            if(event.key === 'Escape') {
                while(this.selectionList.length > 0) {
                    document.getElementById(this.selectionList.pop()).classList.remove('selected');
                }
            }
        });

        this.mainCSSLink = document.createElement('link');
        this.mainCSSLink.setAttribute('href', path.join(__dirname, 'src/css/sidebar.css'));
        this.mainCSSLink.setAttribute('rel', 'stylesheet');

        this.iconCSSLink = document.createElement('link');
        this.iconCSSLink.setAttribute('href', path.join(__dirname, 'src/css/fileIcons.css'));
        this.iconCSSLink.setAttribute('rel', 'stylesheet');

        document.getElementsByTagName('HEAD')[0].appendChild(this.mainCSSLink);
        document.getElementsByTagName('HEAD')[0].appendChild(this.iconCSSLink);
        if(paned) {
            this.panedHandle = document.createElement('div');
            this.panedHandle.setAttribute('class', 'resize-handle');
            this.panedHandle.setAttribute('id', 'handle');

            parentNode.insertBefore(this.panedHandle, this.sidebar.nextSibling);

            this.panedJSScript = document.createElement('script');
            this.panedJSScript.setAttribute('src', path.join(__dirname, "src/script/paned.js"));
            this.panedJSScript.setAttribute('type', "text/javascript");

            document.getElementsByTagName('BODY')[0].appendChild(this.panedJSScript);
        }

        if(hotkeys) {
            this.hotkeysJSScript = document.createElement('script');
            this.hotkeysJSScript.setAttribute('src', path.join(__dirname, "src/script/hotkeys.js"));
            this.hotkeysJSScript.setAttribute('type', "text/javascript");

            document.getElementsByTagName('BODY')[0].appendChild(this.hotkeysJSScript);

            this.sidebar.addEventListener('keyup', (event) => {
                if(event.key === 'F2') {
                    this.renameCallback();
                }
                else if(event.key === 'Delete') {
                    this.deleteCallback();
                }
                else if(event.key === 'F5') {
                    this.refreshDirectory(process.cwd(), this.fatherNode);
                }
                else if(event.ctrlKey && event.key === 'n') {
                    this.newFileButtonClickCallback();
                }
                else if(event.ctrlKey && event.shiftKey && event.key === "O") {
                    this.newFolderButtonClickCallback();
                }
            });
        }
    }

    openFolderCallback(event, directory, folder, li, span) {
        if(!event.ctrlKey && !event.shiftKey) {
            if (!span.parentElement.querySelector(".nested")) {
                this.readDirectory(path.join(directory, path.basename(folder)), li);
            }
            span.parentElement.querySelector(".nested").classList.toggle("active");
            span.classList.toggle("folder-down");
        }
    }

    ctrlSelection(event) {
        if(document.getElementsByClassName('selected')[0] !== undefined && !event.ctrlKey && !event.shiftKey) {
            while(this.selectionList.length > 0) {
                document.getElementById(this.selectionList.pop()).classList.remove('selected');
            }
        }
    }

    shiftSelection(event, span) {
        if(this.selectionList[0] !== undefined && event.shiftKey) {
            let filesInSelectionRange = document.getElementsByTagName("SPAN");
            let firstSelectionIndex = undefined;
            let secondSelectionIndex = undefined;
            for(let i = 0; i < filesInSelectionRange.length; i++) {
                if(firstSelectionIndex !== undefined && secondSelectionIndex !== undefined) break;
                if(filesInSelectionRange[i].id === this.selectionList[0]) {
                    firstSelectionIndex = i;
                }
                else if(filesInSelectionRange[i].id === span.id) {
                    secondSelectionIndex = i;
                }
            }
            if(firstSelectionIndex < secondSelectionIndex) {
                for(let i = firstSelectionIndex; i < secondSelectionIndex; i++) {
                    if(!filesInSelectionRange[i].classList.contains('selected')) {
                        filesInSelectionRange[i].classList.toggle('selected');
                        this.selectionList.push(filesInSelectionRange[i].id);
                    }
                }
            }
            else {
                for(let i = firstSelectionIndex; i > secondSelectionIndex; i--) {
                    if(!filesInSelectionRange[i].classList.contains('selected')) {
                        filesInSelectionRange[i].classList.toggle('selected');
                        this.selectionList.push(filesInSelectionRange[i].id);
                    }
                }
            }
        }
    }

    readDirectory(directory, node, openFolders = []) {
        // Create a new UL if node !== 'fatherNode' (node === Sub-directory)
        let nestedUL = undefined;
        if (node.id !== 'fatherNode') {
            nestedUL = document.createElement('ul');
            nestedUL.setAttribute('class', 'nested');
            node.appendChild(nestedUL);
        }
        else {
            nestedUL = node;
        }

        // Async read the directory and create the folders and files in the sidebar
        this.recursiveAsyncReadDir(directory, (err, folders, files) => {
            if (folders) {
                folders.forEach((folderPath) => {
                    // Create the folders
                    let folderLI = document.createElement('li');
                    let folderSPAN = document.createElement('span');
                    folderSPAN.setAttribute('class', 'folder');
                    folderSPAN.id = String(folderPath)
                    folderSPAN.innerText = path.basename(folderPath);
                    folderLI.appendChild(folderSPAN);
                    nestedUL.appendChild(folderLI);
                    // Calculates how depth the node is, in order to give him correct padding
                    folderSPAN.style.paddingLeft = `${this.recursiveDepthCalc(folderLI, 0) * 0.5}cm`
                    // Folder click event
                    folderSPAN.addEventListener('click', (event) => {
                        // Check if this folder is already loaded, if not, load it
                        this.openFolderCallback(event, directory, folderPath, folderLI, folderSPAN);
                        this.ctrlSelection(event);
                        this.shiftSelection(event, folderSPAN);

                        folderSPAN.classList.toggle('selected');
                        this.selectionList.push(folderSPAN.id);
                    });
                    if(openFolders.includes(folderSPAN.id)) {
                        // Check if this folder is already loaded, if not, load it
                        if (!folderSPAN.parentElement.querySelector(".nested")) {
                            this.readDirectory(path.join(directory, path.basename(folderPath)), folderLI, openFolders);
                        }
                        folderSPAN.parentElement.querySelector(".nested").classList.toggle("active");
                        folderSPAN.classList.toggle("folder-down");
                    };
                    // Check if this folder is in selectionList
                    if(this.selectionList.includes(folderSPAN.id)) folderSPAN.classList.toggle('selected');
                });
            }
            if (files) {
                files.forEach((filePath) => {
                    // Create the files
                    let fileLI = document.createElement('li');
                    let fileSPAN = document.createElement('span');
                    let fileExtension = this.getExtension(filePath);
                    fileExtension !== "" ? fileExtension = fileExtension: fileExtension = "file";
                    fileSPAN.setAttribute('class', fileExtension);
                    fileSPAN.id = String(filePath);
                    fileSPAN.innerText = path.basename(filePath);
                    fileLI.appendChild(fileSPAN);
                    nestedUL.appendChild(fileLI);
                    // Calculates how depth the node is, in order to give him correct padding
                    fileSPAN.style.paddingLeft = `${this.recursiveDepthCalc(fileLI, 0) * 0.5}cm`;
                    fileSPAN.addEventListener('dblclick', () => {
                        this.dispatchFileClickEvent(fileSPAN, {filePath: fileSPAN.id});
                    });
                    fileSPAN.addEventListener('click', (event) => {
                        this.ctrlSelection(event);
                        this.shiftSelection(event, fileSPAN);

                        fileSPAN.classList.toggle('selected');
                        this.selectionList.push(fileSPAN.id);
                    });
                    // Check if this file is in selectionList
                    if(this.selectionList.includes(fileSPAN.id)) fileSPAN.classList.toggle('selected');
                });
            }
        });

        return nestedUL;
    }

    readUpperDirectory() {
        let upperDirectory = path.resolve(process.cwd(), '..');
        let currentFolderName = path.basename(process.cwd());

        // Creating the new father node that will take the place of the older
        let newFatherNode = document.createElement('ul');
        newFatherNode.setAttribute('id', 'fatherNode');
        this.sidebar.appendChild(newFatherNode);

        this.recursiveAsyncReadDir(upperDirectory, (err, folders, files) => {
            if (folders) {
                folders.forEach((folderPath) => {
                    let folderLI = document.createElement('li');
                    let folderSPAN = document.createElement('span');
                    folderSPAN.setAttribute('class', 'folder');
                    folderSPAN.id = String(folderPath)
                    folderSPAN.innerText = path.basename(folderPath);
                    folderLI.appendChild(folderSPAN);
                    // Check if the folder it is reading is the current folder we are, if it is, loads and childs the current nodes to the new father
                    if (path.basename(folderPath) === currentFolderName) {
                        this.fatherNode.removeAttribute('id');
                        this.fatherNode.setAttribute('class', 'nested');
                        folderLI.appendChild(this.fatherNode);
                        newFatherNode.appendChild(folderLI);
                        let subLi = this.fatherNode.getElementsByTagName('LI');
                        for (let i = 0; i < subLi.length ; i++) {
                            let el = subLi[i];
                            let elSpans =  el.getElementsByTagName('SPAN');
                            for (let z = 0; z < elSpans.length; z++) {
                                elSpans[z].style.paddingLeft = `${this.recursiveDepthCalc(el, 0) * 0.5}cm`;
                            }
                        }
                        this.fatherNode.classList.toggle('active');
                        this.fatherNode = newFatherNode;

                        folderSPAN.classList.toggle('folder-down');
                    }
                    else {
                        newFatherNode.appendChild(folderLI);
                    }
                    folderSPAN.style.paddingLeft = `${this.recursiveDepthCalc(folderLI, 0) * 0.5}cm`
                    folderSPAN.addEventListener('click', (event) => {
                        // Check if this folder is already loaded, if not, load it
                        this.openFolderCallback(event, upperDirectory, folderPath, folderLI, folderSPAN);
                        this.ctrlSelection(event);
                        this.shiftSelection(event, folderSPAN);

                        folderSPAN.classList.toggle('selected');
                        this.selectionList.push(folderSPAN.id);
                    });
                });
            }
            if (files) {
                files.forEach((filePath) => {
                    let fileLI = document.createElement('li');
                    let fileSPAN = document.createElement('span');
                    let fileExtension = this.getExtension(filePath);
                    fileExtension !== "" ? fileExtension = fileExtension: fileExtension = "file";
                    fileSPAN.setAttribute('class', fileExtension);
                    fileSPAN.id = String(filePath)
                    fileSPAN.innerText = path.basename(filePath);
                    fileLI.appendChild(fileSPAN);
                    newFatherNode.appendChild(fileLI);
                    fileSPAN.style.paddingLeft = `${this.recursiveDepthCalc(fileLI, 0) * 0.5}cm`;
                    fileSPAN.addEventListener('dblclick', () => {
                        this.dispatchFileClickEvent(fileSPAN, {filePath: fileSPAN.id});
                    });
                    fileSPAN.addEventListener('click', (event) => {
                        this.ctrlSelection(event);
                        this.shiftSelection(event, fileSPAN);

                        fileSPAN.classList.toggle('selected');
                        this.selectionList.push(fileSPAN.id);
                    });
                });
            }
        });

        // Calculating the new folder name
        process.chdir(upperDirectory);
        if(path.basename(process.cwd()).length <= 10) {
            this.currentFolderName.innerText = path.basename(process.cwd()).toUpperCase();
        }
        else {
            this.currentFolderName.innerText = path.basename(process.cwd()).toUpperCase().slice(0, this.sliceIndexFunc(sidebar.getBoundingClientRect().width)) + "...";
        }
    }

    refreshDirectory(directory, node) {
        // Cleans the selection, because i tought it would be convenient
        while(this.selectionList.length > 0) {
            try {document.getElementById(this.selectionList.pop()).classList.remove('selected');} catch(err) {alert(err);}
        }

        let childs = node.getElementsByTagName('UL');
        let openFolders = [];
        for (let i = 0; i < childs.length; i++) {
            if (childs[i].classList.contains('active')) {
                openFolders.push(childs[i].parentElement.firstChild.id);
            }
        }
        for(let i = 0; i < childs.length; i++) {
            if (childs[i].tagName === 'UL') {
                childs[i].parentElement.removeChild(childs[i]);
            }
        }
        let newUl = this.readDirectory(directory, node, openFolders);
        if(newUl.id === 'fatherNode') {
            while(node.firstChild) {
                node.removeChild(node.firstChild);
            }
            node.remove();
            node = newUl;
            this.sidebar.appendChild(node);
        }
        else {
            newUl.classList.toggle('active');
            node.appendChild(newUl);
        }
    }

    nameInputFunc(node, margin, writeFunction) {
        let nameInput = document.createElement('input');
        nameInput.setAttribute('type', 'text');
        node.appendChild(nameInput);
        nameInput.style.marginLeft = margin;
        nameInput.style.width = `calc(100% - ${margin})`;
        let offsetTop = this.getElOffset(nameInput).top;
        nameInput.focus({
            preventScroll: true
        });
        this.sidebar.scrollTo(0, offsetTop);
        nameInput.addEventListener('focusout', () => {
            try {nameInput.remove()} catch(err) {console.log(err)};
        });
        nameInput.addEventListener('keydown', (event) => {
            if(event.key === 'Enter') {
                if(nameInput.value === "") {
                    alert("Insira um nome!");
                    return;
                }
                writeFunction(nameInput);
            }
            else if(event.key === 'Escape') {
                try {nameInput.remove()} catch(err) {console.log(err)};
                return;
            }
        })
    }

    renameInputFunc(node, margin) {
        let renameInput = document.createElement('input');
        renameInput.setAttribute('type', 'text');
        renameInput.value = node.innerText;
        renameInput.setSelectionRange(0, node.innerText.indexOf('.'));
        node.parentElement.insertBefore(renameInput, node);
        node.style.display = 'none';
        renameInput.style.width = `calc(100% - ${margin})`;
        renameInput.style.marginLeft = margin;
        let offsetTop = this.getElOffset(renameInput).top;
        renameInput.focus({
            preventScroll: true
        });
        this.sidebar.scrollTo(0, offsetTop);
        renameInput.addEventListener('focusout', () => {
            try {renameInput.remove()} catch(err) {console.log(err)};
            node.style.display = 'inline-block'
        });
        renameInput.addEventListener('keydown', (event) => {
            if(event.key === 'Enter') {
                if(renameInput.value === "") {
                    alert("Insira um nome!");
                    return;
                }
                let newName = path.join(path.resolve(node.id, ".."), renameInput.value);
                fs.rename(node.id, newName, (err) => {
                    if(err) {
                        try {renameInput.remove()} catch(err) {console.log(err)};
                    }
                    else {
                        try {renameInput.remove()} catch(err) {console.log(err)};
                        this.selectionList[this.selectionList.length - 1] = newName;
                        node.setAttribute('id', newName);
                        this.refreshDirectory(process.cwd(), this.fatherNode);
                    }
                });
            }
            else if(event.key === 'Escape') {
                try {renameInput.remove()} catch(err) {console.log(err)};
                node.style.display = 'inline-block'
                return;
            }
        })
    }

    newFileButtonClickCallback() {
        if(document.getElementsByClassName('selected')[0]  !== undefined) {
            let el = document.getElementById(this.selectionList[this.selectionList.length - 1]);
            fs.lstat(el.id, (err, stat) => {
                if(err) throw err;
                if(stat && stat.isDirectory()) {
                    this.nameInputFunc(el.parentElement, `calc(${el.style.paddingLeft} + 0.5cm)`, (nameInput) => {
                        fs.writeFile(path.join(el.id, nameInput.value), "", (err) => {
                            if(err) {
                                try {nameInput.remove()} catch(err) {console.log(err)};
                            }
                            else {
                                try {nameInput.remove()} catch(err) {console.log(err)};
                                this.refreshDirectory(el.id, el.parentElement);
                            }
                        });
                    });
                }
                else if(stat && stat.isFile()) {
                    let elFolder = document.getElementById(path.dirname(el.id));
                    let anchorNode = null;
                    if(elFolder === null) {
                        anchorNode = this.fatherNode;
                    }
                    else {
                        anchorNode = elFolder.parentElement;
                    }
                    this.nameInputFunc(anchorNode, el.style.paddingLeft, (nameInput) => {
                        fs.writeFile(path.join(path.dirname(el.id), nameInput.value), "", (err) => {
                            if(err) {
                                alert(err);
                                try {nameInput.remove()} catch(err) {console.log(err)};
                            }
                            else {
                                try {nameInput.remove()} catch(err) {console.log(err)};
                                this.refreshDirectory(path.dirname(el.id), anchorNode)
                            }
                        });
                    })
                }
            })
        }
        else {
            this.nameInputFunc(this.fatherNode, '0.5cm', (nameInput) => {
                fs.writeFile(path.join(process.cwd(), nameInput.value), "", (err) => {
                    if(err) {
                        alert(err);
                        try {nameInput.remove()} catch(err) {console.log(err)};
                    }
                    else {
                        try {nameInput.remove()} catch(err) {console.log(err)};
                        this.refreshDirectory(process.cwd(), this.fatherNode);
                    }
                })
            })
        }
        while(this.selectionList.length > 0) {
            document.getElementById(this.selectionList.pop()).classList.remove('selected');
        }
    }

    newFolderButtonClickCallback() {
        if(this.selectionList[0]  !== undefined) {
            let el = document.getElementById(this.selectionList[this.selectionList.length - 1]);
            fs.lstat(el.id, (err, stat) => {
                if(err) throw err;
                if(stat && stat.isDirectory()) {
                    this.nameInputFunc(el.parentElement, `calc(${el.style.paddingLeft} + 0.5cm)`, (nameInput) => {
                        fs.mkdir(path.join(el.id, nameInput.value), (err) => {
                            if(err) {
                                alert(err);
                                try {nameInput.remove()} catch(err) {console.log(err)};
                            }
                            else {
                                try {nameInput.remove()} catch(err) {console.log(err)};
                                this.refreshDirectory(el.id, el.parentElement);
                            }
                        });
                    })
                }
                else if(stat && stat.isFile()) {
                    let elFolder = document.getElementById(path.dirname(el.id));
                    let anchorNode = null;
                    if(elFolder === null) {
                        anchorNode = this.fatherNode;
                    }
                    else {
                        anchorNode = elFolder.parentElement;
                    }
                    this.nameInputFunc(anchorNode, el.style.paddingLeft, (nameInput) => {
                        fs.mkdir(path.join(path.dirname(el.id), nameInput.value), (err) => {
                            if(err) {
                                alert(err);
                                try {nameInput.remove()} catch(err) {console.log(err)};
                            }
                            else {
                                try {nameInput.remove()} catch(err) {console.log(err)};
                                this.refreshDirectory(path.dirname(el.id), anchorNode);
                            }
                        });
                    })
                }
            })
        }
        else {
            this.nameInputFunc(this.fatherNode, '0.5cm', (nameInput) => {
                fs.mkdir(path.join(process.cwd(), nameInput.value), (err) => {
                    if (err) {
                        alert(err);
                        try {nameInput.remove()} catch(err) {console.log(err)};
                    }
                    else {
                        try {nameInput.remove()} catch(err) {console.log(err)};
                        this.refreshDirectory(process.cwd(), this.fatherNode);
                    }
                });
            })
        }
        while(this.selectionList.length > 0) {
            document.getElementById(this.selectionList.pop()).classList.remove('selected');
        }
    }

    deleteCallback() {
        if(this.selectionList[0]  !== undefined) {
            while(this.selectionList.length > 0) {
                fs.rm(this.selectionList.pop(), {recursive: true, force: true}, () => {});
            }
            this.refreshDirectory(process.cwd(), this.fatherNode);
        }
    }

    renameCallback() {
        if(this.selectionList[0] === undefined) return;
        let el = document.getElementById(this.selectionList[this.selectionList.length - 1]);
        this.renameInputFunc(el, el.style.paddingLeft);
    }

    collapseButtonClickCallback() {
        let activeSpans = document.getElementsByClassName('folder-down');
        while(activeSpans.length > 0) {
            activeSpans[0].classList.remove('folder-down');
        }
        let openNests = document.getElementsByClassName('nested active');
        while(openNests.length > 0) {
            openNests[0].classList.remove('active');
        }
        while(this.selectionList.length > 0) {
            document.getElementById(this.selectionList.pop()).classList.remove('selected');
        }
    }

    //TODO Mandar essa formula pro context bridge e adaptar isso no renderer tambem (formula do sliceMainFolderName)
    sliceIndexFunc(px) {
        return Math.floor((px-40)/14)-3;
    }

    sliceMainFolderName(sliceIndex, currentFolderName) {
        if(path.basename(process.cwd()).length <= 10 || path.basename(process.cwd()).length <= sliceIndex) {
            currentFolderName.innerText = path.basename(process.cwd()).toUpperCase();
        }
        else {
            if(sliceIndex < 8) {
                sliceIndex = 8;
            }
            if(path.basename(process.cwd())[sliceIndex-1] === ' ') sliceIndex -= 1;
            currentFolderName.innerText = path.basename(process.cwd()).toUpperCase().slice(0, sliceIndex) + "...";
        }
    }
}





module.exports = Sidebar;