import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  // State variables
  const [timeLeft, setTimeLeft] = useState(5); // Time on the timer, 1500 seconds = 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [timerState, setTimerState] = useState('initial'); // Three different states, initial, running, paused
  const [pomoCount, setPomoCount] = useState(0);
  const completionRef = useRef(false);

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
    setTimeLeft(5);
    setIsRunning(false);
    setTimerState('initial');
    completionRef.current = false;
  };

  // useEffect
  useEffect(() => { // Setup
    console.log("useEffect running, timeLeft:", timeLeft, "isRunning:", isRunning);
    /**If isRunning and timeLeft are greater than 0
     * then decrease the timeLeft by one second */
    if (isRunning && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime === 1 && !completionRef.current) {
            console.log("Pomodoro completed!");
            completionRef.current = true; // Mark Completed
            setIsRunning(false);
            // setPomoCount(prevCount => prevCount + 1);
            setPomoCount(prevCount => {
              const newCount = prevCount + 1;
              console.log("Pomodoros earned: ", newCount);
              return newCount;
            });
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000); // Code runs every 1000ms(1 second)

      // Cleanup Function - runs when effect runs again or component unmounts
      return () => clearInterval(interval);
    }
  }, [isRunning, timeLeft]); // Dependencies - effect runs when either is changed

  return (
    <div className="App">
      <h1>Pomodoro Timer</h1>

      <div className="tomato-section">
        <div className={`tomato ${timerState}`} onClick={handleTomatoClick}>
          <div className="tomato-emoji">🍅</div>
          <div className="tomato-content">
            {timerState === 'initial' && <span className="start-text">START</span>}
            {timerState === 'running' && <span className="timer-text">{formatTime(timeLeft)}</span>}
            {timerState === 'paused' && <div className="pause-icon">⏸</div>}
          </div>
        </div>

        {timerState === 'paused' && (
          <div className="external-timer">{formatTime(timeLeft)}</div>
        )}

        <button className="reset-btn" onClick={handleReset}>Reset</button>
      </div>

      <div></div> {/*For spacing purposes*/}
    </div>
      
  );
}

export default App;