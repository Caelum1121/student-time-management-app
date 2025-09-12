import React from 'react'

interface Task {
  id: number;
  title: string;
  deadline?: string;
  completed: boolean;
  createdAt: string;
  priority: 'high' | 'medium' | 'low';
}

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: number) => void;
  onEditTask: (id: number, newTitle: string) => void;
  onDeleteTask: (id: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleTask,
  onEditTask,
  onDeleteTask
}) => {
  // Format date display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return `Overdue ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`
    } else if (diffDays === 0) {
      return 'Due today'
    } else if (diffDays === 1) {
      return 'Due tomorrow'
    } else {
      return `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`
    }
  }

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '🟡'
    }
  }

  const getPriorityLabel = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'High Priority'
      case 'medium': return 'Medium Priority'
      case 'low': return 'Low Priority'
      default: return 'Medium Priority'
    }
  }

  const handleEdit = (task: Task) => {
    const newTitle = prompt('Edit task:', task.title)
    if (newTitle && newTitle.trim()) {
      onEditTask(task.id, newTitle.trim())
    }
  }

  return (
    <div className="task-list">
      {tasks.length === 0 ? (
        <div className="empty-state">
          <p>🎯 No tasks yet, start adding some!</p>
        </div>
      ) : (
        tasks.map(task => (
          <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
            <div className="task-content">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleTask(task.id)}
                className="task-checkbox"
              />
              <div className="task-details">
                <span className="task-title">{task.title}</span>
                <div className="task-meta">
                  <span className={`task-priority priority-${task.priority}`}>
                    {getPriorityIcon(task.priority)} {getPriorityLabel(task.priority)}
                  </span>
                  {task.deadline && (
                    <span className={`task-deadline ${
                      new Date(task.deadline) < new Date() ? 'overdue' : 
                      new Date(task.deadline).toDateString() === new Date().toDateString() ? 'today' : ''
                    }`}>
                      📅 {formatDate(task.deadline)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="task-actions">
              <button 
                onClick={() => handleEdit(task)}
                className="edit-btn"
                title="Edit task"
              >
                ✏️
              </button>
              <button 
                onClick={() => onDeleteTask(task.id)}
                className="delete-btn"
                title="Delete task"
              >
                🗑️
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default TaskList