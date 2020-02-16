import React, {useState,useEffect} from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit,faTrash,faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import useKeypress from '../hooks/useKeyPress'
import useContextMenu from '../hooks/useContextMenu'
import {getParentNode} from '../utils/helper'
const FileList = ({files, onFileClick, onSaveEdit, onFileDelete}) => {
    const [editStatus, setEditStatus] = useState(false)
    const [value, setValue] = useState('')
    const enterPress = useKeypress(13)
    const escPress = useKeypress(27)

    const closeSearch = (editItem) => {
        setEditStatus(false)
        setValue('')
        if(editItem.isNew) {
            onFileDelete(editItem.id)
        }
        console.log(editItem,'e')
    }
   const clickedItem =  useContextMenu([
        {
            label: '打开',
            click: () => {   
            const parentElment = getParentNode(clickedItem.current, 'file-item')
            if(parentElment) {
                onFileClick(parentElment.dataset.id)
            }
            console.log(parentElment, 'parentElment')    
        }    
        },
        {
            label: '重命名',
            click: () => {
                const parentElment = getParentNode(clickedItem.current, 'file-item')
                if(parentElment) {
                    setEditStatus(parentElment.dataset.title)
                }
            }    
        },
        {
            label: '删除',
            click: () => {
                const parentElment = getParentNode(clickedItem.current, 'file-item')
            if(parentElment) {
                onFileDelete(parentElment.dataset.id)
            }
            }    
        }
    ], '.file-list', [files])
    
    // 添加菜单
    useEffect(() => {
    //   const menu = new Menu()
    //     menu.append(new MenuItem({
    //         label: '打开',
    //         click: () => {
    //         // const parentElment = getParentNode(clickedItem.current, 'file-item')
    //         }    
    //     }))
    //     menu.append(new MenuItem({
    //         label: '重命名',
    //         click: () => {
    //             console.log('打开')
    //         }    
    //     }))
    //     menu.append(new MenuItem({
    //         label: '删除',
    //         click: () => {
    //             console.log('打开')
    //         }    
    //     }))
    //     const handleContextMenu = (e) => {
    //         menu.popup({
    //             window: remote.getCurrentWindow()
    //         })
    //     }
    //     window.addEventListener('contextmenu', handleContextMenu)
    //     return () => {
    //         window.removeEventListener('contextmenu', handleContextMenu)
    //     }
    })
    useEffect(() => {
        const editItem = files.find(file => file.id === editStatus)
        if(enterPress && editStatus && value.trim() !== '') {
            onSaveEdit(editItem.id, value, editItem.isNew)
            setEditStatus(false)
            setValue('')
        } else if (escPress && editStatus){
            closeSearch(editItem)
        }
        // const handleInputEvent = (event) => {
        // }
        // document.addEventListener('keyup', handleInputEvent)
        // return () => {
        //     document.removeEventListener('keyup', handleInputEvent)
        // }
    })

    useEffect(() => {
        const newFile = files.find(file => file.isNew)
        if (newFile) {
            setEditStatus(newFile.id)
            setValue(newFile.title)
        }
    }, [files])

    return(
        <ul className="list-group list-group-flush file-list">
            {
                files.map(file => (
                    <li className="list-group-item bg-light row d-flex align-items-center file-item no-gutters" 
                    data-id={file.id}
                    data-title={file.title}
                    key={file.id}>
                      
                         { (file.id !== editStatus && !file.isNew) &&
                          <>
                           <span className="col-2">
                                <FontAwesomeIcon title='md' icon={faMarkdown} />
                            </span>

                            <span className="col-6 c-link" onClick={() => {onFileClick(file.id)}}>{file.title}</span>
                            
                            <button  className="icon-button  col-2">
                                <FontAwesomeIcon title='编辑' icon={faEdit} onClick={() => {setEditStatus(file.id);setValue(file.title)}} />
                            </button>
                            <button className="icon-button col-2">
                                <FontAwesomeIcon title='删除' icon={faTrash} onClick={() => {onFileDelete(file.id)}}  />
                            </button>
                          </>
                        }
                        {
                         ((file.id === editStatus) || file.isNew) &&  
                         <>
                            <input className="form-control col-10" 
                            value={value}
                            placeholder='请输入文件名称'
                            onChange={(e) => {
                                setValue(e.target.value)
                            }}
                            />
                            <button type="button" className="icon-button col-2" onClick={() => {closeSearch(file)}}>
                            <FontAwesomeIcon title='关闭' icon={faTimes} size="lg" />
                            </button>
                         </> 
                        }
                    </li>
                ))
            }
            
         </ul>
    )
}
FileList.propTypes = {
    files: PropTypes.array,
    onFileClick: PropTypes.func.isRequired,
    onSaveEdit: PropTypes.func.isRequired,
    onFileDelete: PropTypes.func.isRequired,
}
export default FileList
