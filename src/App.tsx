import React, { useState, useEffect } from 'react'
import './App.css'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import CalendarView from './components/CalendarView'
import StatsView from './components/StatsView'

interface Task {
  id: number;
  title: string;
  deadline?: string;
  completed: boolean;
  createdAt: string;
}

type ViewType = 'list' | 'calendar' | 'stats'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentView, setCurrentView] = useState<ViewType>('list')

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  // Add new task
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      id: Date.now(),
      ...taskData,
      createdAt: new Date().toISOString()
    }
    setTasks([...tasks, newTask])
  }

  // Toggle task completion status
  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  // Delete task
  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  // Edit task
  const editTask = (id: number, newTitle: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, title: newTitle } : task
    ))
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'list':
        return (
          <TaskList
            tasks={tasks}
            onToggleTask={toggleTask}
            onEditTask={editTask}
            onDeleteTask={deleteTask}
          />
        )
      case 'calendar':
        return (
          <CalendarView
            tasks={tasks}
            onToggleTask={toggleTask}
          />
        )
      case 'stats':
        return (
          <StatsView tasks={tasks} />
        )
      default:
        return null
    }
  }

  return (
    <div className="todo-container">
      <div className="todo-header">
        <h1>📝 Student Time Management To-Do App</h1>
        <p>Manage your studies, assignments, and daily tasks</p>
      </div>

      {/* View Navigation */}
      <div className="view-navigation">
        <button
          className={`view-btn ${currentView === 'list' ? 'active' : ''}`}
          onClick={() => setCurrentView('list')}
        >
          📋 List View
        </button>
        <button
          className={`view-btn ${currentView === 'calendar' ? 'active' : ''}`}
          onClick={() => setCurrentView('calendar')}
        >
          📅 Calendar View
        </button>
        <button
          className={`view-btn ${currentView === 'stats' ? 'active' : ''}`}
          onClick={() => setCurrentView('stats')}
        >
          📊 Analytics
        </button>
      </div>

      {/* Task Form - Only show in list view */}
      {currentView === 'list' && <TaskForm onAddTask={addTask} />}

      {/* Task Statistics - Show in list and calendar views */}
      {(currentView === 'list' || currentView === 'calendar') && (
        <div className="task-stats">
          <div className="stat-item">
            <span className="stat-number">{tasks.length}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{tasks.filter(t => !t.completed).length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{tasks.filter(t => t.completed).length}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      )}

      {/* Current View Content */}
      {renderCurrentView()}

      {/* Footer information */}
      <div className="todo-footer">
        <p>💡 Tip: Switch between views to see your tasks from different perspectives</p>
      </div>
    </div>
  )
}

export default App