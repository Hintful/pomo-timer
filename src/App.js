import logo from './logo.svg';
import './App.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import { Helmet } from 'react-helmet';
import ReactGA from 'react-ga';

const TITLE = "Pomo Timer";
const DEFAULT_STATE = {
  remainingMin: 25,
  remainingSec: 0,
  defaultFocusDuration: 25,
  defaultRestDuration: 5,
  completedPomos: 0,
  runTimer: false,
  focusTimer: true,
  settingsOpen: false
};
ReactGA.initialize("G-D3Z7LQS3WW");

const TICK_RATE = 1000; // default is 1s/1000ms

class Pomodoro extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      remainingMin: DEFAULT_STATE.remainingMin,
      remainingSec: DEFAULT_STATE.remainingSec,
      defaultFocusDuration: DEFAULT_STATE.defaultFocusDuration,
      defaultRestDuration: DEFAULT_STATE.defaultRestDuration,
      completedPomos: DEFAULT_STATE.completedPomos,
      runTimer: DEFAULT_STATE.runTimer,
      focusTimer: DEFAULT_STATE.focusTimer, // true if focus, false if reset
      settingsOpen: DEFAULT_STATE.settingsOpen
    }
    this.resume = this.resume.bind(this);
    this.pause = this.pause.bind(this);
    this.reset = this.reset.bind(this);
    this.triggerSettings = this.triggerSettings.bind(this);
    this.sessionIncrement = this.sessionIncrement.bind(this);
    this.sessionDecrement = this.sessionDecrement.bind(this);
    this.breakIncrement = this.breakIncrement.bind(this);
    this.breakDecrement = this.breakDecrement.bind(this);
  }
  componentDidMount() {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }
  tickSecond() { // tick one second
    if(this.state.runTimer) {
      if(this.state.remainingMin === 0 && this.state.remainingSec === 0) { // session complete
        // play sound here
        this.audioBeep.play();
        if(this.state.focusTimer) { // Focus session completed
          ReactGA.event({
            category: 'Pomo Timer User',
            action: 'Completed focus session'
          });
          this.setState(state => ({
            // switch to rest session
            completedPomos: state.completedPomos + 1,
            focusTimer: false,
            remainingMin: this.state.defaultRestDuration
          }));
        } else { // Rest session completed
          ReactGA.event({
            category: 'Pomo Timer User',
            action: 'Completed rest session'
          });
          this.setState({
            // switch to focus session
            focusTimer: true,
            remainingMin: this.state.defaultFocusDuration
          });
        }
      } else {
        if(this.state.remainingSec === 0) {
          this.setState(state => ({
            remainingMin: state.remainingMin - 1,
            remainingSec: 59
          }))
        } else {
          this.setState(state => ({
            remainingSec: state.remainingSec - 1
          }))
        }
      }
    }
  }
  resume() {
    ReactGA.event({
      category: 'Pomo Timer User',
      action: 'Pressed start/resume'
    });
    if(this.state.runTimer) { this.setState( { runTimer: false } ); }
    else {
      this.setState( { runTimer: true } );
      clearInterval(this.interval); // prevent interval stacking
      this.interval = setInterval(() => this.tickSecond(), TICK_RATE); // tick per 1000ms
    }
  }
  pause() {
    ReactGA.event({
      category: 'Pomo Timer User',
      action: 'Pressed pause'
    });
    this.setState( { runTimer: false } );
  }
  reset() {
    ReactGA.event({
      category: 'Pomo Timer User',
      action: 'Pressed reset'
    });
    this.audioBeep.currentTime = 0;
    this.audioBeep.pause();
    this.setState({
      remainingMin: DEFAULT_STATE.remainingMin,
      remainingSec: DEFAULT_STATE.remainingSec,
      defaultFocusDuration: DEFAULT_STATE.defaultFocusDuration,
      defaultRestDuration: DEFAULT_STATE.defaultRestDuration,
      completedPomos: DEFAULT_STATE.completedPomos,
      runTimer: DEFAULT_STATE.runTimer,
      focusTimer: DEFAULT_STATE.focusTimer,
      settingsOpen: DEFAULT_STATE.settingsOpen
    });
  }
  triggerSettings() {
    ReactGA.event({
      category: 'Pomo Timer User',
      action: 'Clicked settings'
    });
    this.setState(state => ({
      settingsOpen: !state.settingsOpen
    }))
  }
  sessionIncrement() {
    if(this.state.defaultFocusDuration < 60 && !this.state.runTimer) { 
      this.setState(state => ({ defaultFocusDuration: state.defaultFocusDuration + 1 }));
      if(this.state.focusTimer) { this.setState(state => ({ remainingMin: state.defaultFocusDuration, remainingSec: 0 }))}
    }
  }
  sessionDecrement() {
    if(this.state.defaultFocusDuration > 1 && !this.state.runTimer) {
      this.setState(state => ({ defaultFocusDuration: state.defaultFocusDuration - 1}));
      if(this.state.focusTimer) { this.setState(state => ({ remainingMin: state.defaultFocusDuration, remainingSec: 0 }))}
    }
  }
  breakIncrement() {
    if(this.state.defaultRestDuration < 60 && !this.state.runTimer) {
      this.setState(state => ({ defaultRestDuration: state.defaultRestDuration + 1 }));
      if(!this.state.focusTimer) { this.setState(state => ({ remainingMin: state.defaultRestDuration, remainingSec: 0 }))}
    }
  }
  breakDecrement() {
    if(this.state.defaultRestDuration > 1 && !this.state.runTimer) {
      this.setState(state => ({ defaultRestDuration: state.defaultRestDuration - 1 }));
      if(!this.state.focusTimer) { this.setState(state => ({ remainingMin: state.defaultRestDuration, remainingSec: 0 }))}
    }
  }
  render() {
    const startButton = <div class="button" id="start_stop" onClick={this.resume}>Start</div>;
    const pauseButton = <div class="button" id="start_stop" onClick={this.resume}>Pause</div>;
    
    const focusLabel = <div id="timer-label"><strong>Focus</strong><i class="fas fa-fire"></i></div>;
    const restLabel = <div id="timer-label">Rest</div>;
    
    const settings = 
          <div class="settings-overlay">
            <div class="settings-div">
              <div id="session-label">Focus Length: &nbsp;</div>
              <div id="session-length">{this.state.defaultFocusDuration}</div>
              <div class="adjust-button" id="session-increment" onClick={this.sessionIncrement}><i class="fas fa-plus"></i></div>
              <div class="adjust-button" id="session-decrement" onClick={this.sessionDecrement}><i class="fas fa-minus"></i></div>
              <div id="break-label">Rest Length: &nbsp;</div>
              <div id="break-length">{this.state.defaultRestDuration}</div>
              <div class="adjust-button" id="break-increment" onClick={this.breakIncrement}><i class="fas fa-plus"></i></div>
              <div class="adjust-button" id="break-decrement" onClick={this.breakDecrement}><i class="fas fa-minus"></i></div>
            </div>
            <div id="close-button" class="button" onClick={this.triggerSettings}>Close</div>
          </div>;
    
    let mainClass = "";
    
    if(this.state.focusTimer) { mainClass = "main bg-color-red" }
    else { mainClass = "main bg-color-green" }
    
    return (
      <div class={mainClass}>
        <div class="container">
          <div class="title">
            
          </div>
          { this.state.focusTimer ? focusLabel : restLabel }
          <div id="time-left">
            {pad(this.state.remainingMin, 2)}:{pad(this.state.remainingSec, 2)}
          </div>
          <div class="stats">
            Pomos: {this.state.completedPomos}
            {this.state.completedPomos > 0 && <span class="emoji">&#x1F345;</span>}
          </div>
          <div class="control-div">
            <div class="top-control-div">
              { this.state.runTimer ? pauseButton : startButton }
            </div>
            <div class="bottom-control-div">
              <div class="button" id="settings" onClick={this.triggerSettings}>Settings</div>
              <div class="button" id="reset" onClick={this.reset}>Reset</div>
            </div>
          </div>
        </div>
        { this.state.settingsOpen && settings }
        <div className="credit">
          Coded and designed by <u>Kurt Choi</u>
        </div>
        <audio id="beep" src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav" preload="auto" ref={(audio) => {this.audioBeep = audio}}/>
      </div>
      
    )
  }
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function App() {
  return (
    <div className="App">
      <Helmet>
        <title>{TITLE}</title>
      </Helmet>
      <Pomodoro />
    </div>
  );
}

export default App;
