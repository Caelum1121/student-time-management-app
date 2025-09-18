import React, { useState } from 'react'

interface Task {
    id: number;
    title: string;
    deadline?: string;
    completed: boolean;
    createdAt: string;
    priority: 'high' | 'medium' | 'low';
    estimatedTime?: number; // in minutes
    actualTime?: number; // in minutes
}

interface CalendarViewProps {
    tasks: Task[];
    onToggleTask: (id: number) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onToggleTask }) => {
    const [currentDate, setCurrentDate] = useState(new Date())

    // Get tasks for a specific date
    const getTasksForDate = (date: Date) => {
        // 格式化日期為 YYYY-MM-DD，避免時區問題
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const dateString = `${year}-${month}-${day}`

        return tasks.filter(task => task.deadline === dateString)
    }

    // Generate calendar days
    const generateCalendarDays = () => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()

        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const startDate = new Date(firstDay)
        const endDate = new Date(lastDay)

        // Start from Monday of the week containing first day
        startDate.setDate(startDate.getDate() - (startDate.getDay() + 6) % 7)

        // End on Sunday of the week containing last day
        endDate.setDate(endDate.getDate() + (7 - endDate.getDay()) % 7)

        const days = []
        const current = new Date(startDate)

        while (current <= endDate) {
            days.push(new Date(current))
            current.setDate(current.getDate() + 1)
        }

        return days
    }

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev)
            if (direction === 'prev') {
                newDate.setMonth(newDate.getMonth() - 1)
            } else {
                newDate.setMonth(newDate.getMonth() + 1)
            }
            return newDate
        })
    }

    const goToToday = () => {
        setCurrentDate(new Date())
    }

    const isToday = (date: Date) => {
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === currentDate.getMonth()
    }

    const isPastDate = (date: Date) => {
        const today = new Date()
        // 只比較日期，不考慮時間
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        return dateOnly < todayDateOnly
    }

    const calendarDays = generateCalendarDays()
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    return (
        <div className="calendar-view">
            {/* Calendar Header */}
            <div className="calendar-header">
                <button onClick={() => navigateMonth('prev')} className="nav-btn">
                    ← Prev
                </button>
                <div className="month-year">
                    <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                </div>
                <button onClick={() => navigateMonth('next')} className="nav-btn">
                    Next →
                </button>
            </div>

            <button onClick={goToToday} className="today-btn">
                📅 Today
            </button>

            {/* Day names header */}
            <div className="calendar-days-header">
                {dayNames.map(day => (
                    <div key={day} className="day-header">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
                {calendarDays.map((date, index) => {
                    const dayTasks = getTasksForDate(date)
                    const completedTasks = dayTasks.filter(task => task.completed).length
                    const totalTasks = dayTasks.length

                    return (
                        <div
                            key={index}
                            className={`calendar-day ${
                                isToday(date) ? 'today' : ''
                            } ${
                                !isCurrentMonth(date) ? 'other-month' : ''
                            } ${
                                isPastDate(date) ? 'past-date' : ''
                            }`}
                        >
                            <div className="day-number">
                                {date.getDate()}
                            </div>

                            {totalTasks > 0 && (
                                <div className="day-tasks">
                                    <div className="task-summary">
                    <span className="task-count">
                      {completedTasks}/{totalTasks}
                    </span>
                                        {completedTasks === totalTasks && totalTasks > 0 && (
                                            <span className="all-done">✅</span>
                                        )}
                                    </div>

                                    <div className="task-list-mini">
                                        {dayTasks.slice(0, 2).map(task => (
                                            <div
                                                key={task.id}
                                                className={`mini-task ${task.completed ? 'completed' : ''}`}
                                                onClick={() => onToggleTask(task.id)}
                                            >
                        <span className="mini-checkbox">
                          {task.completed ? '✅' : '⭕'}
                        </span>
                                                <span className="mini-task-title">
                          {task.title.length > 15
                              ? task.title.substring(0, 15) + '...'
                              : task.title}
                        </span>
                                            </div>
                                        ))}
                                        {dayTasks.length > 2 && (
                                            <div className="more-tasks">
                                                +{dayTasks.length - 2} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Calendar Legend */}
            <div className="calendar-legend">
                <div className="legend-item">
                    <span className="legend-color today-legend"></span>
                    <span>Today</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color has-tasks-legend"></span>
                    <span>Has Tasks</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color completed-legend"></span>
                    <span>All Completed</span>
                </div>
            </div>
        </div>
    )
}

export default CalendarView