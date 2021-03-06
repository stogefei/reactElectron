import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


const BottomBtn = ({text, colorClass, icon, onBtnClick}) => (
    <button
        type="button"
        onClick={onBtnClick}
        className={`btn btn-block no-border ${colorClass}`}
    >
        <FontAwesomeIcon className="mr-2" size="lg" icon={icon}/>
        {text}
    </button>
)

BottomBtn.propTypes = {
    text:PropTypes.string, 
    colorClass: PropTypes.string.isRequired,
    icon: PropTypes.object,
    onBtnClick: PropTypes.func,
}
export default BottomBtn