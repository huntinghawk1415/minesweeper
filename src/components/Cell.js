import React from 'react'
import Flag from './svgs/Flag'

export default ({ value, hidden, flagged, shade, width, height, row, column, methods }) => {
	const handleMouseDown = ({ button }) => {
		if (button === 0) {
			methods.handleUnhideCell(row, column)
		} else if (button === 1) {
			methods.handleMultiUnhideCellSetup(row, column)
		}
	}
	const handleContextMenu = e => {
		e.preventDefault()
		methods.handleFlagCell(row, column)
	}
	
	return <button
		style={{width, height}}
		className={`cell ${shade} ${hidden ? 'hidden' : 'reveal'}${value !== 0 && !hidden ? ' hoverable' : ''}${/[0-8]/.test(value) && !hidden ? ` cell-color-${value}` : ''}`}
		onMouseDown={handleMouseDown}
		onContextMenu={handleContextMenu}
	>{hidden ? flagged ? <Flag/> : '' : value !== 0 ? value : ''}</button>
}