const { BrowserWindow,Menu} = require('electron')

class AppWindow extends BrowserWindow {
    constructor (config, urlLocation) {
        const basicConfig = {
            width: 800,
            height: 600,
            webPreferences: {
              useContentSize: true,
              nodeIntegration: true
            },
            show: false,
            backgroundColor: '#efefef'
        }

        const finalConfig = {...basicConfig, ...config}
        super(finalConfig)
        // this指向调用的实例
        this.loadURL(urlLocation)
        this.once('ready-to-show', () => {
            this.show()
        })
    }
}

module.exports = AppWindow