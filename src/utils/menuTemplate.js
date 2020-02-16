  
/**
 * Creates a default menu for electron apps
 *
 * @param {Object} app electron.app
 * @param {Object} shell electron.shell
 * @returns {Object}  a menu object to be passed to electron.Menu
 */
const {app, shell,ipcMain} = require('electron')
const Store = require('electron-store')
const settingsStore = new Store({name: 'Settings'})
const qiniuConfigConfiged = ['accessKey', 'secretKey', 'bucketName'].every(key => !!settingsStore.get(key))
let enableAutoSync = settingsStore.get('enableAutoSync')
const template = [
    {
    label: '文件',
    submenu: [
        {
        label: '新建',
        accelerator: 'CmdOrCtrl+N',
        click: (menuItem,browserWindow,event) => {
            browserWindow.webContents.send('create-new-file')
        }
        },
        {
        label: '保存',
        accelerator: 'CmdOrCtrl+S',
        click: (menuItem,browserWindow,event) => {
            browserWindow.webContents.send('save-editor-file')
        }
        },
        {
        label: '搜索',
        accelerator: 'CmdOrCtrl+F',
        click: (menuItem,browserWindow,event) => {
            browserWindow.webContents.send('search-file')
        }
        },
        {
        label: '导入',
        accelerator: 'CmdOrCtrl+O',
        click: (menuItem,browserWindow,event) => {
            browserWindow.webContents.send('import-file')
        }
        }
    ]
    },
    {
        label: '云同步',
        submenu: [
            {
            label: '设置',
            accelerator: 'CmdOrCtrl+ .',
            click: (menuItem,browserWindow,event) => {
                ipcMain.emit('open-settings-window')
            }
            },
            {
            label: '自动同步',
            type: 'checkbox',
            enabled: qiniuConfigConfiged,
            checked: enableAutoSync,
            click: (menuItem,browserWindow,event) => {
                settingsStore.set('enableAutoSync', !enableAutoSync)
            }
            },
            {
            label: '全部同步至云端',
            enabled: qiniuConfigConfiged,
            click: (menuItem,browserWindow,event) => {
                ipcMain.emit('upload-all-to-qiniu')
            }
            },
            {
            label: '从云端下载至本地',
            enabled: qiniuConfigConfiged,
            click: (menuItem,browserWindow,event) => {
                // browserWindow.webContents.send('import-file')
            }
            }
        ]
        },
    {
    label: '编辑',
    submenu: [
        {
            label: '撤销',
            accelerator: 'CmdOrCtrl+Z',
            role: 'undo'
        },
        {
            label: '重做',
            accelerator: 'Shift+CmdOrCtrl+Z',
            role: 'redo'
        },
        {
            type: 'separator'
            },
        {
            label: '剪切',
            accelerator: 'CmdOrCtrl+X',
            role: 'cut'
        },
        {
            label: '复制',
            accelerator: 'CmdOrCtrl+C',
            role: 'copy'
        },
        {
            label: '粘贴',
            accelerator: 'CmdOrCtrl+V',
            role: 'paste'
            },
            {
            label: '全选',
            accelerator: 'CmdOrCtrl+A',
            role: 'selectall'
            },
    ]
    },
    {
    label: '视图',
    submenu: [
        {
        label: '刷新当前页面',
        accelerator: 'CmdOrCtrl+R',
        click: function(item, focusedWindow) {
            if (focusedWindow)
            focusedWindow.reload();
        }
        },
        {
        label: '切换全屏',
        accelerator: (function() {
            if (process.platform === 'darwin')
            return 'Ctrl+Command+F';
            else
            return 'F11';
        })(),
        click: function(item, focusedWindow) {
            if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
        },
        {
        label: '打开控制台',
        accelerator: (function() {
            if (process.platform === 'darwin')
            return 'Alt+Command+I';
            else
            return 'Ctrl+Shift+I';
        })(),
        click: function(item, focusedWindow) {
            if (focusedWindow)
            focusedWindow.toggleDevTools();
        }
        },
    ]
    },
    {
    label: '窗口',
    role: 'window',
    submenu: [
        {
        label: '缩小',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
        },
        {
        label: '关闭',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
        },
    ]
    },
    {
    label: '帮助',
    role: 'help',
    submenu: [
        {
        label: '更多',
        click: function() { shell.openExternal('http://electron.atom.io') }
        },
    ]
    },
];

if (process.platform === 'darwin') {
    const name = app.getName();
    template.unshift({
    label: name,
    submenu: [
        {
        label: '关于 ' + name,
        role: 'about'
        },
        {
            type: 'separator'
            },
        {
            label: '设置',
            accelerator: 'Cmmand+ .',
            click: (menuItem,browserWindow,event) => {
                ipcMain.emit('open-settings-window')
            }
         },
        {
        label: '设置',
        role: 'services',
        submenu: []
        },
        {
        type: 'separator'
        },
        {
        label: '隐藏 ' + name,
        accelerator: 'Command+H',
        role: 'hide'
        },
        {
        label: '隐藏其他',
        accelerator: 'Command+Shift+H',
        role: 'hideothers'
        },
        {
        label: '显示所有',
        role: 'unhide'
        },
        {
        type: 'separator'
        },
        {
        label: '退出',
        accelerator: 'Command+Q',
        click: function() { app.quit(); }
        },
    ]
    });
    const windowMenu = template.find(function(m) { return m.role === 'window' })
    if (windowMenu) {
    windowMenu.submenu.push(
        {
        type: 'separator'
        },
        {
        label: 'Bring All to Front',
        role: 'front'
        }
    );
    }
} else {
    template[0].submenu.push({
        label: '设置',
        accelerator: 'ctrl+ .',
        click: (menuItem,browserWindow,event) => {
            ipcMain.emit('open-settings-window')
        }
    })
}


module.exports = template