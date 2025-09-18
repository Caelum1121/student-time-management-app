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

const AIAssistant: React.FC<AIAssistantProps> = ({ tasks, onAddTask }) => {
    const [activeFeature, setActiveFeature] = useState<'suggestions' | 'time' | 'analysis' | 'goals' | null>(null)
    const [isThinking, setIsThinking] = useState(false)
    const [userInput, setUserInput] = useState('')
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [addedSuggestions, setAddedSuggestions] = useState<Set<string>>(new Set())
    const [goalSuggestions, setGoalSuggestions] = useState<{
        daily: string[];
        weekly: string[];
        monthly: string[];
    }>({ daily: [], weekly: [], monthly: [] })
    const [addedGoals, setAddedGoals] = useState<Set<string>>(new Set())

    // AI Task Suggestions
    const generateTaskSuggestions = () => {
        // 更多樣化的任務建議分類
        const suggestionCategories = {
            academic: [
                "Review lecture notes from today's classes",
                "Create study schedule for upcoming exams",
                "Complete assignment for [subject] course",
                "Prepare presentation slides for class",
                "Research topic for term paper",
                "Join study group session",
                "Visit professor during office hours",
                "Practice problems from textbook",
                "Summarize key concepts from readings",
                "Prepare for tomorrow's quiz",
                "Work on group project tasks",
                "Review and annotate research papers",
                "Create mind maps for complex topics",
                "Practice presentation in front of mirror"
            ],
            health: [
                "Take a 20-minute walk outside",
                "Prepare healthy meals for tomorrow",
                "Do 15 minutes of stretching exercises",
                "Drink 8 glasses of water today",
                "Get 7-8 hours of sleep tonight",
                "Do 10 minutes of meditation",
                "Practice deep breathing exercises",
                "Take breaks from screen every hour",
                "Go for a jog around campus",
                "Do some yoga poses",
                "Schedule a health checkup",
                "Prepare nutritious snacks for studying"
            ],
            personal: [
                "Learn a new skill online for 30 minutes",
                "Read one chapter of a book",
                "Practice a hobby or creative activity",
                "Call family or friends to catch up",
                "Clean and organize workspace",
                "Write in a journal about today",
                "Listen to an educational podcast",
                "Learn 10 new vocabulary words",
                "Practice a musical instrument",
                "Take photos of something beautiful",
                "Write a thank you note to someone",
                "Plan a weekend activity with friends"
            ],
            productivity: [
                "Check upcoming assignment deadlines",
                "Review and update class schedule",
                "Organize digital files and folders",
                "Update academic calendar",
                "Backup important documents",
                "Clear email inbox and respond",
                "Plan next week's priorities",
                "Review and update budget",
                "Organize study materials",
                "Set up a better study environment",
                "Create templates for assignments",
                "Review goals and progress"
            ],
            career: [
                "Update resume and LinkedIn profile",
                "Submit scholarship applications",
                "Research internship opportunities",
                "Network with professionals in your field",
                "Practice interview skills",
                "Attend a career fair or event",
                "Research companies in your field",
                "Work on personal portfolio",
                "Learn industry-relevant software",
                "Read about career trends",
                "Schedule informational interviews",
                "Join professional student organizations"
            ],
            social: [
                "Plan a study session with classmates",
                "Organize a group dinner with friends",
                "Join a campus club or organization",
                "Volunteer for a local charity",
                "Participate in campus events",
                "Reach out to an old friend",
                "Plan a weekend trip with friends",
                "Attend a campus lecture or seminar",
                "Join an intramural sports team",
                "Start a study group for difficult class",
                "Help a classmate with their studies",
                "Organize a movie night with roommates"
            ]
        }

        // 智能邏輯：根據時間、任務情況給出建議
        const now = new Date()
        const hour = now.getHours()
        const incompleteTasks = tasks.filter(task => !task.completed)

        // 檢查今天是否有任務
        const todaysTasks = tasks.filter(task => {
            if (!task.deadline) return false
            const taskDate = new Date(task.deadline + 'T00:00:00')
            const today = new Date()
            const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate())
            const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
            return taskDateOnly.getTime() === todayDateOnly.getTime() && !task.completed
        })

        let contextualSuggestions: string[] = []
        const priorityCategories: string[] = []

        // Smart suggestion logic
        if (todaysTasks.length === 0) {
            contextualSuggestions = [
                "📅 Plan your priorities for today",
                "🎯 Set 3 achievable goals for today",
                "📋 Review your weekly schedule",
                "⏰ Block time for important tasks"
            ]
            priorityCategories.push('productivity', 'academic')
        }

        if (incompleteTasks.length > 10) {
            contextualSuggestions = [
                ...contextualSuggestions,
                "🧹 Review and prioritize your task list",
                "✂️ Break down large tasks into smaller steps",
                "🗂️ Organize tasks by importance and urgency",
                "⚡ Focus on completing 3 high-priority tasks today"
            ]
            priorityCategories.push('productivity')
        }

        if (hour <= 10) {
            // Morning time - high energy tasks
            contextualSuggestions = [
                ...contextualSuggestions,
                "🌅 Tackle your most challenging task first",
                "🧠 Do focused study work while your mind is fresh",
                "💪 Exercise to boost your energy for the day",
                "📖 Review today's class materials"
            ]
            priorityCategories.push('academic', 'health', 'productivity')
        } else if (hour >= 18) {
            // Evening time - prepare for tomorrow
            contextualSuggestions = [
                ...contextualSuggestions,
                "📚 Prepare materials for tomorrow's classes",
                "👕 Set out clothes and items for tomorrow",
                "📝 Review what you accomplished today",
                "🌙 Plan a good evening routine for better sleep"
            ]
            priorityCategories.push('personal', 'health')
        } else {
            // Daytime - general tasks
            priorityCategories.push('academic', 'productivity')
        }

        // Add suggestions based on time of day
        if (hour >= 12 && hour <= 14) {
            // Lunch time
            contextualSuggestions = [
                ...contextualSuggestions,
                "🍽️ Take a proper lunch break to recharge"
            ]
            priorityCategories.push('health', 'social')
        }

        if (hour >= 15 && hour <= 17) {
            // Afternoon time
            contextualSuggestions = [
                ...contextualSuggestions,
                "☕ Take a short break and grab some fresh air"
            ]
            priorityCategories.push('health', 'personal')
        }

        // 隨機選擇不同類別的建議
        const allCategories = Object.keys(suggestionCategories) as Array<keyof typeof suggestionCategories>
        const selectedCategories = priorityCategories.length > 0
            ? priorityCategories
            : allCategories.sort(() => 0.5 - Math.random()).slice(0, 3)

        let randomSuggestions: string[] = []

        // 從每個選中的類別隨機選擇建議
        selectedCategories.forEach(category => {
            const categoryKey = category as keyof typeof suggestionCategories
            if (suggestionCategories[categoryKey]) {
                const categorySuggestions = [...suggestionCategories[categoryKey]]
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 2)
                randomSuggestions.push(...categorySuggestions)
            }
        })

        // 添加一些來自其他類別的隨機建議
        const otherCategories = allCategories.filter(cat => !selectedCategories.includes(cat))
        otherCategories.forEach(category => {
            const categoryKey = category as keyof typeof suggestionCategories
            if (suggestionCategories[categoryKey]) {
                const suggestion = suggestionCategories[categoryKey]
                    [Math.floor(Math.random() * suggestionCategories[categoryKey].length)]
                randomSuggestions.push(suggestion)
            }
        })

        // 打亂順序並限制數量
        const allSuggestions = [...contextualSuggestions, ...randomSuggestions]
            .sort(() => 0.5 - Math.random())
            .slice(0, 12)

        console.log('🤖 AI Analysis:', {
            hour,
            todaysTasks: todaysTasks.length,
            incompleteTasks: incompleteTasks.length,
            contextualSuggestions,
            selectedCategories,
            totalSuggestions: allSuggestions.length
        })

        return allSuggestions
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

        const goalCategories = {
            daily: {
                academic: [
                    "Complete 3 important tasks",
                    "Study for at least 2 hours",
                    "Review today's lecture notes",
                    "Finish homework assignments",
                    "Prepare for tomorrow's classes",
                    "Read one academic article",
                    "Practice problem-solving for 1 hour",
                    "Review and organize study materials"
                ],
                health: [
                    "Exercise for 30 minutes",
                    "Drink 8 glasses of water",
                    "Get 7-8 hours of sleep",
                    "Take 3 walking breaks",
                    "Eat 5 servings of fruits/vegetables",
                    "Practice 10 minutes of meditation",
                    "Limit screen time before bed",
                    "Do stretching exercises"
                ],
                personal: [
                    "Read for 20 minutes",
                    "Write in a journal",
                    "Practice a creative hobby",
                    "Learn something new online",
                    "Connect with family or friends",
                    "Practice gratitude",
                    "Listen to educational content",
                    "Organize personal space"
                ],
                productivity: [
                    "Complete morning routine",
                    "Plan tomorrow's priorities",
                    "Clear email inbox",
                    "Organize digital files",
                    "Review daily goals",
                    "Practice time-blocking",
                    "Eliminate one distraction",
                    "Update task management system"
                ]
            },
            weekly: {
                academic: [
                    "Complete all assignments on time",
                    "Attend all classes and take notes",
                    "Spend 15 hours on focused study",
                    "Review material from all courses",
                    "Prepare for upcoming exams",
                    "Participate in study groups",
                    "Meet with professors or TAs",
                    "Complete research for projects"
                ],
                health: [
                    "Exercise 4 times this week",
                    "Maintain consistent sleep schedule",
                    "Prepare healthy meals",
                    "Take mental health breaks",
                    "Practice stress management",
                    "Go outdoors daily",
                    "Limit junk food intake",
                    "Stay hydrated consistently"
                ],
                personal: [
                    "Read one complete book",
                    "Learn a new skill",
                    "Connect with 3 friends",
                    "Practice a hobby daily",
                    "Write weekly reflections",
                    "Try a new activity",
                    "Volunteer for a cause",
                    "Plan weekend activities"
                ],
                productivity: [
                    "Maintain work-life balance",
                    "Improve time management habits",
                    "Organize living/study space",
                    "Review and adjust goals",
                    "Eliminate time-wasting habits",
                    "Develop better routines",
                    "Use productivity tools effectively",
                    "Plan next week in advance"
                ]
            },
            monthly: {
                academic: [
                    `Achieve 85% task completion rate in ${currentMonth}`,
                    "Complete a significant project",
                    "Improve grades in challenging subjects",
                    "Develop better study strategies",
                    "Build relationships with professors",
                    "Join academic organizations",
                    "Present research or project work",
                    "Plan next semester's courses"
                ],
                health: [
                    "Establish sustainable exercise routine",
                    "Improve overall energy levels",
                    "Develop healthy eating habits",
                    "Improve sleep quality",
                    "Reduce stress levels significantly",
                    "Complete health checkups",
                    "Learn new wellness practices",
                    "Build mental resilience"
                ],
                personal: [
                    "Learn a new skill or concept",
                    "Expand social network",
                    "Develop a new hobby",
                    "Improve communication skills",
                    "Read 3-4 books",
                    "Plan future career steps",
                    "Strengthen family relationships",
                    "Contribute to community"
                ],
                career: [
                    "Update professional portfolio",
                    "Network with industry professionals",
                    "Apply for internships",
                    "Develop job-relevant skills",
                    "Research career opportunities",
                    "Attend professional events",
                    "Build online presence",
                    "Complete certification courses"
                ]
            }
        }

        // Randomly select goals from each category and period
        const selectedGoals = {
            daily: [] as string[],
            weekly: [] as string[],
            monthly: [] as string[]
        }

        // For each period, randomly select from different categories
        Object.keys(goalCategories).forEach(period => {
            const periodKey = period as keyof typeof goalCategories
            const categories = Object.keys(goalCategories[periodKey])

            // Shuffle categories and select goals from each
            const shuffledCategories = categories.sort(() => 0.5 - Math.random())

            shuffledCategories.forEach((category, index) => {
                const categoryKey = category as keyof typeof goalCategories[typeof periodKey]
                const categoryGoals = goalCategories[periodKey][categoryKey]

                // Select 1-2 random goals from this category
                const numGoals = index < 2 ? 2 : 1 // First two categories get 2 goals each
                const randomGoals = [...categoryGoals]
                    .sort(() => 0.5 - Math.random())
                    .slice(0, numGoals)

                selectedGoals[periodKey].push(...randomGoals)
            })

            // Shuffle final list and limit to 5 goals per period
            selectedGoals[periodKey] = selectedGoals[periodKey]
                .sort(() => 0.5 - Math.random())
                .slice(0, 5)
        })

        return selectedGoals
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

        // 標記該建議為已添加，並從顯示中移除
        setAddedSuggestions(prev => new Set([...prev, suggestion]))

        // 更新建議列表，移除已添加的項目
        setSuggestions(prev => prev.filter(s => s !== suggestion))
    }

    const handleThinking = async () => {
        setIsThinking(true)
        // Simulate AI thinking time
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsThinking(false)
    }

    // 重新生成建議（當功能被激活時）
    const refreshSuggestions = () => {
        const newSuggestions = generateTaskSuggestions()
        // 過濾掉已經添加的建議
        const availableSuggestions = newSuggestions.filter(s => !addedSuggestions.has(s))
        setSuggestions(availableSuggestions)
        console.log('🔄 Refreshed suggestions:', availableSuggestions.length, 'available')
    }

    // 重新生成目標建議
    const refreshGoals = () => {
        const newGoals = generateGoalSuggestions()
        // 過濾掉已經添加的目標
        const availableGoals = {
            daily: newGoals.daily.filter(goal => !addedGoals.has(goal)),
            weekly: newGoals.weekly.filter(goal => !addedGoals.has(goal)),
            monthly: newGoals.monthly.filter(goal => !addedGoals.has(goal))
        }
        setGoalSuggestions(availableGoals)
        console.log('🎯 Refreshed goals:', availableGoals)
    }

    // 添加目標為任務
    const addGoalAsTask = (goal: string, priority: 'high' | 'medium' | 'low' = 'high') => {
        const estimatedTime = estimateTaskTime(goal)

        onAddTask({
            title: `Goal: ${goal}`,
            completed: false,
            priority,
            estimatedTime,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // next week
        })

        // 標記該目標為已添加
        setAddedGoals(prev => new Set([...prev, goal]))

        // 從顯示中移除已添加的目標
        setGoalSuggestions(prev => ({
            daily: prev.daily.filter(g => g !== goal),
            weekly: prev.weekly.filter(g => g !== goal),
            monthly: prev.monthly.filter(g => g !== goal)
        }))

        console.log(`✅ Added goal as task: ${goal}`)
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
                    onClick={async () => {
                        if (activeFeature !== 'suggestions') {
                            await handleThinking()
                            refreshSuggestions()
                        }
                        setActiveFeature(activeFeature === 'suggestions' ? null : 'suggestions')
                    }}
                >
                    <span className="feature-icon">💡</span>
                    <span className="feature-text">Smart Suggestions</span>
                </button>

                <button
                    className={`ai-feature-btn ${activeFeature === 'time' ? 'active' : ''}`}
                    onClick={async () => {
                        if (activeFeature !== 'time') {
                            await handleThinking()
                        }
                        setActiveFeature(activeFeature === 'time' ? null : 'time')
                    }}
                >
                    <span className="feature-icon">⏰</span>
                    <span className="feature-text">Time Estimation</span>
                </button>

                <button
                    className={`ai-feature-btn ${activeFeature === 'analysis' ? 'active' : ''}`}
                    onClick={async () => {
                        if (activeFeature !== 'analysis') {
                            await handleThinking()
                        }
                        setActiveFeature(activeFeature === 'analysis' ? null : 'analysis')
                    }}
                >
                    <span className="feature-icon">📈</span>
                    <span className="feature-text">Productivity Analysis</span>
                </button>

                <button
                    className={`ai-feature-btn ${activeFeature === 'goals' ? 'active' : ''}`}
                    onClick={async () => {
                        if (activeFeature !== 'goals') {
                            await handleThinking()
                            refreshGoals()
                        }
                        setActiveFeature(activeFeature === 'goals' ? null : 'goals')
                    }}
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
                    <p>Based on your current tasks, time of day, and productivity patterns:</p>

                    {suggestions.length > 0 ? (
                        <>
                            <div className="suggestions-grid">
                                {suggestions.map((suggestion, index) => (
                                    <div key={`${suggestion}-${index}`} className="suggestion-item">
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

                            <div className="suggestions-footer">
                                <button
                                    onClick={refreshSuggestions}
                                    className="refresh-suggestions-btn"
                                >
                                    🔄 Get New Suggestions
                                </button>
                                <p className="suggestions-note">
                                    💡 Suggestions adapt to your current tasks and time of day
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="no-suggestions">
                            <p>🎉 You've added all current suggestions! Great job staying productive.</p>
                            <button
                                onClick={() => {
                                    setAddedSuggestions(new Set()) // 清除已添加標記
                                    refreshSuggestions()
                                }}
                                className="refresh-suggestions-btn"
                            >
                                🔄 Generate New Suggestions
                            </button>
                        </div>
                    )}
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
                    <p>AI-suggested goals based on your current progress and best practices:</p>

                    <div className="goals-section">
                        {Object.entries(goalSuggestions).map(([period, goals]) => (
                            <div key={period} className="goal-period">
                                <h4>
                                    {period === 'daily' ? '📅 Daily Goals' :
                                        period === 'weekly' ? '📋 Weekly Goals' :
                                            '🎯 Monthly Goals'}
                                </h4>

                                {goals.length > 0 ? (
                                    <div className="goals-list">
                                        {goals.map((goal, index) => (
                                            <div key={`${goal}-${index}`} className="goal-item">
                                                <span className="goal-text">{goal}</span>
                                                <button
                                                    onClick={() => addGoalAsTask(goal, 'high')}
                                                    className="set-goal-btn"
                                                >
                                                    Set as Task
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-goals">
                                        <p>All {period} goals have been added! 🎉</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="goals-footer">
                        <button
                            onClick={() => {
                                setAddedGoals(new Set()) // Clear added goals
                                refreshGoals()
                            }}
                            className="refresh-goals-btn"
                        >
                            🔄 Generate New Goals
                        </button>

                        <div className="goal-tracker">
                            <h4>📊 Goal Progress Tracker</h4>
                            <p>Your current completion rate: <strong>{Math.round((tasks.filter(t => t.completed).length / Math.max(tasks.length, 1)) * 100)}%</strong></p>
                            <div className="progress-suggestions">
                                <p>💡 To improve: Set specific, measurable daily targets and track your progress regularly</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AIAssistant