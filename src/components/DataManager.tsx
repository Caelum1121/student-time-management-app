import React, { useState, useRef } from 'react'

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

interface DataManagerProps {
    tasks: Task[];
    onImportTasks: (tasks: Task[], mode?: 'replace' | 'merge') => void;
    onClearAllTasks: () => void;
}

const DataManager: React.FC<DataManagerProps> = ({ tasks, onImportTasks, onClearAllTasks }) => {
    const [importStatus, setImportStatus] = useState<string>('')
    const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge')
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Export data as JSON
    const exportToJSON = () => {
        const exportData = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            appName: 'Student Time Management To-Do App',
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.completed).length,
            pendingTasks: tasks.filter(t => !t.completed).length,
            tasks: tasks.map(task => ({
                ...task,
                // Ensure consistent format
                createdAt: task.createdAt || new Date().toISOString(),
                priority: task.priority || 'medium'
            }))
        }

        const dataStr = JSON.stringify(exportData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)

        const link = document.createElement('a')
        link.href = url
        link.download = `student-tasks-backup-${new Date().toISOString().split('T')[0]}.json`
        link.click()

        URL.revokeObjectURL(url)
        setImportStatus(`✅ Exported ${tasks.length} tasks to JSON successfully`)

        setTimeout(() => setImportStatus(''), 4000)
    }

    // Export data as CSV
    const exportToCSV = () => {
        if (tasks.length === 0) {
            setImportStatus('❌ No tasks to export')
            setTimeout(() => setImportStatus(''), 3000)
            return
        }

        // CSV headers
        const headers = [
            'ID',
            'Title',
            'Priority',
            'Deadline',
            'Completed',
            'Created Date',
            'Estimated Time (minutes)'
        ]

        // Format task data for CSV
        const csvRows = tasks.map(task => [
            task.id.toString(),
            `"${task.title.replace(/"/g, '""')}"`, // Escape quotes in title
            task.priority,
            task.deadline || '',
            task.completed ? 'Yes' : 'No',
            task.createdAt ? new Date(task.createdAt).toISOString().split('T')[0] : '',
            (task.estimatedTime || '').toString()
        ])

        const csvContent = [
            headers.join(','),
            ...csvRows.map(row => row.join(','))
        ].join('\n')

        const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(dataBlob)

        const link = document.createElement('a')
        link.href = url
        link.download = `student-tasks-${new Date().toISOString().split('T')[0]}.csv`
        link.click()

        URL.revokeObjectURL(url)
        setImportStatus(`✅ Exported ${tasks.length} tasks to CSV successfully`)

        setTimeout(() => setImportStatus(''), 4000)
    }

    // Handle file import
    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setImportStatus('🔄 Processing file...')

        try {
            const text = await file.text()

            if (file.name.endsWith('.json')) {
                await importFromJSON(text)
            } else if (file.name.endsWith('.csv')) {
                await importFromCSV(text)
            } else {
                setImportStatus('❌ Please select a JSON or CSV file')
            }
        } catch (error) {
            console.error('Import error:', error)
            setImportStatus('❌ Error reading file. Please check the file format.')
        }

        // Clear file input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // Import from JSON
    const importFromJSON = async (jsonText: string) => {
        try {
            const data = JSON.parse(jsonText)
            let importTasks: Task[] = []

            // Handle different JSON formats
            if (data.tasks && Array.isArray(data.tasks)) {
                // Our export format
                importTasks = data.tasks
            } else if (Array.isArray(data)) {
                // Simple array format
                importTasks = data
            } else {
                throw new Error('Invalid JSON format')
            }

            // Validate and clean imported tasks
            const validTasks = importTasks
                .filter(task => task && typeof task === 'object' && task.title)
                .map((task, index) => ({
                    id: Date.now() + Math.random() + index, // Generate new unique ID
                    title: String(task.title).trim(),
                    deadline: task.deadline || undefined,
                    completed: Boolean(task.completed),
                    createdAt: task.createdAt || new Date().toISOString(),
                    priority: (['high', 'medium', 'low'].includes(task.priority))
                        ? task.priority as 'high' | 'medium' | 'low'
                        : 'medium',
                    estimatedTime: task.estimatedTime && !isNaN(Number(task.estimatedTime))
                        ? Number(task.estimatedTime)
                        : undefined,
                    actualTime: task.actualTime && !isNaN(Number(task.actualTime))
                        ? Number(task.actualTime)
                        : undefined
                }))

            if (validTasks.length === 0) {
                setImportStatus('❌ No valid tasks found in JSON file')
                return
            }

            onImportTasks(validTasks, importMode)
            setImportStatus(
                `✅ Successfully imported ${validTasks.length} tasks from JSON (${importMode} mode)`
            )

        } catch (error) {
            console.error('JSON import error:', error)
            setImportStatus('❌ Invalid JSON file format or corrupted data')
        }

        setTimeout(() => setImportStatus(''), 5000)
    }

    // Import from CSV
    const importFromCSV = async (csvText: string) => {
        try {
            const lines = csvText.trim().split('\n')
            if (lines.length < 2) {
                throw new Error('CSV file must have headers and at least one data row')
            }

            const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
            const tasks: Task[] = []

            for (let i = 1; i < lines.length; i++) {
                const values = parseCSVLine(lines[i])

                if (values.length < headers.length) continue

                const task: Task = {
                    id: Date.now() + Math.random() + i,
                    title: '',
                    completed: false,
                    createdAt: new Date().toISOString(),
                    priority: 'medium' as const
                }

                // Map CSV columns to task properties
                headers.forEach((header, index) => {
                    const value = values[index]?.trim()
                    if (!value) return

                    switch (header.replace(/[^\w\s]/g, '').toLowerCase()) {
                        case 'title':
                        case 'task':
                        case 'name':
                            task.title = value.replace(/^"/, '').replace(/"$/, '') // Remove quotes
                            break
                        case 'priority':
                            if (['high', 'medium', 'low'].includes(value.toLowerCase())) {
                                task.priority = value.toLowerCase() as 'high' | 'medium' | 'low'
                            }
                            break
                        case 'deadline':
                        case 'due date':
                        case 'due':
                            if (value && value !== '' && value !== 'undefined') {
                                // Try to parse date in various formats
                                const dateValue = new Date(value)
                                if (!isNaN(dateValue.getTime())) {
                                    task.deadline = dateValue.toISOString().split('T')[0]
                                }
                            }
                            break
                        case 'completed':
                        case 'status':
                            task.completed = ['yes', 'true', '1', 'completed', 'done'].includes(value.toLowerCase())
                            break
                        case 'estimated time':
                        case 'estimated time minutes':
                        case 'estimated time (minutes)':
                        case 'time':
                            const timeNum = parseInt(value)
                            if (!isNaN(timeNum) && timeNum > 0) {
                                task.estimatedTime = timeNum
                            }
                            break
                        case 'created date':
                        case 'created':
                            if (value && value !== '' && value !== 'undefined') {
                                const createdDate = new Date(value)
                                if (!isNaN(createdDate.getTime())) {
                                    task.createdAt = createdDate.toISOString()
                                }
                            }
                            break
                    }
                })

                if (task.title) {
                    tasks.push(task)
                }
            }

            if (tasks.length === 0) {
                setImportStatus('❌ No valid tasks found in CSV file')
                return
            }

            onImportTasks(tasks, importMode)
            setImportStatus(
                `✅ Successfully imported ${tasks.length} tasks from CSV (${importMode} mode)`
            )

        } catch (error) {
            console.error('CSV import error:', error)
            setImportStatus('❌ Error parsing CSV file. Please check the format.')
        }

        setTimeout(() => setImportStatus(''), 5000)
    }

    // Simple CSV parser that handles quoted fields
    const parseCSVLine = (line: string): string[] => {
        const result: string[] = []
        let current = ''
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
            const char = line[i]

            if (char === '"') {
                inQuotes = !inQuotes
            } else if (char === ',' && !inQuotes) {
                result.push(current)
                current = ''
            } else {
                current += char
            }
        }

        result.push(current)
        return result
    }

    // Generate sample data for testing
    const generateSampleData = () => {
        const sampleTasks: Task[] = [
            {
                id: Date.now() + 1,
                title: 'Complete Math Assignment - Calculus Chapter 5',
                deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                completed: false,
                createdAt: new Date().toISOString(),
                priority: 'high',
                estimatedTime: 120
            },
            {
                id: Date.now() + 2,
                title: 'Read History Book - Chapter 7: Industrial Revolution',
                deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                completed: false,
                createdAt: new Date().toISOString(),
                priority: 'medium',
                estimatedTime: 60
            },
            {
                id: Date.now() + 3,
                title: 'Group Project Meeting - Discuss Final Presentation',
                deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                completed: true,
                createdAt: new Date().toISOString(),
                priority: 'high',
                estimatedTime: 90
            },
            {
                id: Date.now() + 4,
                title: 'Daily Exercise - 30 minutes cardio',
                completed: false,
                createdAt: new Date().toISOString(),
                priority: 'low',
                estimatedTime: 30
            },
            {
                id: Date.now() + 5,
                title: 'Prepare English Presentation - Shakespeare Analysis',
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                completed: false,
                createdAt: new Date().toISOString(),
                priority: 'medium',
                estimatedTime: 180
            },
            {
                id: Date.now() + 6,
                title: 'Science Lab Report - Chemistry Experiment',
                deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                completed: false,
                createdAt: new Date().toISOString(),
                priority: 'high',
                estimatedTime: 150
            },
            {
                id: Date.now() + 7,
                title: 'Study for Physics Midterm Exam',
                deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                completed: false,
                createdAt: new Date().toISOString(),
                priority: 'high',
                estimatedTime: 300
            }
        ]

        onImportTasks(sampleTasks, 'merge')
        setImportStatus(`✅ Added ${sampleTasks.length} sample tasks to help you test the app`)
        setTimeout(() => setImportStatus(''), 4000)
    }

    return (
        <div className="data-manager">
            <div className="data-manager-header">
                <h2>📦 Data Management Center</h2>
                <p>Export, import, backup, and manage your task data</p>
            </div>

            {/* Current Data Overview */}
            <div className="data-overview">
                <h3>📊 Current Data Overview</h3>
                <div className="overview-stats">
                    <div className="overview-stat">
                        <span className="stat-number">{tasks.length}</span>
                        <span className="stat-label">Total Tasks</span>
                    </div>
                    <div className="overview-stat">
                        <span className="stat-number">{tasks.filter(t => t.completed).length}</span>
                        <span className="stat-label">Completed</span>
                    </div>
                    <div className="overview-stat">
                        <span className="stat-number">{tasks.filter(t => !t.completed).length}</span>
                        <span className="stat-label">Pending</span>
                    </div>
                    <div className="overview-stat">
                        <span className="stat-number">
                            {Math.round((localStorage.getItem('student-todo-tasks')?.length || 0) / 1024 * 100) / 100}KB
                        </span>
                        <span className="stat-label">Storage Used</span>
                    </div>
                </div>
            </div>

            {/* Export Section */}
            <div className="data-section export-section">
                <h3>📤 Export Your Tasks</h3>
                <p>Download your tasks for backup or sharing with others</p>

                <div className="export-options">
                    <div className="export-option">
                        <div className="option-info">
                            <h4>📋 JSON Format</h4>
                            <p>Full backup with all task properties and metadata</p>
                        </div>
                        <button
                            onClick={exportToJSON}
                            disabled={tasks.length === 0}
                            className="export-btn json-btn"
                        >
                            Export JSON
                        </button>
                    </div>

                    <div className="export-option">
                        <div className="option-info">
                            <h4>📊 CSV Format</h4>
                            <p>Spreadsheet-compatible format for analysis</p>
                        </div>
                        <button
                            onClick={exportToCSV}
                            disabled={tasks.length === 0}
                            className="export-btn csv-btn"
                        >
                            Export CSV
                        </button>
                    </div>
                </div>

                {tasks.length === 0 && (
                    <div className="no-data-message">
                        <p>📝 Add some tasks first to enable export functionality</p>
                    </div>
                )}
            </div>

            {/* Import Section */}
            <div className="data-section import-section">
                <h3>📥 Import Tasks</h3>
                <p>Upload JSON or CSV files to restore or add tasks</p>

                <div className="import-mode-selector">
                    <label>Import Mode:</label>
                    <div className="radio-group">
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="importMode"
                                value="merge"
                                checked={importMode === 'merge'}
                                onChange={(e) => setImportMode(e.target.value as 'merge')}
                            />
                            <span>🔄 Merge (Add to existing)</span>
                        </label>
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="importMode"
                                value="replace"
                                checked={importMode === 'replace'}
                                onChange={(e) => setImportMode(e.target.value as 'replace')}
                            />
                            <span>🔁 Replace (Delete existing)</span>
                        </label>
                    </div>
                </div>

                <div className="file-upload-area">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,.csv"
                        onChange={handleFileImport}
                        className="file-input"
                        id="fileInput"
                    />
                    <label htmlFor="fileInput" className="file-upload-label">
                        <span className="upload-icon">📁</span>
                        <span>Click to select JSON or CSV file</span>
                        <small>Supports .json and .csv formats</small>
                    </label>
                </div>

                <div className="format-help">
                    <h4>📝 Supported Formats:</h4>
                    <div className="format-examples">
                        <div className="format-example">
                            <strong>CSV Headers:</strong>
                            <code>Title, Priority, Deadline, Completed, Estimated Time (minutes)</code>
                        </div>
                        <div className="format-example">
                            <strong>JSON Structure:</strong>
                            <code>{"{ tasks: [{ title, priority, deadline, completed, ... }] }"}</code>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="data-section actions-section">
                <h3>🎲 Quick Actions</h3>
                <div className="action-buttons">
                    <button
                        onClick={generateSampleData}
                        className="action-btn sample-btn"
                    >
                        <span>🎯</span>
                        <span>Add Sample Tasks</span>
                        <small>For testing and demo purposes</small>
                    </button>

                    <button
                        onClick={onClearAllTasks}
                        disabled={tasks.length === 0}
                        className="action-btn danger-btn"
                    >
                        <span>🗑️</span>
                        <span>Clear All Tasks</span>
                        <small>Permanently delete all data</small>
                    </button>
                </div>
            </div>

            {/* Status Messages */}
            {importStatus && (
                <div className={`status-message ${importStatus.includes('❌') ? 'error' : 'success'}`}>
                    <div className="status-content">
                        {importStatus}
                    </div>
                    <button
                        onClick={() => setImportStatus('')}
                        className="dismiss-btn"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Instructions */}
            <div className="instructions-section">
                <h4>💡 Tips & Best Practices</h4>
                <div className="tips-grid">
                    <div className="tip-item">
                        <span className="tip-icon">💾</span>
                        <p><strong>Regular Backups:</strong> Export your data weekly to avoid losing important tasks</p>
                    </div>
                    <div className="tip-item">
                        <span className="tip-icon">🔄</span>
                        <p><strong>Data Sync:</strong> Use export/import to sync tasks between different devices</p>
                    </div>
                    <div className="tip-item">
                        <span className="tip-icon">📊</span>
                        <p><strong>Analysis:</strong> Export to CSV for detailed analysis in spreadsheet apps</p>
                    </div>
                    <div className="tip-item">
                        <span className="tip-icon">🛡️</span>
                        <p><strong>Safety:</strong> Always backup before importing new data in replace mode</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DataManager