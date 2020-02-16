const { remote, ipcRenderer } = require('electron')
const Store = require('electron-store')
const settingsStore = new Store({name: 'Settings'})
const qiniuConfigArr = ['#savedFileLocation','#accessKey', '#secretKey', '#bucketName']

const $ = (selector) => {
  const result = document.querySelectorAll(selector)
  return result.length > 1 ? result : result[0]
}

document.addEventListener('DOMContentLoaded', () => {
  let savedFileLocation = settingsStore.get('savedFileLocation');
 
 
   if(savedFileLocation) {
      $('#savedFileLocation').value = savedFileLocation
    }

    // get the saved config data and fill in the inputs
    qiniuConfigArr.forEach(selector => {
      const savedValue = settingsStore.get(selector.substr(1))
      if (savedValue) {
        $(selector).value = savedValue
      }
    })

    $('#select-new-location').addEventListener('click', () => {
      remote.dialog.showOpenDialog({
        properties: ['openDirectory'],
        message:'选择文件的存储路径'
      })
      .then(results => {
        console.log(results, 'results')
        const paths = results.filePaths
          if(Array.isArray(paths)) {
            $('savedFileLocation').value = paths[0]
            savedFileLocation = paths[0]
          }
      })
      .catch(err => {
        console.log(err)
      })
    })

    $('#settings-form').addEventListener('submit', (e) => {
      e.preventDefault()
      qiniuConfigArr.forEach(selector => {
        if ($(selector)) {
          let { id, value } = $(selector)
          settingsStore.set(id, value ? value : '')
        }
      })
       // sent a event back to main process to enable menu items if qiniu is configed
       ipcRenderer.send('config-is-saved')
       remote.getCurrentWindow().close()
    })

    $('.nav-tabs').addEventListener('click', (e) => {
      e.preventDefault()
      $('.nav-link').forEach(element => {
        element.classList.remove('active')
      })
      e.target.classList.add('active')
      $('.config-area').forEach(element => {
        element.style.display = 'none'
      })
      $(e.target.dataset.tab).style.display = 'block'
    })
})

// "storage": {
//   "active": "qn-store",
//   "qn-store": {
//     "accessKey": "DpgMoQO3Sqo5uI4ToNjAuH7JtMISKBiFRtW8Wp3D",
//     "secretKey": "W8ZihL1TAyIuGUyoX1QiuTBBKqyLUvMqByE6lvqw",
//     "bucket": "stoge",
//     "origin": "https://stoge.cn",
//     "fileKey": {
//       "safeString": true,
//       "prefix": "YYYYMM/"
//     }
//   }
// }