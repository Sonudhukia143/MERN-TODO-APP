import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import KanbanBoard from '../Board/KanbanBoard';
import ActivityLog from '../ActivityLog/ActivityLog';
import ConflictModal from '../Modals/ConflictModal';
import api from '../../services/api';
import '../../styles/Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const { socket } = useSocket();
    const [tasks, setTasks] = useState([]);
    const [actions, setActions] = useState([]);
    const [conflictData, setConflictData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('task:created', (task) => {
            setTasks(prev => [...prev, task]);
        });

        socket.on('task:updated', (updatedTask) => {
            setTasks(prev => prev.map(task =>
                task._id === updatedTask._id ? updatedTask : task
            ));
        });

        socket.on('task:deleted', (taskId) => {
            setTasks(prev => prev.filter(task => task._id !== taskId));
        });

        socket.on('task:moved', ({ task, oldStatus, newStatus }) => {
            setTasks(prev => prev.map(t =>
                t._id === task._id ? task : t
            ));
        });

        socket.on('actions:updated', (newActions) => {
            setActions(newActions);
        });

        return () => {
            socket.off('task:created');
            socket.off('task:updated');
            socket.off('task:deleted');
            socket.off('task:moved');
            socket.off('actions:updated');
        };
    }, [socket]);

    const fetchInitialData = async () => {
        try {
            const [tasksRes, actionsRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/actions')
            ]);

            setTasks(tasksRes.data);
            setActions(actionsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConflict = (conflict) => {
        setConflictData(conflict);
    };

    const resolveConflict = async (resolution) => {
        if (socket && conflictData) {
            socket.emit('conflict:resolve', {
                taskId: conflictData.taskId,
                resolution,
                changes: conflictData.yourChanges
            });
        }
        setConflictData(null);
    };

    if (loading) {
        return <div className="loading-spinner">Loading dashboard...</div>;
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1 className="dashboard-title">Collaborative Task Board</h1>
                <div className="user-info">
                    <span className="username">Welcome, {user?.username}!</span>
                    <button onClick={logout} className="logout-button">Logout</button>
                </div>
            </header>

            <div className="dashboard-content">
                <div className="board-section">
                    <KanbanBoard
                        tasks={tasks}
                        onConflict={handleConflict}
                    />
                </div>

                <div className="activity-section">
                    <ActivityLog actions={actions} />
                </div>
            </div>

            {conflictData && (
                <ConflictModal
                    conflict={conflictData}
                    onResolve={resolveConflict}
                    onClose={() => setConflictData(null)}
                />
            )}
        </div>
    );
};

export default Dashboard;