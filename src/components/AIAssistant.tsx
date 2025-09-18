import React, { useState } from 'react'

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

interface AIAssistantProps {
    tasks: Task[];
    onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
    onUpdateTask: (id: number, updates: Partial<Task>) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ tasks, onAddTask, onUpdateTask }) => {
    const [activeFeature, setActiveFeature] = useState<'suggestions' | 'time' | 'analysis' | 'goals' | null>(null)
    const [isThinking, setIsThinking] = useState(false)
    const [userInput, setUserInput] = useState('')

    // AI Task Suggestions
    const generateTaskSuggestions = () => {
        const suggestions = [
            // Study-related suggestions
            "Review lecture notes from today's classes",
            "Create study schedule for upcoming exams",
            "Complete assignment for [subject] course",
            "Prepare presentation slides",
            "Research topic for term paper",
            "Join study group session",
            "Visit professor during office hours",
            "Update resume and LinkedIn profile",

            // Health & Wellness
            "Take a 20-minute walk outside",
            "Prepare healthy meals for tomorrow",
            "Do 10 minutes of meditation",
            "Drink more water throughout the day",
            "Get 7-8 hours of sleep tonight",

            // Personal Development
            "Learn a new skill online for 30 minutes",
            "Read one chapter of a book",
            "Practice a hobby or creative activity",
            "Call family or friends to catch up",
            "Clean and organize workspace",

            // Academic Planning
            "Check upcoming assignment deadlines",
            "Review and update class schedule",
            "Submit scholarship applications",
            "Plan next semester's courses",
            "Update academic calendar"
        ]

        // Intelligent suggestions based on current tasks
        const incompleteTasks = tasks.filter(task => !task.completed)
        const todaysTasks = tasks.filter(task => {
            if (!task.deadline) return false
            return new Date(task.deadline).toDateString() === new Date().toDateString()
        })

        let smartSuggestions = []

        // If no tasks today, suggest planning
        if (todaysTasks.length === 0) {
            smartSuggestions.push("Plan tomorrow's priorities", "Review weekly goals")
        }

        // If many incomplete tasks, suggest time management
        if (incompleteTasks.length > 10) {
            smartSuggestions.push("Break down large tasks into smaller steps", "Review and prioritize task list")
        }

        // If it's evening, suggest preparation for tomorrow
        const hour = new Date().getHours()
        if (hour >= 18) {
            smartSuggestions.push("Prepare materials for tomorrow's classes", "Set out clothes for tomorrow")
        }

        // If it's morning, suggest energy tasks
        if (hour <= 10) {
            smartSuggestions.push("Tackle the most challenging task first", "Review today's priorities")
        }

        return [...smartSuggestions, ...suggestions.slice(0, 8)]
    }

    // Smart Time Estimation
    const estimateTaskTime = (taskTitle: string): number => {
        const keywords = {
            // Study activities (in minutes)
            'read': 30,
            'study': 60,
            'review': 45,
            'practice': 40,
            'research': 90,
            'write': 60,
            'assignment': 120,
            'essay': 180,
            'project': 240,
            'presentation': 120,
            'exam': 120,
            'homework': 90,

            // Quick tasks
            'email': 15,
            'call': 20,
            'message': 10,
            'check': 15,
            'update': 25,
            'organize': 30,

            // Longer activities
            'meeting': 60,
            'class': 90,
            'lecture': 90,
            'lab': 120,
            'workshop': 180,

            // Personal care
            'exercise': 45,
            'workout': 60,
            'meal': 30,
            'cook': 45,
            'clean': 40
        }

        const title = taskTitle.toLowerCase()
        let estimatedTime = 45 // default time in minutes

        for (const [keyword, time] of Object.entries(keywords)) {
            if (title.includes(keyword)) {
                estimatedTime = time
                break
            }
        }

        // Adjust based on task complexity indicators
        if (title.includes('final') || title.includes('major') || title.includes('important')) {
            estimatedTime *= 1.5
        }

        if (title.includes('quick') || title.includes('brief') || title.includes('short')) {
            estimatedTime *= 0.5
        }

        return Math.round(estimatedTime)
    }

    // Productivity Analysis
    const generateProductivityAnalysis = () => {
        const completedTasks = tasks.filter(task => task.completed)
        const totalTasks = tasks.length
        const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0

        // Analyze completion patterns by time
        const completionsByHour = completedTasks.reduce((acc, task) => {
            const hour = new Date(task.createdAt).getHours()
            acc[hour] = (acc[hour] || 0) + 1
            return acc
        }, {} as Record<number, number>)

        const peakHour = Object.entries(completionsByHour)
            .sort(([,a], [,b]) => b - a)[0]

        // Analyze task types
        const tasksByPriority = {
            high: tasks.filter(t => t.priority === 'high').length,
            medium: tasks.filter(t => t.priority === 'medium').length,
            low: tasks.filter(t => t.priority === 'low').length
        }

        // Generate insights
        const insights = []

        if (completionRate >= 80) {
            insights.push("🎉 Excellent! You're maintaining high productivity levels.")
        } else if (completionRate >= 60) {
            insights.push("👍 Good progress! Consider breaking larger tasks into smaller steps.")
        } else {
            insights.push("💡 Focus on completing 2-3 tasks daily to build momentum.")
        }

        if (peakHour) {
            const hour = parseInt(peakHour[0])
            const timeDesc = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
            insights.push(`⏰ You're most productive in the ${timeDesc} (${hour}:00). Schedule important tasks then.`)
        }

        if (tasksByPriority.high > tasksByPriority.medium + tasksByPriority.low) {
            insights.push("🔥 You're focusing on high-priority tasks - great job!")
        } else {
            insights.push("🎯 Consider adding more high-priority tasks to maximize impact.")
        }

        // Time management insights
        const overdueTasks = tasks.filter(task => {
            if (!task.deadline || task.completed) return false
            return new Date(task.deadline) < new Date()
        })

        if (overdueTasks.length > 0) {
            insights.push(`⚠️ You have ${overdueTasks.length} overdue task(s). Consider rescheduling or breaking them down.`)
        }

        return insights
    }

    // Goal Setting Assistant
    const generateGoalSuggestions = () => {
        const now = new Date()
        const currentMonth = now.toLocaleDateString('en-US', { month: 'long' })

        return {
            daily: [
                "Complete 3 important tasks",
                "Study for at least 2 hours",
                "Exercise for 30 minutes",
                "Read for 20 minutes",
                "Review tomorrow's schedule"
            ],
            weekly: [
                "Complete all assignments on time",
                "Attend all classes and take notes",
                "Spend 10 hours on focused study",
                "Exercise 4 times this week",
                "Connect with 2 classmates or friends"
            ],
            monthly: [
                `Achieve 85% task completion rate in ${currentMonth}`,
                "Complete a significant project or assignment",
                "Learn a new skill or concept",
                "Improve time management habits",
                "Maintain work-life balance"
            ]
        }
    }

    const handleAIAction = async (action: string) => {
        setIsThinking(true)
        // Simulate AI thinking time
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsThinking(false)
    }

    const addSuggestedTask = (suggestion: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
        const estimatedTime = estimateTaskTime(suggestion)

        onAddTask({
            title: suggestion,
            completed: false,
            priority,
            estimatedTime,
            deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // tomorrow
        })
    }

    return (
        <div className="ai-assistant">
            <div className="ai-header">
                <h2>🤖 AI Study Assistant</h2>
                <p>Let AI help optimize your productivity and learning</p>
            </div>

            {/* AI Feature Buttons */}
            <div className="ai-features">
                <button
                    className={`ai-feature-btn ${activeFeature === 'suggestions' ? 'active' : ''}`}
                    onClick={() => setActiveFeature(activeFeature === 'suggestions' ? null : 'suggestions')}
                >
                    <span className="feature-icon">💡</span>
                    <span className="feature-text">Smart Suggestions</span>
                </button>

                <button
                    className={`ai-feature-btn ${activeFeature === 'time' ? 'active' : ''}`}
                    onClick={() => setActiveFeature(activeFeature === 'time' ? null : 'time')}
                >
                    <span className="feature-icon">⏰</span>
                    <span className="feature-text">Time Estimation</span>
                </button>

                <button
                    className={`ai-feature-btn ${activeFeature === 'analysis' ? 'active' : ''}`}
                    onClick={() => setActiveFeature(activeFeature === 'analysis' ? null : 'analysis')}
                >
                    <span className="feature-icon">📈</span>
                    <span className="feature-text">Productivity Analysis</span>
                </button>

                <button
                    className={`ai-feature-btn ${activeFeature === 'goals' ? 'active' : ''}`}
                    onClick={() => setActiveFeature(activeFeature === 'goals' ? null : 'goals')}
                >
                    <span className="feature-icon">🎯</span>
                    <span className="feature-text">Goal Setting</span>
                </button>
            </div>

            {isThinking && (
                <div className="ai-thinking">
                    <div className="thinking-indicator">
                        <span className="thinking-dot"></span>
                        <span className="thinking-dot"></span>
                        <span className="thinking-dot"></span>
                    </div>
                    <p>AI is thinking...</p>
                </div>
            )}

            {/* AI Features Content */}
            {activeFeature === 'suggestions' && (
                <div className="ai-content">
                    <h3>💡 Smart Task Suggestions</h3>
                    <p>Based on your current tasks and productivity patterns:</p>
                    <div className="suggestions-grid">
                        {generateTaskSuggestions().map((suggestion, index) => (
                            <div key={index} className="suggestion-item">
                                <span className="suggestion-text">{suggestion}</span>
                                <button
                                    onClick={() => addSuggestedTask(suggestion)}
                                    className="add-suggestion-btn"
                                    title="Add this task"
                                >
                                    ➕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeFeature === 'time' && (
                <div className="ai-content">
                    <h3>⏰ Smart Time Estimation</h3>
                    <p>Get AI-powered time estimates for better planning:</p>

                    <div className="time-estimator">
                        <input
                            type="text"
                            placeholder="Describe your task..."
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            className="time-input"
                        />
                        {userInput && (
                            <div className="time-result">
                <span className="estimated-time">
                  Estimated time: <strong>{estimateTaskTime(userInput)} minutes</strong>
                </span>
                                <button
                                    onClick={() => {
                                        addSuggestedTask(userInput)
                                        setUserInput('')
                                    }}
                                    className="add-with-time-btn"
                                >
                                    Add Task with Time Estimate
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="time-insights">
                        <h4>⚡ Time Management Tips:</h4>
                        <ul>
                            <li>Break large tasks (2+ hours) into smaller chunks</li>
                            <li>Add 25% buffer time for unexpected delays</li>
                            <li>Schedule demanding tasks during your peak energy hours</li>
                            <li>Use time-blocking to focus on one task at a time</li>
                        </ul>
                    </div>
                </div>
            )}

            {activeFeature === 'analysis' && (
                <div className="ai-content">
                    <h3>📈 Productivity Analysis</h3>
                    <p>AI insights from your task completion patterns:</p>

                    <div className="analysis-insights">
                        {generateProductivityAnalysis().map((insight, index) => (
                            <div key={index} className="insight-item">
                                <span className="insight-text">{insight}</span>
                            </div>
                        ))}
                    </div>

                    <div className="analysis-recommendations">
                        <h4>🚀 AI Recommendations:</h4>
                        <div className="recommendation-grid">
                            <div className="recommendation-card">
                                <h5>Focus Time</h5>
                                <p>Schedule 2-hour focused study blocks with 15-minute breaks</p>
                            </div>
                            <div className="recommendation-card">
                                <h5>Task Batching</h5>
                                <p>Group similar tasks together to maintain momentum</p>
                            </div>
                            <div className="recommendation-card">
                                <h5>Priority Matrix</h5>
                                <p>Use the Eisenhower Matrix: Urgent vs Important</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeFeature === 'goals' && (
                <div className="ai-content">
                    <h3>🎯 Smart Goal Setting</h3>
                    <p>AI-suggested goals based on your current progress:</p>

                    <div className="goals-section">
                        {Object.entries(generateGoalSuggestions()).map(([period, goals]) => (
                            <div key={period} className="goal-period">
                                <h4>{period.charAt(0).toUpperCase() + period.slice(1)} Goals</h4>
                                <div className="goals-list">
                                    {goals.map((goal, index) => (
                                        <div key={index} className="goal-item">
                                            <span className="goal-text">{goal}</span>
                                            <button
                                                onClick={() => addSuggestedTask(`Goal: ${goal}`, 'high')}
                                                className="set-goal-btn"
                                            >
                                                Set as Task
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="goal-tracker">
                        <h4>📊 Goal Progress Tracker</h4>
                        <p>Your current completion rate: <strong>{Math.round((tasks.filter(t => t.completed).length / Math.max(tasks.length, 1)) * 100)}%</strong></p>
                        <div className="progress-suggestions">
                            <p>💡 To improve: Set specific, measurable daily targets and track your progress</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AIAssistant