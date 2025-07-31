import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State variables
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [timerState, setTimerState] = useState('initial'); // Three different states, initial, running, paused

  // Functions
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleTomatoClick = () => {
    if (timerState === 'initial') {
      setTimerState('running');
      setIsRunning(true);
    } else if (timerState === 'running') {
      setTimerState('paused');
      setIsRunning(false);
    } else if (timerState === 'paused') {
      setTimerState('running');
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setTimeLeft(1500);
    setIsRunning(false);
    setTimerState('initial');
  };

  // useEffect
  useEffect(() => { // Setup
    /**If isRunning and timeLeft are greater than 0
     * then decrease the timeLeft by one second */
    if (isRunning && timeLeft > 0) {
      const interval = setInterval(() => {
        // Code runs every 1000ms(1 second)
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);

      // Cleanup Function - runs when effect runs again or component unmounts
      return () => clearInterval(interval);
    }
  }, [isRunning, timeLeft]); // Dependencies - effect runs when either is changed

  return (
    <div className="App">
      <h1>Pomodoro Timer</h1>
      <div className={`tomato ${timerState}`} onClick={handleTomatoClick}>
        <div className="tomato-stem"></div>
        <div className="tomato-content">
          {timerState === 'initial' && <span className="start-text">START</span>}
          {timerState === 'running' && <span className="timer-text">{formatTime(timeLeft)}</span>}
          {timerState === 'paused' && (
            <>
              <div className="pause-icon">🍅</div>
              <span className="small-time">{formatTime(timeLeft)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;