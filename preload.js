const {contextBridge} = require('electron');
const App = require("./src/app");
const path = require('path');

window.addEventListener('DOMContentLoaded', () => {
    process.chdir(path.join(__dirname, "1D - Test Directory"));

    let app = new App();
    contextBridge.exposeInMainWorld('bridge', {
        sliceMainFolderName: (sliceIndex, currentFolderName) => {
            app.sliceMainFolderName(sliceIndex, currentFolderName);
        },
        sliceIndexFunc: (px) => {
            app.sliceIndexFunc(px);
        }
    });
    contextBridge.exposeInMainWorld('debug', {
        debugSelectionList: () => {
            console.log("Whole list: ", app.selectionList);
            console.log("First element: ", app.selectionList[0]);
            console.log("Last element: ", app.selectionList[app.selectionList.length - 1]);
        },
        cwd: () => {
            console.log(process.cwd());
        },
        debugOpenFolders: () => {
            console.log(app.openFolders);
        }
    });
});