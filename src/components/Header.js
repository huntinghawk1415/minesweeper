import React from 'react'
import Flag from './svgs/Flag'
import Clock from './svgs/Clock'

export default ({ flagsLeft, timeLeft }) => <div id="field-header">
  <div id="flags-left">
    <Flag height='50%' width='auto' />
    <div className='header-text'>
      {
        flagsLeft < 10 ? `0${flagsLeft}` : flagsLeft
      }
    </div>
  </div>
  <div id="time-left">
    <Clock height='50%' width='auto' />
    <div className='header-text'>
    {
      timeLeft < 10
        ? `00${timeLeft}`
        : timeLeft < 100
          ? `0${timeLeft}`
          : timeLeft
    }
    </div>
  </div>
</div>