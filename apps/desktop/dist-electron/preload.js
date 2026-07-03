"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('api', {
    printReceipt: (orderPayload) => electron_1.ipcRenderer.invoke('hardware:print', orderPayload),
    kickCashDrawer: () => electron_1.ipcRenderer.invoke('hardware:drawer'),
    platform: process.platform,
});
//# sourceMappingURL=preload.js.map