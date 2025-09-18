import React, { useState } from 'react';
import '../../styles/Board.css';

const TaskCard = ({ task, provided, isDragging, onEdit, onDelete, onSmartAssign }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleCardClick = (e) => {
        if (e.target.classList.contains('task-action-button')) return;
        setIsFlipped(!isFlipped);
        setTimeout(() => setIsFlipped(false), 3000);
    };

    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'High': return 'priority-high';
            case 'Medium': return 'priority-medium';
            case 'Low': return 'priority-low';
            default: return '';
        }
    };

    return (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`task-card ${isDragging ? 'dragging' : ''} ${isFlipped ? 'flipped' : ''}`}
            onClick={handleCardClick}
        >
            <div className="card-front">
                <div className={`priority-indicator ${getPriorityClass(task.priority)}`} />
                <h4 className="task-title">{task.title}</h4>
                {task.description && (
                    <p className="task-description">{task.description}</p>
                )}

                <div className="task-meta">
                    {task.assignedTo && (
                        <div className="assigned-to">
                            <span className="meta-label">Assigned to:</span>
                            <span className="meta-value">{task.assignedTo.username}</span>
                        </div>
                    )}
                    <div className="task-priority">
                        <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                            {task.priority}
                        </span>
                    </div>
                </div>

                <div className="task-actions">
                    <button
                        className="task-action-button edit-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                    >
                        Edit
                    </button>
                    <button
                        className="task-action-button smart-assign-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSmartAssign();
                        }}
                    >
                        Smart Assign
                    </button>
                    <button
                        className="task-action-button delete-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>

            <div className="card-back">
                <h4>Task Details</h4>
                <div className="task-detail-item">
                    <span className="detail-label">Created by:</span>
                    <span className="detail-value">{task.createdBy?.username || 'Unknown'}</span>
                </div>
                <div className="task-detail-item">
                    <span className="detail-label">Last edited by:</span>
                    <span className="detail-value">{task.lastEditedBy?.username || 'Unknown'}</span>
                </div>
                <div className="task-detail-item">
                    <span className="detail-label">Created at:</span>
                    <span className="detail-value">
                        {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;