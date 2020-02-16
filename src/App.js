import React, {useState,useEffect} from 'react';
import { faPlus,faFileExport,faFileSignature } from '@fortawesome/free-solid-svg-icons'
import FileSearch from './components/FileSearch';
import FileList from './components/FileList'
// import defaultFile from './utils/defualtFiles'
import BottomBtn from './components/BottomBtn'
import TabList from './components/TabList'
import Loader from './components/Loader'
import SimpleMDE from "react-simplemde-editor";
import uuidv4 from 'uuid/v4'
import {flattenArr,objToArr,timeampToString} from './utils/helper'
import fileHelper from'./utils/fileHelper'
import "easymde/dist/easymde.min.css";
import'bootstrap/dist/css/bootstrap.min.css'
import './App.css';
import 'normalize.css';
import useIpcRenderer from './hooks/useIpcRenderer'
const {join,basename,extname,dirname} = window.require('path')
const {remote, ipcRenderer} = window.require('electron')
const Store = window.require('electron-store')

const fileStore = new Store({'name': 'Files Data'})
const settingsStore = new Store({name: 'Settings'})
const getAutoAync = ['accessKey', 'secretKey', 'bucketName', 'enableAutoSync'].every(key => !!settingsStore.get(key))

const saveFilesStore = (files) => {
  const filesStoreObj = objToArr(files).reduce((result, file) => {
  const {id, path, title, createAt, isSynced, updateAt} = file
    result[id] = {
      id,
      path,
      title,
      createAt,
      isSynced,
      updateAt
    }
    return result
  }, {})
  fileStore.set('files', filesStoreObj)
}

