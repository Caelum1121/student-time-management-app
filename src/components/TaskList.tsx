import React from 'react'

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

interface TaskListProps {
    tasks: Task[];
    onToggleTask: (id: number) => void;
    onDeleteTask: (id: number) => void;
    onOpenEditModal: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({
                                               tasks,
                                               onToggleTask,
                                               onDeleteTask,
                                               onOpenEditModal
                                           }) => {
    // Format date display
    const formatDate = (dateString: string) => {
        const taskDate = new Date(dateString + 'T00:00:00') // 避免時區問題
        const today = new Date()

        // 只比較日期部分，不考慮時間
        const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate())
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

        const diffTime = taskDateOnly.getTime() - todayDateOnly.getTime()
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

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
                                            (() => {
                                                const taskDate = new Date(task.deadline + 'T00:00:00')
                                                const today = new Date()
                                                const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate())
                                                const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

                                                if (taskDateOnly < todayDateOnly) return 'overdue'
                                                if (taskDateOnly.getTime() === todayDateOnly.getTime()) return 'today'
                                                return ''
                                            })()
                                        }`}>
                      📅 {formatDate(task.deadline)}
                    </span>
                                    )}
                                    {task.estimatedTime && (
                                        <span className="task-estimated-time">
                      ⏱️ ~{task.estimatedTime}min
                    </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="task-actions">
                            <button
                                onClick={() => onOpenEditModal(task)}
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