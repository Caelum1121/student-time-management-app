import React, { useState, useEffect } from 'react'

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

interface EditTaskModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: number, updates: Partial<Task>) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, isOpen, onClose, onSave }) => {
    const [editTitle, setEditTitle] = useState('')
    const [editDeadline, setEditDeadline] = useState('')
    const [editPriority, setEditPriority] = useState<'high' | 'medium' | 'low'>('medium')
    const [editEstimatedTime, setEditEstimatedTime] = useState('')

    // Update form when task changes
    useEffect(() => {
        if (task) {
            setEditTitle(task.title)
            setEditDeadline(task.deadline || '')
            setEditPriority(task.priority)
            setEditEstimatedTime(task.estimatedTime ? task.estimatedTime.toString() : '')
        }
    }, [task])

    const handleSave = () => {
        if (!task || !editTitle.trim()) return

        const updates: Partial<Task> = {
            title: editTitle.trim(),
            deadline: editDeadline || undefined,
            priority: editPriority,
            estimatedTime: editEstimatedTime ? parseInt(editEstimatedTime) : undefined
        }

        onSave(task.id, updates)
        onClose()
    }

    const handleCancel = () => {
        onClose()
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    if (!isOpen || !task) return null

    return (
        <div className="edit-modal-backdrop" onClick={handleBackdropClick}>
            <div className="edit-modal">
                <div className="edit-modal-header">
                    <h3>✏️ Edit Task</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="edit-modal-body">
                    <div className="edit-field">
                        <label htmlFor="edit-title">Task Title</label>
                        <input
                            id="edit-title"
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="edit-input"
                            placeholder="Enter task title..."
                            autoFocus
                        />
                    </div>

                    <div className="edit-field">
                        <label htmlFor="edit-priority">Priority</label>
                        <select
                            id="edit-priority"
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value as 'high' | 'medium' | 'low')}
                            className="edit-select"
                        >
                            <option value="high">🔴 High Priority</option>
                            <option value="medium">🟡 Medium Priority</option>
                            <option value="low">🟢 Low Priority</option>
                        </select>
                    </div>

                    <div className="edit-field">
                        <label htmlFor="edit-deadline">Deadline</label>
                        <input
                            id="edit-deadline"
                            type="date"
                            value={editDeadline}
                            onChange={(e) => setEditDeadline(e.target.value)}
                            className="edit-input"
                        />
                    </div>

                    <div className="edit-field">
                        <label htmlFor="edit-estimated-time">Estimated Time (minutes)</label>
                        <input
                            id="edit-estimated-time"
                            type="number"
                            value={editEstimatedTime}
                            onChange={(e) => setEditEstimatedTime(e.target.value)}
                            className="edit-input"
                            placeholder="e.g., 60"
                            min="1"
                        />
                    </div>

                    <div className="edit-task-preview">
                        <h4>Preview:</h4>
                        <div className="preview-task">
                            <span className="preview-title">{editTitle || 'Task Title'}</span>
                            <div className="preview-meta">
                <span className={`preview-priority priority-${editPriority}`}>
                  {editPriority === 'high' ? '🔴 High' : editPriority === 'medium' ? '🟡 Medium' : '🟢 Low'}
                </span>
                                {editDeadline && (
                                    <span className="preview-deadline">📅 {new Date(editDeadline + 'T00:00:00').toLocaleDateString()}</span>
                                )}
                                {editEstimatedTime && (
                                    <span className="preview-time">⏱️ ~{editEstimatedTime}min</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="edit-modal-footer">
                    <button onClick={handleCancel} className="cancel-btn">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="save-btn"
                        disabled={!editTitle.trim()}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditTaskModal