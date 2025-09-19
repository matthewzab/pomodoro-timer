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
  const [streakInactivePopUp, setStreakInactivePopUp] = useState(false);
  const [streakActivePopUp, setStreakActivePopUp] = useState(false);

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

  const handleStreakInactiveClose = () => {
    setStreakInactivePopUp(false);
    setCompletionPopUp(true);
  }

  const handleStreakActiveClose = () => {
    setStreakActivePopUp(false);
    setCompletionPopUp(true);
  }

  // Effect for timer completion 
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
            const today = testDate; // TESTING: Changed new Date().toDateString() to be testDate, change back after testing
            /* Check if it's a new day */
            console.log("Today: ", today);
            console.log("Last completion date: ", lastCompletionDate);
            console.log("Is new day? ", lastCompletionDate !== today);
            if (pomoCount === 0) {
              // Users first pomo! Last completion date will be equal to today because its day 1.
              console.log("User's First EVER Pomo Awarded!");
              setTodaysHarvest(1);
              setLastCompletionDate(testDate);
              setCompletionPopUp(true);
            }
            else if (lastCompletionDate !== today) { 
              // It's a new day! Reset today's harvest!
              console.log("It's a new day we are starting a new harvest");
              setTodaysHarvest(1);
              setLastCompletionDate(testDate);
              setCompletionPopUp(true);
            }
            else {
              // Same day, increment
              console.log("It's not a new day we are incrementing");
              if (todaysHarvest === 1) {
                ((streakCount < 2) ? setStreakInactivePopUp(true) : setStreakActivePopUp(true));
              } else {
                setCompletionPopUp(true);
              }
              setTodaysHarvest(prevHarvest => prevHarvest + 1);
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000); // Code runs every 1000ms(1 second)

      // Cleanup Function - runs when effect runs again or component unmounts
      return () => clearInterval(interval);
    }
  }, [isRunning, timeLeft]); // Dependencies - effect runs when either is changed

// Effect for streak handling + pomodoro awarding
useEffect(() => {
  const todayDate = new Date(testDate); // TESTING: added testDate, remove once done testing
  const lastDate = new Date(lastDailyChallenge);
  
  // Debugging logs to test streak incrementation logic
  // console.log("testDate string:", testDate);
  // console.log("todayDate object:", todayDate);
  // console.log("lastDailyChallenge string:", lastDailyChallenge);
  // console.log("lastDate object:", lastDate);
  // console.log("Date difference in ms:", todayDate - lastDate);
  // console.log("Date difference in days:", Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24)));
  
  if (todaysHarvest === 0) {
    console.log("Screen has loaded. User has not completed Pomodoro yet. Do nothing.");
  } 
  else if (todaysHarvest === 1) {
    // Day 1
    if (lastDailyChallenge === null) {
      // There is no streak. Daily challenge has never been completed.
      console.log("Streak does not exist. Awarding 1 pomo")
      setPomoCount(prevCount => prevCount + 1);
    } 
    // Days 2+, lastDailyChallenge should be set by now
    else if (Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24)) === 1) {
      /* If there is a streak, check to see if it is consecutive.
       * If it is consecutive award pomodoro + streak bonus if the streak is active */
      console.log("Streak exists! Streak is consecutive! Incrementing pomoCount accoardingly")
      setPomoCount(prevCount => prevCount + (isStreakActive ? 1 + streakCount : 1));
    } else {
      // Streak is not consecutive, todayDate - lastDate != 1, Streak is broken and should be set as if it no longer exists.
      console.log("Streak exists but is not consecutive! Awarding 1 pomo. Setting isStreakActive(false)")
      setIsStreakActive(false);
      setStreakCount(0);
      setLastDailyChallenge(null);
      setPomoCount(prevCount => prevCount + 1);
    } 
  } 
  else if (todaysHarvest === 2) { 
    // Daily challenge has been completed! lastDailyChallenge should be set
    // Day 1
    if (lastDailyChallenge === null) {
      // First daily challenge completed!
      console.log("First daily challenge completed! Congratulations!");
      setLastDailyChallenge(testDate); // TESTING: Changed new Date().toDateString() to be testDate, revert once testing is done
      setStreakCount(1);
      setPomoCount(prevCount => prevCount + 1);
    }
    // Day 2
    else if (streakCount === 1) {
      console.log("Day 2: Daily challenge completed!");
      setLastDailyChallenge(testDate); // TESTING: Changed new Date().toDateString() to be testDate, revert once testing is done
      setStreakCount(prevStreak => prevStreak + 1);
      setPomoCount(prevCount => prevCount + 1);
    }
    // Day 3
    else if (streakCount === 2) {
      // Streak is being incremented here and bonus pomos should be awarded
      console.log("Day 3: Daily Challenge completed! Streak is now active. 1 + 3 pomos awarded");
      setLastDailyChallenge(testDate); // TESTING: Changed new Date().toDateString() to be testDate, revert once testing is done
      setIsStreakActive(true);
      setStreakCount(prevStreak => prevStreak + 1);
      setPomoCount(prevCount => prevCount + 1 + 3); // Manually awarding 3 bonus pomodoros
    }
    // Days 4+
    else {
      // Streak is being incremented here. Bonus pomos of the next streak bonus should be awarded here.
      console.log(`Days 4+: Daily Challenge completed! Streak is already active. 1 + ${streakCount + 1} pomos awarded!`)
      setLastDailyChallenge(testDate); // TESTING: Changed new Date().toDateString() to be testDate, revert once testing is done
      setStreakCount(prevStreak => prevStreak + 1);
      setPomoCount(prevCount => prevCount + 1 + streakCount + 1); // Manually adding 1 extra pomo since accurate streakCount is not readily available in this call.
    }
  }
  else {
    // Any extra pomodoros earned after completion of daily challenge. State variables used here are readily available
    setPomoCount(prevCount => prevCount + (isStreakActive ? 1 + streakCount : 1));
    if (isStreakActive) {
      console.log(`Streak is active. 1 + ${streakCount} pomos awarded`);
    } else {
      console.log("Streak is not active. 1 pomo awarded");
    }
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
        <button onClick={() => setTestDate("Fri Sep 19 2025")}>Test Day 2</button>
        <button onClick={() => setTestDate("Sat Sep 20 2025")}>Test Day 3</button>
        <button onClick={() => setTestDate("Sun Sep 21 2025")}>Test Day 4</button>
        <button onClick={() => setTestDate("Mon Sep 22 2025")}>Test Day 5</button>
        <button onClick={() => setTestDate("Tue Sep 23 2025")}>Test Day 6</button>
        <button onClick={() => setTestDate("Sat Oct 01 2025")}>Test Broken Streak</button>
      </div>
      
      {streakInactivePopUp === true && (
        <div className="popup-overlay">
          <div className="streak-popup-box">
            <h2>Daily Challenge Completed!</h2><br></br>
            <p className="number-award">+1 🔥</p><br />
            <p>Reach a streak of 🔥3 to earn a streak bonus! 🍅🍅🍅</p><br></br>
            <button className="continue-popupbtn" onClick={handleStreakInactiveClose}>Woohoo!</button>
          </div>
        </div>
      )}

      {streakActivePopUp === true && (
        <div className="popup-overlay">
          <div className="streak-popup-box">
            <h2>Daily Challenge Completed!</h2>
            <h3 className="streak-color">Streak Bonus ON!</h3><br></br>
            <p className="number-award">+1 🔥</p><br />
            <p>Complete the daily challenge again tomorrow to keep your streak! 🍅🍅🍅</p><br></br>
            <button className="continue-popupbtn" onClick={handleStreakActiveClose}>Woohoo!</button>
          </div>
        </div>
      )}

      {completionPopUp === true && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Congratulations!</h2><br></br>
            <p>You completed a Pomodoro! 🍅</p>
            <p>You've earned: </p><br></br>
            <div>
              {isStreakActive ? (
                <p className="number-award">1 <span className="streak-color">+ {streakCount}</span> 🍅🍅🍅</p>
              ) : (
                <p className="number-award">+1 🍅</p>
              )}
            </div><br></br>
            <p>Enjoy a 5 minute break!</p><br></br>
            <button className="continue-popupbtn" onClick={handleReset}>I did it!</button>
          </div>
        </div>
      )}
    </div> 
  );
}

export default App;