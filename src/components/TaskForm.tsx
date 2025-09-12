import React, { useState } from 'react'

interface Task {
  id: number;
  title: string;
  deadline?: string;
  completed: boolean;
  createdAt: string;
  priority: 'high' | 'medium' | 'low';
}

interface TaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDeadline, setNewTaskDeadline] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTaskTitle.trim() === '') return

    onAddTask({
      title: newTaskTitle.trim(),
      deadline: newTaskDeadline || undefined,
      completed: false,
      priority: newTaskPriority,
    })

    setNewTaskTitle('')
    setNewTaskDeadline('')
    setNewTaskPriority('medium')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <div className="add-task-form">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            className="task-input"
            required
          />
          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value as 'high' | 'medium' | 'low')}
            className="priority-select"
          >
            <option value="high">🔴 High Priority</option>
            <option value="medium">🟡 Medium Priority</option>
            <option value="low">🟢 Low Priority</option>
          </select>
          <input
            type="date"
            value={newTaskDeadline}
            onChange={(e) => setNewTaskDeadline(e.target.value)}
            className="date-input"
          />
          <button type="submit" className="add-btn">
            ➕ Add Task
          </button>
        </div>
      </form>
    </div>
  )
}

export default TaskForm