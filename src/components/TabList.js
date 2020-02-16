import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faTimes } from '@fortawesome/free-solid-svg-icons'
import './TabList.scss'
const classNames = require('classnames');
const TabList = ({files, activeId, unsavedIds, onTabClick, onCloseTab}) => {

    return (
        <ul className="nav nav-pills tablist-components">
            {
                files.map(file => {
                    // console.log(unsavedIds, 'unsavedIds')
                    const withUnsavedMark = unsavedIds.includes(file.id)
                    const fClassName = classNames({
                        'nav-link': true,
                        'active': file.id === activeId,
                        'withUnsaved': withUnsavedMark
                    })
                    return (
                        <li className="nav-item" key={file.id}>
                            <a href="#" className={fClassName} onClick={(e) => {e.preventDefault(); onTabClick(file.id)}} >
                                {
                                    file.title
                                    
                                }
                                <span className="ml-2 close-icon" onClick={(e) => {e.stopPropagation(); onCloseTab(file.id)}}>
                                            <FontAwesomeIcon size='lg' icon={faTimes} />
                                </span>
                                {withUnsavedMark && <span className="rounded-circle ml-2 unsaved-icon"></span>}
                            </a>
                        </li>
                    )
                })
            }
        </ul>
    )
}
TabList.propTypes = {
    files:PropTypes.array, 
    activeId:PropTypes.string, 
    unsavedIds:PropTypes.array, 
    onCloseTab:PropTypes.func, 
    onTabClick: PropTypes.func.isRequired
}
TabList.defaultProps = {
    unsavedIds:[]
}
export default TabList