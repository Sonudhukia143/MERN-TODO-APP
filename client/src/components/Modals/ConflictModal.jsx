import React from 'react';
import '../../styles/Modal.css';

const ConflictModal = ({ conflict, onResolve, onClose }) => {
    const renderChanges = (changes) => {
        return Object.entries(changes).map(([key, value]) => (
            <div key={key} className="change-item">
                <span className="change-key">{key}:</span>
                <span className="change-value">{JSON.stringify(value)}</span>
            </div>
        ));
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content conflict-modal">
                <div className="modal-header">
                    <h2>Conflict Detected!</h2>
                </div>

                <div className="conflict-description">
                    <p>Another user has edited this task while you were making changes.</p>
                    <p>Please choose how to resolve this conflict:</p>
                </div>

                <div className="conflict-versions">
                    <div className="version-section">
                        <h3>Current Version (on server)</h3>
                        <div className="version-content">
                            <div className="change-item">
                                <span className="change-key">Title:</span>
                                <span className="change-value">{conflict.currentTask.title}</span>
                            </div>
                            <div className="change-item">
                                <span className="change-key">Description:</span>
                                <span className="change-value">{conflict.currentTask.description || 'None'}</span>
                            </div>
                            <div className="change-item">
                                <span className="change-key">Priority:</span>
                                <span className="change-value">{conflict.currentTask.priority}</span>
                            </div>
                            <div className="change-item">
                                <span className="change-key">Last edited by:</span>
                                <span className="change-value">{conflict.currentTask.lastEditedBy?.username}</span>
                            </div>
                        </div>
                    </div>

                    <div className="version-section">
                        <h3>Your Changes</h3>
                        <div className="version-content">
                            {renderChanges(conflict.yourChanges)}
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button onClick={onClose} className="cancel-button">
                        Cancel
                    </button>
                    <button
                        onClick={() => onResolve('merge')}
                        className="merge-button"
                    >
                        Merge Changes
                    </button>
                    <button
                        onClick={() => onResolve('overwrite')}
                        className="overwrite-button"
                    >
                        Overwrite with My Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConflictModal;