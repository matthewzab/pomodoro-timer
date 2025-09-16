import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  // State variables
  const [timeLeft, setTimeLeft] = useState(3); // Time on the timer, 1500 seconds = 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [timerState, setTimerState] = useState('initial'); // Three different states, initial, running, paused
  const [pomoCount, setPomoCount] = useState(0);
  const completionRef = useRef(false);
  const [completionPopUp, setCompletionPopUp] = useState(false);
  const [todaysHarvest, setTodaysHarvest] = useState(0)
  const [lastCompletionDate, setLastCompletionDate] = useState(new Date().toDateString());
  const [testDate, setTestDate] = useState(new Date().toDateString()); // TESTING: Test a new date using this code, comment out when done testing
  const [lastDailyChallenge, setLastDailyChallenge] = useState(null);
  const [streakCount, setStreakCount] = useState(0);
  const [isStreakActive, setIsStreakActive] = useState(false);

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
    setTimeLeft(3);
    setIsRunning(false);
    setTimerState('initial');
    completionRef.current = false;
    setCompletionPopUp(false);
  };

  // Effect for timer completion logic
  useEffect(() => { 
    // console.log("useEffect running, timeLeft:", timeLeft, "isRunning:", isRunning);
    /**If isRunning and timeLeft are greater than 0
     * then decrease the timeLeft by one second */
    if (isRunning && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime === 1 && !completionRef.current) {
            console.log("Pomodoro completed!");
            completionRef.current = true; // Mark Completed
            setIsRunning(false);
            setCompletionPopUp(true);
            const today = testDate; // TESTING: Changed new Date().toDateString() to be testDate, change back after testing
            /* Check if it's a new day */
            console.log("Today: ", today);
            console.log("Last completion date: ", lastCompletionDate);
            console.log("Is new day? ", lastCompletionDate !== today);
            if (lastCompletionDate !== today) { 
              // It's a new day! Reset today's harvest!
              setTodaysHarvest(1);
              setLastCompletionDate(testDate);
            }
            else {
              // Same day, increment
              setTodaysHarvest(prevHarvest => prevHarvest + 1);
            }
            // Always increment pomoCount regardless of new day or not
            setPomoCount(prevCount => prevCount + 1);
            /* Check incriment of pomoCount using consolelog code below */
            // setPomoCount(prevCount => {
            //   const newCount = prevCount + 1;
            //   console.log("Pomodoros earned: ", newCount);
            //   return newCount;
            // });
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000); // Code runs every 1000ms(1 second)

      // Cleanup Function - runs when effect runs again or component unmounts
      return () => clearInterval(interval);
    }
  }, [isRunning, timeLeft]); // Dependencies - effect runs when either is changed

// Effect For keep track of completed daily challenge
useEffect(() => {
  if (todaysHarvest === 2) {
    console.log("Daily Challenge Completed!");
    const todayDate = new Date(testDate); // TESTING: added testDate, remove once done testing
    const lastDate = new Date(lastDailyChallenge);

    // Debugging logs to test streak incrementation logic
    console.log("testDate string:", testDate);
    console.log("todayDate object:", todayDate);
    console.log("lastDailyChallenge string:", lastDailyChallenge);
    console.log("lastDate object:", lastDate);
    console.log("Date difference in ms:", todayDate - lastDate);
    console.log("Date difference in days:", Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24)));

    if (lastDailyChallenge === null) {
      // First completion and addition to streak
      console.log("First daily challenge completed. Beginning streak!")
      setLastDailyChallenge(testDate); // TESTING: Changed new Date().toDateString() to be testDate, revert once testing is done
      setStreakCount(1);
    } else if (Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24)) === 1) { 
      console.log("Daily Challenge completed consecutively, incrementing streak!")
      setLastDailyChallenge(testDate); // TESTING: Changed new Date().toDateString() to be testDate, revert once testing is done
      setStreakCount(prevStreak => {
        const newStreak = prevStreak + 1;
        if (newStreak >= 3) { setIsStreakActive(true); }
        return newStreak;
      });
    } else {
      console.log("Streak broken!")
      setLastDailyChallenge(testDate); // TESTING: Changed new Date().toDateString() to be testDate, revert once testing is done
      setStreakCount(1);
      setIsStreakActive(false);
    }
    console.log("Current streakCount: ", streakCount);
    console.log("Current isStreakActive: ", isStreakActive);
  }
}, [todaysHarvest]);


  return (
    <div className="App">

      <div className="harvest-container">
        <h2>Today's Harvest</h2>
        <div className="pomo-display">
          {Array.from({ length: todaysHarvest }, (_, index) => (
            <span key={index} className="harvest-pomo">🍅</span>
          ))}
        </div>
      </div>

      <div className="timer-container">
        <div className="pomo-counter">🍅 {pomoCount}</div>
        <div className={`streak-counter ${isStreakActive ? 'active' : 'inactive'}`}>🔥 {streakCount}</div>
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
        </div>
        <button className="reset-btn" onClick={handleReset}>Reset</button>
      </div>

      <div className="empty-container">
        {/* Test new date */}
        {/* <button onClick={() => setTestDate("Sat Oct 01 2025")}>Test Date</button> */}
        <button onClick={() => setTestDate("Wed Sep 17 2025")}>Test Day 2</button>
        <button onClick={() => setTestDate("Thu Sep 18 2025")}>Test Day 3</button>
        <button onClick={() => setTestDate("Fri Sep 19 2025")}>Test Day 4</button>
        <button onClick={() => setTestDate("Sat Sep 20 2025")}>Test Day 5</button>
        <button onClick={() => setTestDate("Sun Sep 21 2025")}>Test Day 6</button>
        <button onClick={() => setTestDate("Sat Oct 01 2025")}>Test Broken Streak</button>
      </div>

      {completionPopUp === true && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Congratulations!</h2><br></br>
            <p>You completed a Pomodoro! 🍅</p>
            <p>Enjoy a 5 minute break!</p><br></br>
            <button className="continue-popupbtn" onClick={handleReset}>I did it!</button>
          </div>
        </div>
      )}
    </div> 
  );
}

export default App;