import React from 'react'

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

interface DebugPanelProps {
    tasks: Task[];
    onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ tasks, onAddTask }) => {
    const checkLocalStorage = () => {
        const saved = localStorage.getItem('student-todo-tasks')
        console.log('LocalStorage content:', saved)
        alert(`LocalStorage contains: ${saved ? `${JSON.parse(saved).length} tasks` : 'No data'}`)
    }

    const clearLocalStorage = () => {
        localStorage.removeItem('student-todo-tasks')
        localStorage.removeItem('tasks') // 清除舊的key
        alert('LocalStorage cleared! Please refresh the page.')
    }

    const addTestTasks = () => {
        // 添加一些測試任務
        const testTasks = [
            {
                title: 'Test Task 1 - Due Today',
                deadline: new Date().toISOString().split('T')[0],
                completed: false,
                priority: 'high' as const
            },
            {
                title: 'Test Task 2 - Due Tomorrow',
                deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                completed: false,
                priority: 'medium' as const
            },
            {
                title: 'Test Task 3 - Completed',
                deadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                completed: true,
                priority: 'low' as const
            }
        ]

        testTasks.forEach(task => onAddTask(task))
    }

    const exportTasks = () => {
        const dataStr = JSON.stringify(tasks, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'todo-tasks-backup.json'
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="debug-panel">
            <h3>🔧 Debug & Test Panel</h3>
            <div className="debug-info">
                <p><strong>Current Tasks Count:</strong> {tasks.length}</p>
                <p><strong>LocalStorage Key:</strong> student-todo-tasks</p>
                <p><strong>Browser:</strong> {navigator.userAgent.split(' ')[0]}</p>
            </div>

            <div className="debug-actions">
                <button onClick={checkLocalStorage} className="debug-btn">
                    🔍 Check LocalStorage
                </button>
                <button onClick={clearLocalStorage} className="debug-btn danger">
                    🗑️ Clear LocalStorage
                </button>
                <button onClick={addTestTasks} className="debug-btn">
                    ➕ Add Test Tasks
                </button>
                <button onClick={exportTasks} className="debug-btn">
                    💾 Export Tasks
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="debug-btn"
                >
                    🔄 Reload Page
                </button>
            </div>

            <div className="debug-instructions">
                <h4>📋 Persistence Test Steps:</h4>
                <ol>
                    <li>Click "Add Test Tasks" to add sample tasks</li>
                    <li>Modify some tasks (complete, edit, delete)</li>
                    <li>Click "Reload Page" to test persistence</li>
                    <li>Check if tasks remain after reload</li>
                    <li>Try closing and reopening browser tab</li>
                </ol>
            </div>

            <div className="debug-storage-info">
                <h4>💾 Storage Information:</h4>
                <pre className="storage-content">
          {JSON.stringify(tasks.slice(0, 3), null, 2)}
                    {tasks.length > 3 && `\n... and ${tasks.length - 3} more tasks`}
        </pre>
            </div>
        </div>
    )
}

export default DebugPanel