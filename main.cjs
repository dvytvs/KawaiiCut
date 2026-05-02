const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#141414',
    autoHideMenuBar: true, // Hide the standard menu bar
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // Allowed for this prototype
    }
  });

  // Remove menu completely
  mainWindow.setMenuBarVisibility(false);

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow.webContents.getURL() && url.startsWith('http') && !url.includes('localhost:3000')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // In development, load from the Vite dev server
  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:3000');
    // DevTools commented out by request
    // mainWindow.webContents.openDevTools(); 
  } else {
    // In production, load the built index.html
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
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