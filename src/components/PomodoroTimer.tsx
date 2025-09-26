import React, { useState, useEffect, useRef } from 'react'

interface Task {
    id: number;
    title: string;
    deadline?: string;
    completed: boolean;
    createdAt: string;
    priority: 'high' | 'medium' | 'low';
    estimatedTime?: number;
    actualTime?: number;
}

interface PomodoroTimerProps {
    tasks: Task[];
    onUpdateTask: (id: number, updates: Partial<Task>) => void;
}

interface PomodoroSession {
    id: string;
    taskId?: number;
    taskTitle: string;
    startTime: string;
    endTime?: string;
    duration: number; // in minutes
    type: 'work' | 'shortBreak' | 'longBreak';
    completed: boolean;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ tasks, onUpdateTask }) => {
    // Timer states
    const [isRunning, setIsRunning] = useState(false)
    const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
    const [currentSession, setCurrentSession] = useState<'work' | 'shortBreak' | 'longBreak'>('work')
    const [sessionsCompleted, setSessionsCompleted] = useState(0)
    
    // Task integration
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
    const [timeSpentOnTask, setTimeSpentOnTask] = useState(0)
    
    // Session history
    const [sessionHistory, setSessionHistory] = useState<PomodoroSession[]>([])
    
    // Settings
    const [settings, setSettings] = useState({
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4,
        autoStartBreaks: false,
        autoStartWork: false,
        soundEnabled: true
    })
    
    // UI states
    const [showSettings, setShowSettings] = useState(false)
    const [showHistory, setShowHistory] = useState(false)
    
    const intervalRef = useRef<number | null>(null)
    const startTimeRef = useRef<Date | null>(null)
    
    // Load saved data on mount
    useEffect(() => {
        const savedSessions = localStorage.getItem('pomodoro-sessions')
        const savedSettings = localStorage.getItem('pomodoro-settings')
        const savedProgress = localStorage.getItem('pomodoro-progress')
        
        if (savedSessions) {
            setSessionHistory(JSON.parse(savedSessions))
        }
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings))
        }
        if (savedProgress) {
            const progress = JSON.parse(savedProgress)
            setSessionsCompleted(progress.sessionsCompleted || 0)
        }
    }, [])
    
    // Save session history
    useEffect(() => {
        localStorage.setItem('pomodoro-sessions', JSON.stringify(sessionHistory))
    }, [sessionHistory])
    
    // Save settings
    useEffect(() => {
        localStorage.setItem('pomodoro-settings', JSON.stringify(settings))
    }, [settings])
    
    // Save progress
    useEffect(() => {
        localStorage.setItem('pomodoro-progress', JSON.stringify({ sessionsCompleted }))
    }, [sessionsCompleted])
    
    // Timer logic
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = window.setInterval(() => {
                setTimeLeft(prev => prev - 1)
                if (selectedTaskId && currentSession === 'work') {
                    setTimeSpentOnTask(prev => prev + 1)
                }
            }, 1000)
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isRunning, timeLeft, selectedTaskId, currentSession])
    
    // Handle session completion
    useEffect(() => {
        if (timeLeft === 0 && isRunning) {
            handleSessionComplete()
        }
    }, [timeLeft, isRunning])
    
    const startTimer = () => {
        setIsRunning(true)
        startTimeRef.current = new Date()
        
        if (settings.soundEnabled) {
            playNotificationSound()
        }
    }
    
    const pauseTimer = () => {
        setIsRunning(false)
        
        // Save partial session if working on a task
        if (selectedTaskId && currentSession === 'work' && startTimeRef.current) {
            const sessionDuration = Math.round((Date.now() - startTimeRef.current.getTime()) / 1000 / 60)
            updateTaskTime(selectedTaskId, sessionDuration)
        }
    }
    
    const resetTimer = () => {
        setIsRunning(false)
        setTimeLeft(getCurrentSessionDuration() * 60)
        setTimeSpentOnTask(0)
        startTimeRef.current = null
    }
    
    const handleSessionComplete = () => {
        setIsRunning(false)
        
        // Record completed session
        const session: PomodoroSession = {
            id: Date.now().toString(),
            taskId: selectedTaskId || undefined,
            taskTitle: selectedTaskId ? getTaskTitle(selectedTaskId) : 'Focus Session',
            startTime: startTimeRef.current?.toISOString() || new Date().toISOString(),
            endTime: new Date().toISOString(),
            duration: getCurrentSessionDuration(),
            type: currentSession,
            completed: true
        }
        
        setSessionHistory(prev => [...prev, session])
        
        // Update task time if working on a task
        if (selectedTaskId && currentSession === 'work') {
            updateTaskTime(selectedTaskId, getCurrentSessionDuration())
        }
        
        // Update session count and switch session type
        if (currentSession === 'work') {
            const newSessionsCompleted = sessionsCompleted + 1
            setSessionsCompleted(newSessionsCompleted)
            
            // Determine next session type
            if (newSessionsCompleted % settings.sessionsUntilLongBreak === 0) {
                setCurrentSession('longBreak')
                setTimeLeft(settings.longBreakDuration * 60)
            } else {
                setCurrentSession('shortBreak')
                setTimeLeft(settings.shortBreakDuration * 60)
            }
            
            if (settings.autoStartBreaks) {
                setTimeout(() => startTimer(), 1000)
            }
        } else {
            setCurrentSession('work')
            setTimeLeft(settings.workDuration * 60)
            
            if (settings.autoStartWork) {
                setTimeout(() => startTimer(), 1000)
            }
        }
        
        // Play completion sound
        if (settings.soundEnabled) {
            playCompletionSound()
        }
        
        // Show browser notification
        showNotification()
        
        setTimeSpentOnTask(0)
        startTimeRef.current = null
    }
    
    const updateTaskTime = (taskId: number, minutes: number) => {
        const task = tasks.find(t => t.id === taskId)
        if (task) {
            const newActualTime = (task.actualTime || 0) + minutes
            onUpdateTask(taskId, { actualTime: newActualTime })
        }
    }
    
    const getCurrentSessionDuration = () => {
        switch (currentSession) {
            case 'work': return settings.workDuration
            case 'shortBreak': return settings.shortBreakDuration
            case 'longBreak': return settings.longBreakDuration
            default: return settings.workDuration
        }
    }
    
    const getTaskTitle = (taskId: number) => {
        const task = tasks.find(t => t.id === taskId)
        return task ? task.title : 'Unknown Task'
    }
    
    const playNotificationSound = () => {
        // Create a simple beep sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = 800
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
    }
    
    const playCompletionSound = () => {
        // Create a completion melody
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const frequencies = [523, 659, 784] // C, E, G
        
        frequencies.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            oscillator.frequency.value = freq
            oscillator.type = 'sine'
            
            const startTime = audioContext.currentTime + (index * 0.2)
            gainNode.gain.setValueAtTime(0.2, startTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)
            
            oscillator.start(startTime)
            oscillator.stop(startTime + 0.3)
        })
    }
    
    const showNotification = () => {
        if ('Notification' in window && Notification.permission === 'granted') {
            const message = currentSession === 'work' 
                ? '🍅 Work session completed! Time for a break.'
                : '✨ Break time is over! Ready to focus?'
            
            new Notification('Pomodoro Timer', {
                body: message,
                icon: '🍅'
            })
        }
    }
    
    const requestNotificationPermission = () => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }
    }
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    
    const getProgressPercentage = () => {
        const totalTime = getCurrentSessionDuration() * 60
        return ((totalTime - timeLeft) / totalTime) * 100
    }
    
    const getTodayStats = () => {
        const today = new Date().toDateString()
        const todaySessions = sessionHistory.filter(session => 
            new Date(session.startTime).toDateString() === today
        )
        
        const workSessions = todaySessions.filter(s => s.type === 'work').length
        const totalMinutes = todaySessions
            .filter(s => s.type === 'work')
            .reduce((sum, s) => sum + s.duration, 0)
        
        return { workSessions, totalMinutes }
    }
    
    const getSessionTypeIcon = () => {
        switch (currentSession) {
            case 'work': return '🍅'
            case 'shortBreak': return '☕'
            case 'longBreak': return '🛋️'
            default: return '🍅'
        }
    }
    
    const getSessionTypeLabel = () => {
        switch (currentSession) {
            case 'work': return 'Focus Time'
            case 'shortBreak': return 'Short Break'
            case 'longBreak': return 'Long Break'
            default: return 'Focus Time'
        }
    }
    
    const pendingTasks = tasks.filter(task => !task.completed)
    const todayStats = getTodayStats()
    
    return (
        <div className="pomodoro-timer">
            <div className="pomodoro-header">
                <h2>🍅 Pomodoro Timer</h2>
                <p>Stay focused with the Pomodoro Technique</p>
            </div>
            
            {/* Main Timer Display */}
            <div className="timer-main">
                <div className="timer-circle">
                    <svg viewBox="0 0 200 200" className="progress-ring">
                        <circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            stroke="#e1e5e9"
                            strokeWidth="8"
                        />
                        <circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            stroke={currentSession === 'work' ? '#dc3545' : '#28a745'}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 90}`}
                            strokeDashoffset={`${2 * Math.PI * 90 * (1 - getProgressPercentage() / 100)}`}
                            transform="rotate(-90 100 100)"
                            className="progress-circle"
                        />
                    </svg>
                    
                    <div className="timer-content">
                        <div className="session-type">
                            <span className="session-icon">{getSessionTypeIcon()}</span>
                            <span className="session-label">{getSessionTypeLabel()}</span>
                        </div>
                        <div className="timer-display">{formatTime(timeLeft)}</div>
                        <div className="session-info">
                            Session {sessionsCompleted + 1}
                        </div>
                    </div>
                </div>
                
                {/* Timer Controls */}
                <div className="timer-controls">
                    {!isRunning ? (
                        <button onClick={startTimer} className="control-btn start-btn">
                            ▶️ Start
                        </button>
                    ) : (
                        <button onClick={pauseTimer} className="control-btn pause-btn">
                            ⏸️ Pause
                        </button>
                    )}
                    <button onClick={resetTimer} className="control-btn reset-btn">
                        🔄 Reset
                    </button>
                </div>
            </div>
            
            {/* Task Selection for Work Sessions */}
            {currentSession === 'work' && (
                <div className="task-selection">
                    <h3>🎯 Focus on Task (Optional)</h3>
                    <select 
                        value={selectedTaskId || ''} 
                        onChange={(e) => setSelectedTaskId(e.target.value ? Number(e.target.value) : null)}
                        className="task-select"
                    >
                        <option value="">Select a task to work on...</option>
                        {pendingTasks.map(task => (
                            <option key={task.id} value={task.id}>
                                {task.title} {task.estimatedTime ? `(~${task.estimatedTime}min)` : ''}
                            </option>
                        ))}
                    </select>
                    
                    {selectedTaskId && (
                        <div className="selected-task-info">
                            <p>✅ Working on: <strong>{getTaskTitle(selectedTaskId)}</strong></p>
                            <p>⏱️ Time spent this session: <strong>{Math.floor(timeSpentOnTask / 60)}m {timeSpentOnTask % 60}s</strong></p>
                        </div>
                    )}
                </div>
            )}
            
            {/* Statistics */}
            <div className="pomodoro-stats">
                <h3>📊 Today's Progress</h3>
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-number">{todayStats.workSessions}</span>
                        <span className="stat-label">Pomodoros</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{todayStats.totalMinutes}</span>
                        <span className="stat-label">Minutes Focused</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{sessionsCompleted}</span>
                        <span className="stat-label">Total Sessions</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">
                            {sessionsCompleted > 0 ? Math.floor(sessionsCompleted / settings.sessionsUntilLongBreak) : 0}
                        </span>
                        <span className="stat-label">Long Breaks Earned</span>
                    </div>
                </div>
            </div>
            
            {/* Quick Actions */}
            <div className="quick-actions">
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="action-btn"
                >
                    ⚙️ Settings
                </button>
                <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className="action-btn"
                >
                    📈 History
                </button>
                <button 
                    onClick={requestNotificationPermission}
                    className="action-btn"
                >
                    🔔 Enable Notifications
                </button>
            </div>
            
            {/* Settings Panel */}
            {showSettings && (
                <div className="settings-panel">
                    <h3>⚙️ Timer Settings</h3>
                    <div className="settings-grid">
                        <div className="setting-item">
                            <label>Work Duration (minutes):</label>
                            <input
                                type="number"
                                min="1"
                                max="60"
                                value={settings.workDuration}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    workDuration: Number(e.target.value)
                                }))}
                            />
                        </div>
                        <div className="setting-item">
                            <label>Short Break (minutes):</label>
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={settings.shortBreakDuration}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    shortBreakDuration: Number(e.target.value)
                                }))}
                            />
                        </div>
                        <div className="setting-item">
                            <label>Long Break (minutes):</label>
                            <input
                                type="number"
                                min="1"
                                max="60"
                                value={settings.longBreakDuration}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    longBreakDuration: Number(e.target.value)
                                }))}
                            />
                        </div>
                        <div className="setting-item">
                            <label>Sessions until Long Break:</label>
                            <input
                                type="number"
                                min="2"
                                max="8"
                                value={settings.sessionsUntilLongBreak}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    sessionsUntilLongBreak: Number(e.target.value)
                                }))}
                            />
                        </div>
                        <div className="setting-item checkbox-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={settings.autoStartBreaks}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        autoStartBreaks: e.target.checked
                                    }))}
                                />
                                Auto-start breaks
                            </label>
                        </div>
                        <div className="setting-item checkbox-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={settings.autoStartWork}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        autoStartWork: e.target.checked
                                    }))}
                                />
                                Auto-start work sessions
                            </label>
                        </div>
                        <div className="setting-item checkbox-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={settings.soundEnabled}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        soundEnabled: e.target.checked
                                    }))}
                                />
                                Sound notifications
                            </label>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Session History */}
            {showHistory && (
                <div className="history-panel">
                    <h3>📈 Session History</h3>
                    {sessionHistory.length === 0 ? (
                        <p>No sessions completed yet. Start your first Pomodoro! 🍅</p>
                    ) : (
                        <div className="history-list">
                            {sessionHistory.slice(-10).reverse().map(session => (
                                <div key={session.id} className="history-item">
                                    <span className="history-icon">
                                        {session.type === 'work' ? '🍅' : 
                                         session.type === 'shortBreak' ? '☕' : '🛋️'}
                                    </span>
                                    <div className="history-details">
                                        <div className="history-task">{session.taskTitle}</div>
                                        <div className="history-meta">
                                            {new Date(session.startTime).toLocaleDateString()} • 
                                            {session.duration} minutes • 
                                            {session.type === 'work' ? 'Work' : 
                                             session.type === 'shortBreak' ? 'Short Break' : 'Long Break'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            {/* Tips */}
            <div className="pomodoro-tips">
                <h3>💡 Pomodoro Tips</h3>
                <div className="tips-grid">
                    <div className="tip-item">
                        <span>🎯</span>
                        <p>Choose ONE task to focus on during each 25-minute session</p>
                    </div>
                    <div className="tip-item">
                        <span>📱</span>
                        <p>Turn off notifications and distractions during work sessions</p>
                    </div>
                    <div className="tip-item">
                        <span>🚶</span>
                        <p>Use breaks to move around, stretch, or get fresh air</p>
                    </div>
                    <div className="tip-item">
                        <span>📝</span>
                        <p>Note down interrupting thoughts to deal with later</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PomodoroTimer