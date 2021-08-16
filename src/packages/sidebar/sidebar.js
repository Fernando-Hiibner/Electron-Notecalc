const path = require('path');
const fs = require('fs');

class Sidebar {
    constructor(parentNode, paned = false) {
        // Creating the sidebar div in the DOM
        this.sidebar = document.createElement('div');
        this.sidebar.setAttribute('class', 'sidebar');
        this.sidebar.setAttribute('id', 'sidebar');
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
        Sidebar.sliceMainFolderName(10, this.currentFolderName);

        this.sidebar.appendChild(this.sidebarHeaderDiv);
        this.sidebar.appendChild(this.fatherNode);

        this.readDirectory(process.cwd(), this.fatherNode);

        // List that holds the selections made in the sidebar in order
        this.selectionList = [];

        // Adding the focusout event listener to the window, so the selection gets cleared when clicking outside the bar
        window.addEventListener('click', (event) => {
            if(!document.getElementById('sidebar').contains(event.target)) {
                let selections = document.getElementsByClassName('selected');
                while(selections.length >= 1) {
                    selections[0].classList.toggle('selected');
                }
                while(this.selectionList.length >= 1) {
                    this.selectionList.pop();
                }
            }
        });

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
                    folderSPAN.style.paddingLeft = `${this.recursiveDepthCalc(folderLI, 0) * 0.5}cm`
                    // Folder click event
                    folderSPAN.addEventListener('click', (event) => {
                        // Check if this folder is already loaded, if not, load it
                        if(!event.ctrlKey) {
                            if (!folderSPAN.parentElement.querySelector(".nested")) {
                                this.readDirectory(path.join(directory, path.basename(folder)), folderLI);
                            }
                            folderSPAN.parentElement.querySelector(".nested").classList.toggle("active");
                            folderSPAN.classList.toggle("folder-down");
                        }

                        if(document.getElementsByClassName('selected')[0] !== undefined && !event.ctrlKey) {
                            let selections = document.getElementsByClassName('selected')
                            while(selections.length >= 1) {
                                selections[0].classList.toggle('selected');
                            }
                            while(this.selectionList.length >= 1) {
                                this.selectionList.pop();
                            }
                        }
                        folderSPAN.classList.toggle('selected');
                        this.selectionList.push(folderSPAN.id);
                    });
                    if(openFolders.includes(folderSPAN.id)) {
                        // Check if this folder is already loaded, if not, load it
                        if (!folderSPAN.parentElement.querySelector(".nested")) {
                            this.readDirectory(path.join(directory, path.basename(folder)), folderLI, openFolders);
                        }
                        folderSPAN.parentElement.querySelector(".nested").classList.toggle("active");
                        folderSPAN.classList.toggle("folder-down");
                    };
                    if(this.selectionList.includes(folderSPAN.id)) {
                        folderSPAN.classList.toggle('selected');
                    };
                });
            }
            if (files) {
                files.forEach((file) => {
                    // Create the files
                    let fileLI = document.createElement('li');
                    let fileSPAN = document.createElement('span');
                    fileSPAN.setAttribute('class', 'file');
                    fileSPAN.id = String(file);
                    fileSPAN.innerText = path.basename(file);
                    fileLI.appendChild(fileSPAN);
                    nestedUL.appendChild(fileLI);
                    // Calculates how depth the node is, in order to give him correct padding
                    fileSPAN.style.paddingLeft = `${this.recursiveDepthCalc(fileLI, 0) * 0.5}cm`;
                    fileSPAN.addEventListener('click', (event) => {
                        if(document.getElementsByClassName('selected')[0]  !== undefined && !event.ctrlKey) {
                            let selections = document.getElementsByClassName('selected')
                            while(selections.length >= 1) {
                                selections[0].classList.toggle('selected');
                            }
                            while(this.selectionList.length >= 1) {
                                this.selectionList.pop();
                            }
                        }
                        fileSPAN.classList.toggle('selected');
                        this.selectionList.push(fileSPAN.id);
                    });
                    if(this.selectionList.includes(fileSPAN.id)) {
                        fileSPAN.classList.toggle('selected');
                    };
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
                folders.forEach((folder) => {
                    let folderLI = document.createElement('li');
                    let folderSPAN = document.createElement('span');
                    folderSPAN.setAttribute('class', 'folder');
                    folderSPAN.id = String(folder)
                    folderSPAN.innerText = path.basename(folder);
                    folderLI.appendChild(folderSPAN);
                    // Check if the folder it is reading is the current folder we are, if it is, loads and childs the current nodes to the new father
                    if (path.basename(folder) === currentFolderName) {
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
                        if(!event.ctrlKey) {
                            if (!folderSPAN.parentElement.querySelector(".nested")) {
                                this.readDirectory(path.join(upperDirectory, path.basename(folder)), folderLI);
                            }
                            folderSPAN.parentElement.querySelector(".nested").classList.toggle("active");
                            folderSPAN.classList.toggle("folder-down");
                        }

                        if(document.getElementsByClassName('selected')[0] !== undefined && !event.ctrlKey) {
                            let selections = document.getElementsByClassName('selected')
                            while(selections.length >= 1) {
                                selections[0].classList.toggle('selected');
                            }
                            while(this.electionList.length >= 1) {
                                this.selectionList.pop();
                            }
                        }
                        folderSPAN.classList.toggle('selected');
                        this.selectionList.push(folderSPAN.id);
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
                    fileSPAN.style.paddingLeft = `${this.recursiveDepthCalc(fileLI, 0) * 0.5}cm`;
                    fileSPAN.addEventListener('click', (event) => {
                        if(document.getElementsByClassName('selected')[0]  !== undefined && !event.ctrlKey) {
                            let selections = document.getElementsByClassName('selected')
                            while(selections.length >= 1) {
                                selections[0].classList.toggle('selected');
                            }
                            while(this.selectionList.length >= 1) {
                                this.selectionList.pop();
                            }
                        }
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
            // TODO Mandar essa formula pro context bridge e adaptar isso no renderer tambem
            this.currentFolderName.innerText = path.basename(process.cwd()).toUpperCase().slice(0, Math.floor((sidebar.getBoundingClientRect().width-40)/14)-3) + "...";
        }
    }

    refreshDirectory(directory, node) {
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

    getElOffset(el) {
        const rect = el.getBoundingClientRect();
        return {
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY
        };
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

    newFileButtonClickCallback() {
        if(document.getElementsByClassName('selected')[0]  !== undefined) {
            //TRY tentativa de considerar só o ultimo da seleção
            let el = this.selectionList[this.selectionList.length - 1];
            fs.lstat(el.id, (err, stat) => {
                if(err) throw err;
                if(stat && stat.isDirectory()) {
                    this.nameInputFunc(el.parentElement, el.style.paddingLeft, (nameInput) => {
                        fs.writeFile(path.join(el.id, nameInput.value), "", (err) => {
                            if(err) {
                                alert(err);
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
    }
    
    newFolderButtonClickCallback() {
        if(document.getElementsByClassName('selected')[0]  !== undefined) {
            //TRY tentativa de considerar só o ultimo da seleção
            let el = this.selectionList[this.selectionList.length - 1];
            fs.lstat(el.id, (err, stat) => {
                if(err) throw err;
                if(stat && stat.isDirectory()) {
                    this.nameInputFunc(el.parentElement, el.style.paddingLeft, (nameInput) => {
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
    }

    deleteCallback() {
        if(document.getElementsByClassName('selected')[0]  !== undefined) {
            let el = document.getElementsByClassName('selected');
            for(let i = 0; i < el.length; i++) {
                fs.rm(el[i].id, {recursive: true, force: true}, () => {
                    this.refreshDirectory(process.cwd(), this.fatherNode); //FIXME ta zuado, não ta mais dando refresh direito, e é só aqui
                });
            }
        }
    }

    collapseButtonClickCallback() {
        let activeSpans = document.getElementsByClassName('folder-down');
        while(activeSpans.length >= 1) {
            activeSpans[0].classList.remove('folder-down');
        }
        let openNests = document.getElementsByClassName('nested active');
        while(openNests.length >= 1) {
            openNests[0].classList.remove('active');
        }
    }

    static sliceMainFolderName(sliceIndex, currentFolderName) {
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
}





module.exports = {Sidebar};