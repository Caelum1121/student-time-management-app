import { } from 'react'

interface TaskFilterProps {
  searchTerm: string;
  statusFilter: 'all' | 'pending' | 'completed';
  priorityFilter: 'all' | 'high' | 'medium' | 'low';
  dateRangeFilter: {
    start: string;
    end: string;
  };
  onSearchChange: (term: string) => void;
  onStatusChange: (status: 'all' | 'pending' | 'completed') => void;
  onPriorityChange: (priority: 'all' | 'high' | 'medium' | 'low') => void;
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onClearFilters: () => void;
}

const TaskFilter: React.FC<TaskFilterProps> = ({
  searchTerm,
  statusFilter,
  priorityFilter,
  dateRangeFilter,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onDateRangeChange,
  onClearFilters
}) => {
  return (
    <div className="task-filter">
      <div className="filter-header">
        <h3>🔍 Search & Filter Tasks</h3>
        <button onClick={onClearFilters} className="clear-filters-btn">
          🗑️ Clear All
        </button>
      </div>

      <div className="filter-controls">
        {/* Search Input */}
        <div className="filter-group">
          <label htmlFor="search">Search Tasks:</label>
          <input
            id="search"
            type="text"
            placeholder="Search by task title..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Status Filter */}
        <div className="filter-group">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as 'all' | 'pending' | 'completed')}
            className="filter-select"
          >
            <option value="all">📋 All Tasks</option>
            <option value="pending">⏳ Pending</option>
            <option value="completed">✅ Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="filter-group">
          <label htmlFor="priority">Priority:</label>
          <select
            id="priority"
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value as 'all' | 'high' | 'medium' | 'low')}
            className="filter-select"
          >
            <option value="all">🏷️ All Priorities</option>
            <option value="high">🔴 High Priority</option>
            <option value="medium">🟡 Medium Priority</option>
            <option value="low">🟢 Low Priority</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="filter-group date-range">
          <label>Deadline Range:</label>
          <div className="date-inputs">
            <input
              type="date"
              placeholder="From"
              value={dateRangeFilter.start}
              onChange={(e) => onDateRangeChange({ ...dateRangeFilter, start: e.target.value })}
              className="date-filter-input"
            />
            <span className="date-separator">to</span>
            <input
              type="date"
              placeholder="To"
              value={dateRangeFilter.end}
              onChange={(e) => onDateRangeChange({ ...dateRangeFilter, end: e.target.value })}
              className="date-filter-input"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskFilter