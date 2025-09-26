import { useState, useEffect } from 'react'
import './App.css'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import TaskFilter from './components/TaskFilter'
import CalendarView from './components/CalendarView'
import StatsView from './components/StatsView'
import AIAssistant from './components/AIAssistant'
import DebugPanel from './components/DebugPanel'
import EditTaskModal from './components/EditTaskModal'
import DataManager from './components/DataManager' 
import PomodoroTimer from './components/PomodoroTimer'

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

type ViewType = 'list' | 'calendar' | 'stats' | 'ai' | 'pomodoro' | 'data' | 'debug'

function App() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [currentView, setCurrentView] = useState<ViewType>('list')

    // Filter states
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all')
    const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
    const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' })

    // Edit modal states
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    // Load tasks from localStorage
    useEffect(() => {
        try {
            console.log('Loading tasks from localStorage...')
            const savedTasks = localStorage.getItem('student-todo-tasks')
            console.log('Raw localStorage data:', savedTasks)

            if (savedTasks && savedTasks !== 'undefined' && savedTasks !== 'null' && savedTasks !== '[]') {
                const parsedTasks = JSON.parse(savedTasks)
                console.log('Parsed tasks:', parsedTasks)

                if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
                    // Add missing properties to existing tasks
                    const tasksWithAllProperties = parsedTasks.map((task: Task) => ({
                        id: task.id || Date.now() + Math.random(),
                        title: task.title || 'Untitled Task',
                        deadline: task.deadline,
                        completed: Boolean(task.completed),
                        createdAt: task.createdAt || new Date().toISOString(),
                        priority: task.priority || 'medium',
                        estimatedTime: task.estimatedTime,
                        actualTime: task.actualTime
                    }))
                    setTasks(tasksWithAllProperties)
                    console.log('✅ Tasks successfully loaded:', tasksWithAllProperties.length)
                } else {
                    console.log('No valid tasks found in localStorage')
                }
            } else {
                console.log('No data found in localStorage')
            }
        } catch (error) {
            console.error('❌ Error loading tasks from localStorage:', error)
        }
    }, [])

    // Save tasks to localStorage
    useEffect(() => {
        if (tasks.length === 0) return

        try {
            const tasksToSave = JSON.stringify(tasks)
            localStorage.setItem('student-todo-tasks', tasksToSave)
            console.log('💾 Tasks saved to localStorage:', tasks.length, 'tasks')
        } catch (error) {
            console.error('❌ Error saving tasks to localStorage:', error)
        }
    }, [tasks])

    // Filter tasks based on current filters
    const getFilteredTasks = () => {
        return tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'pending' && !task.completed) ||
                (statusFilter === 'completed' && task.completed)
            const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter

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
            id: Date.now() + Math.random(), // Ensure unique ID
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

    // Update task
    const updateTask = (id: number, updates: Partial<Task>) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, ...updates } : task
        ))
    }

    // Open edit modal
    const openEditModal = (task: Task) => {
        setEditingTask(task)
        setIsEditModalOpen(true)
    }

    // Close edit modal
    const closeEditModal = () => {
        setEditingTask(null)
        setIsEditModalOpen(false)
    }

    // Import tasks (replace or merge)
    const importTasks = (importedTasks: Task[], mode: 'replace' | 'merge' = 'merge') => {
        // Ensure all imported tasks have unique IDs
        const tasksWithUniqueIds = importedTasks.map(task => ({
            ...task,
            id: Date.now() + Math.random() // Generate new unique ID
        }))

        if (mode === 'replace') {
            setTasks(tasksWithUniqueIds)
        } else {
            // Merge: add imported tasks to existing ones
            setTasks(prevTasks => [...prevTasks, ...tasksWithUniqueIds])
        }
    }

    // Clear all tasks
    const clearAllTasks = () => {
        if (window.confirm('Are you sure you want to delete all tasks? This cannot be undone.')) {
            setTasks([])
            localStorage.removeItem('student-todo-tasks')
        }
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
                            onDeleteTask={deleteTask}
                            onOpenEditModal={openEditModal}
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
            case 'ai':
                return (
                    <AIAssistant
                        tasks={filteredTasks}
                        onAddTask={addTask}
                        onUpdateTask={updateTask}
                    />
                )
            case 'pomodoro':
                return (
                    <PomodoroTimer
                        tasks={tasks} 
                        onUpdateTask={updateTask}
                    />
                )
            case 'data':
                return (
                    <DataManager
                        tasks={tasks} // Use all tasks, not filtered
                        onImportTasks={importTasks}
                        onClearAllTasks={clearAllTasks}
                    />
                )
            case 'debug':
                return (
                    <DebugPanel
                        tasks={tasks}
                        onAddTask={addTask}
                    />
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

            {/* View Navigation - 修復重複按鈕 */}
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
                <button
                    className={`view-btn ${currentView === 'ai' ? 'active' : ''}`}
                    onClick={() => setCurrentView('ai')}
                >
                    🤖 AI Assistant
                </button>
                <button
                    className={`view-btn ${currentView === 'pomodoro' ? 'active' : ''}`}
                    onClick={() => setCurrentView('pomodoro')}
                >
                    🍅 Pomodoro
                </button>
                <button
                    className={`view-btn ${currentView === 'data' ? 'active' : ''}`}
                    onClick={() => setCurrentView('data')}
                >
                    📦 Data Manager
                </button>
                <button
                    className={`view-btn ${currentView === 'debug' ? 'active' : ''}`}
                    onClick={() => setCurrentView('debug')}
                >
                    🔧 Debug
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

            {/* Edit Task Modal */}
            <EditTaskModal
                task={editingTask}
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                onSave={updateTask}
            />
        </div>
    )
}

export default App