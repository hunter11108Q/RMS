import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  printReceipt: (orderPayload: any) => ipcRenderer.invoke('hardware:print', orderPayload),
  kickCashDrawer: () => ipcRenderer.invoke('hardware:drawer'),
  platform: process.platform,
});
