import { app, BrowserWindow, screen, ipcMain, globalShortcut } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { BrowserConfig } from './browser-config';

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

try {
	require('dotenv').config();
} catch {
	console.log('asar');
}

function createWindow() {

	const electronScreen = screen;
	const size = electronScreen.getPrimaryDisplay().workAreaSize;

	// Create the browser window.
	win = new BrowserWindow({
		x: 0,
		y: 0,
		width: size.width,
		height: size.height,
		autoHideMenuBar: true
	});

	if (serve) {
		require('electron-reload')(__dirname, {
		});
		win.loadURL('http://localhost:4200');
	} else {
		win.loadURL(url.format({
			pathname: path.join(__dirname, 'dist/index.html'),
			protocol: 'file:',
			slashes: true
		}));
	}

	win.webContents.openDevTools();

	// Emitted when the window is closed.
	win.on('closed', () => {
		// Dereference the window object, usually you would store window
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null;
	});

	globalShortcut.register('CommandOrControl+L', () => {
		win.webContents.send('browser-address-bar-request', 'focus');
	})
}

try {
	ipcMain.on('browser-save-tabs-request', (event, tabs) => {
		BrowserConfig.getInstance().set('tabs', tabs);
	});
	ipcMain.on('browser-load-tabs-request', (event, args) => {
		event.sender.send('browser-load-tabs-response', BrowserConfig.getInstance().get('tabs'));
	})

	// This method will be called when Electron has finished
	// initialization and is ready to create browser windows.
	// Some APIs can only be used after this event occurs.
	app.on('ready', createWindow);

	// Quit when all windows are closed.
	app.on('window-all-closed', () => {
		// On OS X it is common for applications and their menu bar
		// to stay active until the user quits explicitly with Cmd + Q
		if (process.platform !== 'darwin') {
			app.quit();
		}
	});

	app.on('activate', () => {
		// On OS X it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (win === null) {
			createWindow();
		}
	});

} catch (e) {
	// Catch Error
	// throw e;
}