function App() {
  // console.log(fileStore.get('files'));
  const [files, setFiles] = useState(fileStore.get('files') || {}) // 左侧文件列表
  const [activeFileID, setActiveFileID] = useState('') // 当前编辑文件
  const [openedFileIDs, setOpenedFileIDs] = useState([]) // 右侧打开的文件
  const [unsavedFileIDs, setUnsavedFileIDs] = useState([]) // 未保存的文件
  const [searchFiles, setSearchFiles] = useState([]) // 搜索数组
  const [isLoading, setLoading] = useState(false)
  // const savedLocation = remote.app.getPath('documents')
  const savedLocation = settingsStore.get('savedFileLocation') || remote.app.getPath('documents')

  const filesArr = objToArr(files)
  // console.log(filesArr,'filesArr')
  const fileListArr = (searchFiles.length > 0) ? searchFiles: filesArr

  // console.log(files)
  // 左侧文件点击
  const fileClick = (fileID) => {
    setActiveFileID(fileID)
    const currentFile = files[fileID]
    // console.log(currentFile,'currentFile')
    const {id, title, path, isLoaded} = currentFile
    if(!isLoaded) {
      if(getAutoAync) {
          ipcRenderer.send('download-file', {key: `${title}.md`, path, id})
      } else{
      fileHelper.readFile(currentFile.path)
      .then(value => {
        console.log(value,'value')
        const newFile = {...files[fileID], body: value,  isLoaded: true}
        setFiles({...files,[fileID]:newFile})
      })
    }
    }
    if(!openedFileIDs.includes(fileID)) {
      setOpenedFileIDs([...openedFileIDs, fileID])
    }
  }

  const tabClick = (fileID) => {
    setActiveFileID(fileID)
  }

  const tabClose = (id) => {
    const tabs = openedFileIDs.filter(fileID => fileID !== id)
    setOpenedFileIDs(tabs)
    if(tabs.length > 0) {
      setActiveFileID(tabs[0])
    } else{
      setActiveFileID('')
    }
  }
  
  //编辑器改变事件
  const handleChange = (id, value) => {
    //  files.map(file => {
    //   if (file.id === id) {
    //       file.body = value
    //   }
    //   return newFiles
    // })
    // console.log(newFiles,'newFiles')
    // setFiles(newFiles)
    if(value !== files[id].body) {
    const newFile = {...files[id], body: value}
    setFiles({...files, [id]:newFile })
    if(!unsavedFileIDs.includes(id)) {
      setUnsavedFileIDs([...unsavedFileIDs, id])
    }
  }
  }

  // 删除文件
  const deleteFile = (id) => {
    if(files[id].isNew) {
      const {[id]: value, ...afterDelte} = files
      setFiles({...afterDelte})
    }
    else{
      fileHelper.deleteFile(files[id].path).then(() => {
        const { [id]: value, ...afterDelete } = files
        setFiles(afterDelete)
        saveFilesStore(afterDelete)
        // close the tab if opened
        tabClose(id)
      })
    }
    // const newFiles = files.filter(file => file.id !== id)


  }

  // 修改文件名
  const editorFileName = (id, title, isNew) => {
    // const newFiles
    // files.map((file) => {
    //   if (file.id === id) {
    //       file.title = title
    //       file.isNew = false
    //   }
    // })saveFilesStore
    // const newPath = join(savedLocation, `${title}.md`)
    const newPath = isNew? join(savedLocation, `${title}.md`): join(dirname(files[id].path), `${title}.md`)
    const modifieFile = {...files[id], title, isNew: false, path: newPath}
    const newFiles = {...files, [id]: modifieFile}
    if(isNew) {
      fileHelper.writeFile(newPath, files[id].body)
      .then(res => {
        setFiles(newFiles)
        saveFilesStore(newFiles)
      })
    }
    else{
      // const oldPath = join(savedLocation, `${files[id].title}.md`)
      const oldPath = files[id].path
      fileHelper.renameFile(oldPath,newPath)
      .then(res => {
        setFiles(newFiles)
        saveFilesStore(newFiles)
      })
    }
  
    // setFiles(newFiles)
  }

  // 搜索
  const fileSearch = (keyword) => {
    const newFiles = filesArr.filter(file => file.title.includes(keyword))
    setSearchFiles(newFiles)
  }

  // 新建文件
  const createFile = () => {
    const uuid =  uuidv4()
    // const newFiles = [
    //   ...filesArr,
    //   {
    //     id:uuid,
    //     title: '',
    //     body: '## 请输入',
    //     createAt: new Date().getTime(),
    //     isNew: true
    //   }
    // ]
    const newFile = {
        id:uuid,
        title: '',
        body: '## 请输入',
        createAt: new Date().getTime(),
        isNew: true
      }
  
    setFiles({...files, [uuid]:newFile})
  }

    // 当前打开的文件
  const activeFile = files[activeFileID]

  // 右侧打开的文件
  const opendFiles = openedFileIDs.map(opendID => {
    return files[opendID]
  })

// 保存文件
  const fileSave = () => {
    const {path, body, title} = activeFile
    // fileHelper.writeFile(join(savedLocation, `${activeFile.title}.md`), activeFile.body)
    fileHelper.writeFile(path, body)
    .then(() => {
        setUnsavedFileIDs(unsavedFileIDs.filter(id => id !== activeFile.id))
        console.log(getAutoAync,'getAutoAync')
        if(getAutoAync) {
          // 自动同步
          ipcRenderer.send('auto-upload-file', {key: `${title}.md`,path})
        }
    })
  }
  // 导入文件
  const importFiles = () => {
    remote.dialog.showOpenDialog({
      title: '选择导入的Markdown文件',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Markdown files', extensions: ['md'] },
      ]
    })
    .then(results => {
      console.log(results, 'results')
      const paths = results.filePaths
        if(Array.isArray(paths)) {
          const filterPaths = paths.filter(path => {
            const alreadAdded = Object.values(files).find(file => {
              return file.path === path
            })
            return !alreadAdded
          })
          console.log(filterPaths, 'filterPaths')
          const importFiles = filterPaths.map(path => {
              return {
                id: uuidv4(),
                title: basename(path, extname(path)),
                path: path,
                createAt: new Date().getTime()
              }
          })
          const newFiles = {...files, ...flattenArr(importFiles)}
          setFiles(newFiles)
          saveFilesStore(newFiles)
          if(importFiles.length > 0) {
            remote.dialog.showMessageBox({
              type: 'info',
              title: `成功导入${importFiles.length}个文件`
            })
          } else{
            remote.dialog.showMessageBox({
              type: 'warning',
              title: `文件已存在！`
            })
          }
          console.log(newFiles, 'newFiles')
          console.log(importFiles, 'importFiles')
        }
    })
    .catch(err => {
      console.log(err)
    })
  }
  // 同步上传文件
  const activeFileUploaded = () => {
    const {id} = activeFile
    const modifieFile = {...files[id], isSynced: true, updateAt: new Date().getTime()}
    const newFiles = {...files, [id]: modifieFile}
    setFiles(newFiles)
    saveFilesStore(newFiles)
  }
   // 同步下载文件
  const activeFileDownload = (event, message) => {
      const currentFile = files[message.id]
      const {id ,path} = currentFile
      fileHelper.readFile(path).then(value => {
        // console.log(value, 'value')
        let newFile;
        if(message.status === 'download-success') {
          newFile = {...files[id], body: value, isLoaded: true, isSynced: true, updateAt: new Date().getTime()}
        } else{
          newFile = {...files[id], body: value, isLoaded: true}
        }
        const newFiles = {...files, [id]: newFile}
        setFiles(newFiles)
        saveFilesStore(newFiles)
      })
  }
  const loadingStatus = (event, status) => {
    console.log(status, 'status')
    setLoading(status)
  }
  const filesUploaded = () => {
    const newFiles = objToArr(files).reduce((result, file) => {
      const currentTime = new Date().getTime()
      result[file.id] = {
        ...files[file.id],
        isSynced: true,
        updateAt: currentTime
      }

      return result
    }, {})
    setFiles(newFiles)
    saveFilesStore(newFiles)
  }
  useIpcRenderer({
    'create-new-file': createFile,
    'save-editor-file': fileSave,
    'import-file': importFiles,
    'search-file': fileSearch,
    'active-file-uploaded': activeFileUploaded,
    'file-downloaded': activeFileDownload,
    'loading-status': loadingStatus,
    'files-uploaded': filesUploaded,
  })

  useEffect(() => {
    const callback = () => {
      console.log('form menu')
    }
    ipcRenderer.on('create-new-file', callback)
    return () => {
      ipcRenderer.removeListener('create-new-file', callback)
    }
  })

  return (
    <div className="App container-fluid px-0">
      {isLoading && <Loader/> }
      <div className="row no-gutters">
        <div className="col-3 left-panel">
         <FileSearch  onFileSearch={fileSearch}/>
         <FileList 
         files={fileListArr}
         onFileClick={fileClick}
         onSaveEdit={editorFileName}
         onFileDelete={deleteFile}
         />
         <div className="row no-gutters button-group">
            <div className="col">
              <BottomBtn text="新建" onBtnClick={createFile} colorClass="btn-primary" icon={faPlus} />
              
            </div>
            <div className="col">
              <BottomBtn text="导入" colorClass="btn-success" icon={faFileExport} onBtnClick={importFiles} />
            </div>
         </div>
        </div>

        <div className="col-9 right-panel">
          {
            !activeFile && 
            <div className="start-page">
                选择或者创建新的 MarkDown文档
            </div>
          }
          {
            activeFile &&
            <>
               <TabList
                  activeId={activeFileID}
                  files={opendFiles}
                  unsavedIds={unsavedFileIDs}
                  onCloseTab={tabClose}
                  onTabClick={tabClick}/>

                <SimpleMDE
                key={activeFile && activeFile.id} 
                value={activeFile? activeFile.body: ''} 
                onChange={(value) => {handleChange(activeFile.id, value)}}
                options={
                  {
                    minHeight: '515px'
                  }
                }
                />
                {
                  activeFile.isSynced  && <span className='sync-status'>已同步， 上次同步事件{timeampToString(activeFile.updateAt)} </span>
                }
                {/* <BottomBtn text="保存" colorClass="btn-success" icon={faFileSignature} onBtnClick={fileSave} /> */}
            </>
          }
      
          </div>
      </div>
    </div>
  );
}

export default App;
