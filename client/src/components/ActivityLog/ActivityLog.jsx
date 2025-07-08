import React, { useEffect, useRef } from 'react';
import '../../styles/ActivityLog.css';

const ActivityLog = ({ actions }) => {
    const logRef = useRef(null);

    useEffect(() => {
        // Auto-scroll to latest action with animation
        if (logRef.current) {
            logRef.current.scrollTop = 0;
        }
    }, [actions]);

    const getActionDescription = (action) => {
        const { actionType, details, userId, taskId } = action;
        const username = userId?.username || 'Unknown user';
        const taskTitle = taskId?.title || 'a task';

        switch (actionType) {
            case 'created':
                return `${username} created task "${taskTitle}"`;

            case 'edited':
                return `${username} edited "${taskTitle}"`;

            case 'deleted':
                return `${username} deleted "${details.title || taskTitle}"`;

            case 'assigned':
                return `${username} assigned "${taskTitle}" to ${details.assignedTo || 'someone'}`;

            case 'status_changed':
                return `${username} moved "${taskTitle}" from ${details.from} to ${details.to}`;

            case 'priority_changed':
                return `${username} changed priority of "${taskTitle}" from ${details.from} to ${details.to}`;

            default:
                return `${username} performed ${actionType} on "${taskTitle}"`;
        }
    };

    const getActionIcon = (actionType) => {
        switch (actionType) {
            case 'created': return '➕';
            case 'edited': return '✏️';
            case 'deleted': return '🗑️';
            case 'assigned': return '👤';
            case 'status_changed': return '📍';
            case 'priority_changed': return '⚡';
            default: return '📝';
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / 60000);

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="activity-log">
            <h3 className="activity-title">Activity Log</h3>
            <div className="activity-list" ref={logRef}>
                {actions.length === 0 ? (
                    <div className="no-activity">No activity yet</div>
                ) : (
                    actions.map((action, index) => (
                        <div
                            key={action._id}
                            className={`activity-item ${index === 0 ? 'latest' : ''}`}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className="activity-icon">
                                {getActionIcon(action.actionType)}
                            </div>
                            <div className="activity-content">
                                <div className="activity-description">
                                    {getActionDescription(action)}
                                </div>
                                <div className="activity-time">
                                    {formatTime(action.timestamp)}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActivityLog;