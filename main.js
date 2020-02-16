// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  dialog
} = require('electron')
const isDev = require('electron-is-dev')
const {autoUpdater} = require('electron-updater')
const menuTemplate = require('./src/utils/menuTemplate')
const AppWindow = require('./src/AppWindow')
const path = require('path')
const Store = require('electron-store')
const QiniuManager = require('./src/utils/QiniuManager')
const settingsStore = new Store({
  name: 'Settings'
})
const fileStore = new Store({
  name: 'Files Data'
})
const QiniuFileManager = () => {
  const accessKey = settingsStore.get('accessKey');
  const secretKey = settingsStore.get('secretKey');
  const bucketName = settingsStore.get('bucketName');
  return new QiniuManager(accessKey, secretKey, bucketName)
}
function createWindow() {
  require('devtron').install();
  autoUpdater.checkFroUpdatersAndNotify()

  // 设置窗口选项
  const mainWindowConfig = {
    width: 14400,
    height: 800
  }

  // and load the index.html of the app.
  const urlLocation = isDev ? 'http://localhost:3000/' : `file://${path.join(__dirname, './index.html')}`

  let mainWindow = new AppWindow(mainWindowConfig, urlLocation)

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // 回收
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // mainWindow.loadURL(urlLocation)
  //添加菜单
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)

  let settingsWindow = null;
  // 打开设置
  ipcMain.on('open-settings-window', () => {
    const settingsWindowConfig = {
      width: 600,
      height: 600,
      parent: mainWindow
    }
    const settingsFileLocation = `file://${path.join(__dirname, './settings/settings.html')}`
    settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation)
    // 回收
    settingsWindow.on('closed', () => {
      settingsWindow = null
    })
  })
  // 同步菜单
  ipcMain.on('config-is-saved', () => {
  
    // mac or window 
    let qiniuMenu = process.platform === 'darwin' ? menu.items[2] : menu.items[1];
    const switchItems = (toggle) => {
      [1, 2, 3].forEach(number => {
        qiniuMenu.submenu.items[number].enabled = toggle
      })
    }
    const qiniuConfigConfiged = ['accessKey', 'secretKey', 'bucketName'].every(key => !!settingsStore.get(key))
    if (qiniuConfigConfiged) {
      switchItems(true)
    } else {
      switchItems(false)
    }
  })

  // 同步
  ipcMain.on('auto-upload-file', (event, data) => {
      const manager = QiniuFileManager()
      manager.uploadFile(data.key, data.path).then(data => {
        console.log('同步成功')
        mainWindow.webContents.send('active-file-uploaded')
      }).catch(err => {
        dialog.showErrorBox({
          title: '同步失败'
        })
      })
  })

  ipcMain.on('upload-all-to-qiniu', () => {
    mainWindow.webContents.send('loading-status', true)
    const manager = QiniuFileManager()
    const filesObj = fileStore.get('files') || {}
    const uploadPromiseArr = Object.keys(filesObj).map(key => {
        const file = filesObj[key]
        return manager.uploadFile(`${file.title}.md`, file.path)
    })

    Promise.all(uploadPromiseArr).then(result => {
       console.log(result, '上传全部')
        dialog.showMessageBox({
          type: 'info',
          title: `成功上传了${result.length}个文件`,
          message: `成功上传了${result.length}个文件`,
        })
        mainWindow.webContents.send('files-uploaded')
    }).catch(err => {
      dialog.showErrorBox({
        title: '同步失败'
      })
    }).finally(() => {
      mainWindow.webContents.send('loading-status', false)
    })
  })
    // 下载
    ipcMain.on('download-file', (event, data) => {
      const manager = QiniuFileManager()
      const fileObj = fileStore.get('files')
      const {key, path, id} = data
      manager.getStat(data.key).then(resps => {
        console.log(resps, '下载')
        const serverUpdateTime = Math.round(resps.putTime / 10000)
        const localUpdataeTime = fileObj[id].updateAt
        if(serverUpdateTime > localUpdataeTime || !localUpdataeTime) {
          manager.downloadFile(key, path).then(() => {
            mainWindow.webContents.send('file-downloaded', {status: 'download-success', id})
          }).catch(err => {
            mainWindow.webContents.send('file-downloaded', {status: 'no-new-file', id})
          })
        }
      }).catch(err => {
        if(err.statusCode === 612) {
            mainWindow.webContents.send('file-downloaded', {status: 'no-file'})
        }
      })
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.