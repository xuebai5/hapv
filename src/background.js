"use strict";

import { app, protocol, BrowserWindow, ipcMain } from "electron";
import {
  createProtocol,
  /* installVueDevtools */
} from "vue-cli-plugin-electron-builder/lib";
const isDevelopment = process.env.NODE_ENV !== "production";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let ipcEvent; // ipc监听回调返回的event，便于全局使用
/*
当前的视频信息和解析地址
{
  site: "https://v.qq.com",
  name: "腾讯视频",
  rule: "https://v.qq.com/x/cover/",
  analysis: 'xxxxx'
};
*/
let videoConfig;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1140,
    height: 750,
    webPreferences: {
      nodeIntegration: true,
    },
    titleBarStyle: "hidden",
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    // win.loadURL("http://127.0.0.1:5500/public/static/qq.html");
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }

  win.on("closed", () => {
    win = null;
  });
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

ipcMain.once("hapv", (event, arg) => {
  // console.log(arg); // prints "ping"
  let method = arg.method.replace("/", "_");
  ipcMethod[method](arg);
  ipcEvent = event;
});

// 拦截iframe中的点击事件
app.on("web-contents-created", (e, webContents) => {
  webContents.on("new-window", (event, url) => {
    event.preventDefault();
    // 返回对应的url
    // 如果视频返回解析视频url，反之返回正常url
    console.log(url, videoConfig.rule, url.indexOf(videoConfig.rule));
    ipcEvent.sender.send("hapv", {
      method: "open/page",
      data:
        url.indexOf(videoConfig.rule) > -1 ? videoConfig.analysis + url : url,
    });

    // win.webContents.loadURL(url);
    // shell.openExternal(url);
  });
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    // try {
    //   await installVueDevtools()
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

// ipc模拟接口对应方法
let ipcMethod = {
  video_config(arg) {
    videoConfig = arg.data;
  },
};
