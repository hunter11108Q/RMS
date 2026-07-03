import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    title: 'RMS Desktop POS Terminal',
  });

  if (isDev) {
    mainWindow.loadURL('http://127.0.0.1:5180');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Hardware Printing Bridge IPC
ipcMain.handle('hardware:print', async (event, orderPayload: any) => {
  try {
    console.info('Main process printer handler print order ID:', orderPayload.id);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Cash Drawer Trigger IPC
ipcMain.handle('hardware:drawer', async () => {
  try {
    console.info('Main process drawer kick signal sent.');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});
