import React from 'react'

interface Task {
  id: number;
  title: string;
  deadline?: string;
  completed: boolean;
  createdAt: string;
  priority: 'high' | 'medium' | 'low';
}

interface StatsViewProps {
  tasks: Task[];
}

const StatsView: React.FC<StatsViewProps> = ({ tasks }) => {
  // Calculate statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.completed).length
  const pendingTasks = totalTasks - completedTasks
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Tasks by status
  const overdueTasks = tasks.filter(task => {
    if (!task.deadline || task.completed) return false
    return new Date(task.deadline) < new Date()
  }).length

  const dueTodayTasks = tasks.filter(task => {
    if (!task.deadline || task.completed) return false
    return new Date(task.deadline).toDateString() === new Date().toDateString()
  }).length

  const upcomingTasks = tasks.filter(task => {
    if (!task.deadline || task.completed) return false
    const today = new Date()
    const deadline = new Date(task.deadline)
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 && diffDays <= 7
  }).length

  // Tasks by priority
  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length
  const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length
  const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length

  // Tasks created this week
  const thisWeekTasks = tasks.filter(task => {
    const taskDate = new Date(task.createdAt)
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    return taskDate >= weekAgo
  }).length

  // Productivity metrics
  const productivity = tasks.length > 0 ? {
    averageTasksPerDay: (totalTasks / 30).toFixed(1), // Assuming 30-day period
    completionStreak: calculateCompletionStreak(tasks),
    mostProductiveDay: getMostProductiveDay(tasks)
  } : null

  function calculateCompletionStreak(tasks: Task[]): number {
    const completedTasksByDate = tasks
      .filter(task => task.completed)
      .reduce((acc, task) => {
        const date = new Date(task.createdAt).toDateString()
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const dates = Object.keys(completedTasksByDate).sort()
    let streak = 0
    let currentStreak = 0

    for (let i = dates.length - 1; i >= 0; i--) {
      const date = new Date(dates[i])
      const today = new Date()
      const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === currentStreak) {
        streak++
        currentStreak++
      } else {
        break
      }
    }

    return streak
  }

  function getMostProductiveDay(tasks: Task[]): string {
    const tasksByDay = tasks.reduce((acc, task) => {
      const day = new Date(task.createdAt).toLocaleDateString('en-US', { weekday: 'long' })
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostProductiveDay = Object.entries(tasksByDay)
      .sort(([,a], [,b]) => b - a)[0]

    return mostProductiveDay ? mostProductiveDay[0] : 'No data'
  }

  return (
    <div className="stats-view">
      <div className="stats-header">
        <h2>📊 Task Analytics</h2>
        <p>Your productivity insights and task statistics</p>
      </div>

      {/* Main Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{totalTasks}</h3>
            <p>Total Tasks</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{completedTasks}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{pendingTasks}</h3>
            <p>Pending</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{completionRate}%</h3>
            <p>Completion Rate</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <h3>Overall Progress</h3>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${completionRate}%` }}
          >
            <span className="progress-text">{completionRate}%</span>
          </div>
        </div>
      </div>

      {/* Priority Statistics */}
      <div className="deadline-stats">
        <h3>🏷️ Priority Distribution</h3>
        <div className="deadline-grid">
          <div className="deadline-item overdue">
            <span className="deadline-number">{highPriorityTasks}</span>
            <span className="deadline-label">High Priority</span>
          </div>
          <div className="deadline-item today">
            <span className="deadline-number">{mediumPriorityTasks}</span>
            <span className="deadline-label">Medium Priority</span>
          </div>
          <div className="deadline-item upcoming">
            <span className="deadline-number">{lowPriorityTasks}</span>
            <span className="deadline-label">Low Priority</span>
          </div>
        </div>
      </div>

      {/* Deadline Status */}
      <div className="deadline-stats">
        <h3>⏰ Deadline Status</h3>
        <div className="deadline-grid">
          <div className="deadline-item overdue">
            <span className="deadline-number">{overdueTasks}</span>
            <span className="deadline-label">Overdue</span>
          </div>
          <div className="deadline-item today">
            <span className="deadline-number">{dueTodayTasks}</span>
            <span className="deadline-label">Due Today</span>
          </div>
          <div className="deadline-item upcoming">
            <span className="deadline-number">{upcomingTasks}</span>
            <span className="deadline-label">This Week</span>
          </div>
        </div>
      </div>

      {/* Productivity Insights */}
      {productivity && (
        <div className="productivity-section">
          <h3>🚀 Productivity Insights</h3>
          <div className="insights-grid">
            <div className="insight-item">
              <div className="insight-icon">📅</div>
              <div className="insight-content">
                <h4>{productivity.averageTasksPerDay}</h4>
                <p>Avg Tasks/Day</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">🔥</div>
              <div className="insight-content">
                <h4>{productivity.completionStreak}</h4>
                <p>Day Streak</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">⭐</div>
              <div className="insight-content">
                <h4>{productivity.mostProductiveDay}</h4>
                <p>Most Productive</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>📝 Recent Activity</h3>
        <div className="activity-item">
          <span className="activity-icon">📊</span>
          <span>Tasks created this week: <strong>{thisWeekTasks}</strong></span>
        </div>
        <div className="activity-item">
          <span className="activity-icon">🎯</span>
          <span>Completion rate: <strong>{completionRate}% </strong>
            {completionRate >= 80 ? '(Excellent!)' : 
             completionRate >= 60 ? '(Good!)' : 
             completionRate >= 40 ? '(Fair)' : '(Needs improvement)'}
          </span>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="motivation-section">
        {completionRate >= 80 && (
          <div className="motivation excellent">
            🎉 Excellent work! You're crushing your tasks!
          </div>
        )}
        {completionRate >= 60 && completionRate < 80 && (
          <div className="motivation good">
            👍 Great job! Keep up the good momentum!
          </div>
        )}
        {completionRate >= 40 && completionRate < 60 && (
          <div className="motivation fair">
            💪 You're making progress! Stay focused!
          </div>
        )}
        {completionRate < 40 && totalTasks > 0 && (
          <div className="motivation needs-improvement">
            🎯 You've got this! Small steps lead to big achievements!
          </div>
        )}
        {totalTasks === 0 && (
          <div className="motivation empty">
            🚀 Ready to start? Add your first task and begin your productivity journey!
          </div>
        )}
      </div>
    </div>
  )
}

export default StatsView