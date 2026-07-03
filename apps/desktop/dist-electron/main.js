"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
let mainWindow = null;
const isDev = process.env.NODE_ENV === 'development' || !electron_1.app.isPackaged;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 768,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
        title: 'RMS Desktop POS Terminal',
    });
    if (isDev) {
        mainWindow.loadURL('http://127.0.0.1:5180');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, '../dist/index.html'));
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// Hardware Printing Bridge IPC
electron_1.ipcMain.handle('hardware:print', async (event, orderPayload) => {
    try {
        console.info('Main process printer handler print order ID:', orderPayload.id);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
// Cash Drawer Trigger IPC
electron_1.ipcMain.handle('hardware:drawer', async () => {
    try {
        console.info('Main process drawer kick signal sent.');
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
//# sourceMappingURL=main.js.map