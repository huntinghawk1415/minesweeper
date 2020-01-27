import React from 'react'
import Clock from './svgs/Clock'
import Trophy from './svgs/Trophy'

export default ({ reset, sessionTime, bestTime, buttonMessage }) => <div id="game-end-container">
  <div id="game-end-modal">
    <div id="session-time">
      <Clock height='30%' width='auto'/>
      <div className="game-end-text">{sessionTime}</div>
    </div>
    <div id="best-time">
      <Trophy height='30%' width='auto'/>
      <div className="game-end-text">{bestTime}</div>
    </div>
  </div>
  <button id="reset-button" onClick={reset}>{buttonMessage}</button>
</div>