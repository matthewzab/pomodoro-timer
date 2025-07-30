import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State variables
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);

  // Functions
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
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
      <div className="timer-container">
        <svg className="progress-ring" width="300" height="300">
          <circle
            className="progress-ring-background"
            cx="150"
            cy="150"
            r="120"
          />
          <circle
            className="progress-ring-circle"
            cx="150"
            cy="150"
            r="120"
            style={{
              strokeDasharray: `${2 * Math.PI * 120}`,
              strokeDashoffset: `${2 * Math.PI * 120 * (timeLeft / 1500)}`
            }}
          />
        </svg>
        <div className="timer-display">{formatTime(timeLeft)}</div>
      </div>
      <div className="button-container">
        <button className="start-btn" onClick={() => setIsRunning(true)}>Start</button>
        <button className="pause-btn" onClick={() => setIsRunning(false)}>Pause</button>
        <button className="reset-btn" onClick={() => {setTimeLeft(1500); setIsRunning(false);}}>Reset</button>
      </div>
    </div>
  );
}

export default App;