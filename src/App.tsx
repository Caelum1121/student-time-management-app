import { useState, useEffect } from 'react'
import './App.css'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import TaskFilter from './components/TaskFilter'
import CalendarView from './components/CalendarView'
import StatsView from './components/StatsView'

interface Task {
  id: number;
  title: string;
  deadline?: string;
  completed: boolean;
  createdAt: string;
  priority: 'high' | 'medium' | 'low';
}

type ViewType = 'list' | 'calendar' | 'stats'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentView, setCurrentView] = useState<ViewType>('list')
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' })

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks)
        // Add priority to existing tasks if they don't have it
        const tasksWithPriority = parsedTasks.map((task: any) => ({
          ...task,
          priority: task.priority || 'medium'
        }))
        setTasks(tasksWithPriority)
      } catch (error) {
        console.error('Error loading tasks from localStorage:', error)
        setTasks([])
      }
    }
  }, [])

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  // Filter tasks based on current filters
  const getFilteredTasks = () => {
    return tasks.filter(task => {
      // Search filter
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'pending' && !task.completed) ||
        (statusFilter === 'completed' && task.completed)
      
      // Priority filter
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
      
      // Date range filter
      const matchesDateRange = () => {
        if (!task.deadline) return !dateRangeFilter.start && !dateRangeFilter.end
        if (!dateRangeFilter.start && !dateRangeFilter.end) return true
        
        const taskDate = new Date(task.deadline)
        const startDate = dateRangeFilter.start ? new Date(dateRangeFilter.start) : null
        const endDate = dateRangeFilter.end ? new Date(dateRangeFilter.end) : null
        
        if (startDate && endDate) {
          return taskDate >= startDate && taskDate <= endDate
        } else if (startDate) {
          return taskDate >= startDate
        } else if (endDate) {
          return taskDate <= endDate
        }
        return true
      }
      
      return matchesSearch && matchesStatus && matchesPriority && matchesDateRange()
    })
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setDateRangeFilter({ start: '', end: '' })
  }

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
    const filteredTasks = getFilteredTasks()
    
    switch (currentView) {
      case 'list':
        return (
          <>
            <TaskFilter
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              priorityFilter={priorityFilter}
              dateRangeFilter={dateRangeFilter}
              onSearchChange={setSearchTerm}
              onStatusChange={setStatusFilter}
              onPriorityChange={setPriorityFilter}
              onDateRangeChange={setDateRangeFilter}
              onClearFilters={clearFilters}
            />
            <TaskList
              tasks={filteredTasks}
              onToggleTask={toggleTask}
              onEditTask={editTask}
              onDeleteTask={deleteTask}
            />
          </>
        )
      case 'calendar':
        return (
          <CalendarView
            tasks={filteredTasks}
            onToggleTask={toggleTask}
          />
        )
      case 'stats':
        return (
          <StatsView tasks={filteredTasks} />
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