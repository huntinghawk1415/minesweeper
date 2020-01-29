import React, { Component } from 'react'
import Header from './Header'
import Cell from './Cell'
import Bomb from './svgs/Bomb'
import GameEnd from './GameEnd'

/** 
 * Timer (start on first reveal)
 * Colors for 7, 8
 * Highlight colors for middle mouse down (if possible)
 * Handle win (save timer to localStorage on win)
 */

export default class Field extends Component {
	constructor(props) {
    super(props)
    const { difficulty } = this.props
    const size = difficulty === 'hard' ? [20, 24] : [20, 24]

    this.state = {
      field: Array.from({length: size[0]}, (s, t) => Array.from({length: size[1]}, (u, v) => ({
        value: 0,
        hidden: true,
        flagged: false,
        shade: t % 2 === 0 ? v % 2 === 0 ? 'dark' : 'light' : (v + 1) % 2 === 0 ? 'dark' : 'light',
        isBomb: null,
        surroundingsChecked: false,
        row: t,
        column: v
      }))),
      size,
      hasStarted: false,
      isLoser: false,
      isWinner: false,
      timer: 0,
      flags: 99
    }
		this.handleResetGame = this.handleResetGame.bind(this)
		this.handleUnhideCell = this.handleUnhideCell.bind(this)
		this.handleMultiUnhideCell = this.handleMultiUnhideCell.bind(this)
		this.handleMultiUnhideCellSetup = this.handleMultiUnhideCellSetup.bind(this)
		this.handleFlagCell = this.handleFlagCell.bind(this)
  }
  componentDidUpdate() {
    const { field, isLoser, isWinner, timer } = this.state

    if (timer === 999) {
      clearInterval(this.timer)
    }

    if (!isLoser) {
      const bombHit = field.reduce((pre1, cur1) => pre1 + cur1.reduce((pre2, cur2) => cur2.isBomb && !cur2.hidden ? (pre2 + 1) : pre2, 0), 0) > 0 ? true : false
  
      if (bombHit) {
        clearInterval(this.timer)
        this.setState(state => (state.field.map(s => s.map(t => t.isBomb && (t.hidden = false))), state.isLoser = true))
      }
    }

    if (!isWinner) {
      const allClear = field.reduce((pre1, cur1) => pre1 + cur1.reduce((pre2, cur2) => !cur2.isBomb && cur2.hidden ? (pre2 + 1) : pre2, 0), 0) > 0 ? false : true

      if (allClear) {
        clearInterval(this.timer)
        this.setState({isWinner: true}, () => {
          window.localStorage.setItem('JLMINESWEEPER-BEST-TIME', this.state.timer)
        })
      }
    }
  }
  getRandomTile(fieldCopy, restricted) {
    const randomRow = Math.floor(Math.random() * this.state.size[0]) << 0
    const randomCol = Math.floor(Math.random() * this.state.size[1]) << 0
    const touchedRestricted = restricted.reduce((pre, cur) => randomRow === cur.row && randomCol === cur.column ? (pre + 1) : pre, 0)

    if (touchedRestricted > 0 || fieldCopy[randomRow][randomCol].isBomb) {
      return this.getRandomTile(fieldCopy, restricted)
    }
    
    return [randomRow, randomCol]
  }
  setBombs(row, column) {
    const fieldCopy = [...this.state.field]

    // restrict all surrounding area of init click from being a bomb
    const restrictedPrimary = fieldCopy.reduce((pre1, cur1, index1) => {
      const rowInRange = index1 > row - 2 && index1 < row + 2

      return rowInRange ? [...pre1, ...cur1.reduce((pre2, cur2, index2) => {
        const colInRange = index2 > column - 2 && index2 < column + 2

        return colInRange ? [...pre2, cur2] : pre2
      }, [])] : pre1
    }, []).filter(s => s.row === row && s.column === column ? false : true)

    // choose a random secondary restriction from being a bomb within init click's surrounding area
    const chosenSecondary = restrictedPrimary[Math.floor(Math.random() * restrictedPrimary.length) << 0]
    const restrictedSecondary = fieldCopy.reduce((pre1, cur1, index1) => {
      const rowInRange = index1 > chosenSecondary.row - 2 && index1 < chosenSecondary.row + 2

      return rowInRange ? [...pre1, ...cur1.reduce((pre2, cur2, index2) => {
        const colInRange = index2 > chosenSecondary.column - 2 && index2 < chosenSecondary.column + 2

        return colInRange ? [...pre2, cur2] : pre2
      }, [])] : pre1
    }, [])

    for (let i = 0; i < 100; i ++) {
      const coors = this.getRandomTile(fieldCopy, [...restrictedPrimary, ...restrictedSecondary, {row, column}])

      fieldCopy[coors[0]][coors[1]].value = <Bomb />
      fieldCopy[coors[0]][coors[1]].isBomb = true
    }

    return fieldCopy
  }
  setIndicators(row, column) {
    const bombField = this.setBombs(row, column)

    return bombField.map((s, t) => s.map((u, v) => {
      if (!u.isBomb) {
        const numberOfSurroundingBombs = bombField.reduce((pre1, cur1, index1) => {
          const rowInRange = index1 > t - 2 && index1 < t + 2
    
          return rowInRange ? [...pre1, ...cur1.reduce((pre2, cur2, index2) => {
            const colInRange = index2 > v - 2 && index2 < v + 2
    
            return colInRange ? [...pre2, cur2] : pre2
          }, [])] : pre1
        }, []).filter(s => s.row === t && s.column === v ? false : true).reduce((pre, cur) => cur.isBomb ? (pre + 1) : pre, 0)

        return {
          ...u,
          value: numberOfSurroundingBombs
        }
      }

      return u
    }))
  }
  setField(row, column) {
    const finalField = this.setIndicators(row, column)

    return finalField
  }
  handleResetGame() {
    this.setState(state => ({
      field: Array.from({length: state.size[0]}, (s, t) => Array.from({length: state.size[1]}, (u, v) => ({
        value: 0,
        hidden: true,
        flagged: false,
        shade: t % 2 === 0 ? v % 2 === 0 ? 'dark' : 'light' : (v + 1) % 2 === 0 ? 'dark' : 'light',
        isBomb: null,
        surroundingsChecked: false,
        row: t,
        column: v
      }))),
      size: state.size,
      hasStarted: false,
      isLoser: false,
      isWinner: false,
      timer: 0,
      flags: 99
    }))
  }
	handleUnhideCell(row, column) {
    if (!this.state.hasStarted) {
      this.setState({field: this.setField(row, column), hasStarted: true}, () => {
        this.handleMultiUnhideCellSetup(row, column, true)
        this.timer = setInterval(() => this.setState(state => state.timer += 1), 1000)
      })
    } else {
      const { value, hidden, flagged } = this.state.field[row][column]
      
      if (hidden && !flagged) {
        this.setState(state => (state.field[row][column].hidden = false), () => value === 0 && this.handleMultiUnhideCellSetup(row, column))
      }
    }
	}
	handleMultiUnhideCell(row, column, initial) {
    this.setState(state => (state.field[row][column].surroundingsChecked = initial ? false : true), () => {
      const { value, hidden, isBomb } = this.state.field[row][column]
      
      if (initial || (!hidden && !isBomb)) {
        const surroundings = this.state.field.reduce((pre1, cur1, index1) => {
          const rowInRange = index1 > row - 2 && index1 < row + 2
  
          return rowInRange ? [...pre1, ...cur1.reduce((pre2, cur2, index2) => {
            const colInRange = index2 > column - 2 && index2 < column + 2
  
            return colInRange ? [...pre2, cur2] : pre2
          }, [])] : pre1
        }, []).filter(s => s.surroundingsChecked ? false : true)
        const toReveal = surroundings.filter(s => s.hidden)
        const numberFlagged = surroundings.reduce((pre, cur) => cur.flagged ? (pre + 1) : pre, 0)
  
        if (numberFlagged === value) {
          toReveal.forEach(s => this.setState(state => !state.field[s.row][s.column].flagged && (state.field[s.row][s.column].hidden = false)))
          surroundings.filter(s => s.value === 0).forEach(s => this.handleMultiUnhideCell(s.row, s.column))
        }
      }
    })
  }
  handleMultiUnhideCellSetup(row, column, initial) {
    this.setState(
      state => state.field.map(s => s.map(t => (t.surroundingsChecked = false))),
      () => this.handleMultiUnhideCell(row, column, initial)
    )
  }
	handleFlagCell(row, column) {
		const { hidden } = this.state.field[row][column]
		
		if (hidden) {
      if (this.state.flags > 0) {
        this.setState(state => (
          state.field[row][column].flagged ? (state.flags += 1) : (state.flags -=1),
          state.field[row][column].flagged = !state.field[row][column].flagged
        ))
      } else {
        this.state.field[row][column].flagged && this.setState(state => (
          state.flags += 1,
          state.field[row][column].flagged = false
        ))
      }
		}
	}
	render() {
    const { difficulty } = this.props
    const { field, timer, flags, size, isLoser, isWinner } = this.state
    const bestTime = Number(window.localStorage.getItem('JLMINESWEEPER-BEST-TIME')) || null

		return (
      <>
        {isLoser && <GameEnd reset={this.handleResetGame} sessionTime='- - -' bestTime={(bestTime !== null) ? bestTime < 10 ? `00${bestTime}` : bestTime < 100 ? `0${bestTime}` : bestTime : '- - -'} buttonMessage='Try Again?'/>}
        {isWinner && <GameEnd reset={this.handleResetGame} sessionTime={timer < 10 ? `00${timer}` : timer < 100 ? `0${timer}` : timer} bestTime={bestTime < 10 ? `00${bestTime}` : bestTime < 100 ? `0${bestTime}` : bestTime} buttonMessage='Play Again?'/>}
        <Header flagsLeft={flags} timeLeft={timer} />
        <div id="field" style={{
          gridTemplateRows: `repeat(${size[0]}, 1fr)`,
          gridTemplateColumns: `repeat(${size[1]}, 1fr)`
        }}>
          {field.map((s, t) => s.map((u, v) => {
            const { value, hidden, flagged, shade } = u
            const { handleUnhideCell, handleMultiUnhideCell, handleMultiUnhideCellSetup, handleFlagCell } = this
            const methods = {
              handleUnhideCell,
              handleMultiUnhideCell,
              handleMultiUnhideCellSetup,
              handleFlagCell
            }
            
            return <Cell
              key={`R${t}|C${v}`}
              value={value}
              hidden={hidden}
              flagged={flagged}
              shade={shade}
              width={difficulty === 'hard' ? 25 : 25}
              height={difficulty === 'hard' ? 25 : 25}
              row={t}
              column={v}
              methods={methods}
            />
          }))}
        </div>
      </>
		)
	}
}