import React, { useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import Column from './Column';
import TaskModal from '../Modals/TaskModal';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../services/api';
import '../../styles/Board.css';

const KanbanBoard = ({ tasks, onConflict }) => {
    const { socket } = useSocket();
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const columns = {
        'Todo': {
            id: 'Todo',
            title: 'Todo',
            taskIds: tasks.filter(t => t.status === 'Todo').map(t => t._id)
        },
        'In Progress': {
            id: 'In Progress',
            title: 'In Progress',
            taskIds: tasks.filter(t => t.status === 'In Progress').map(t => t._id)
        },
        'Done': {
            id: 'Done',
            title: 'Done',
            taskIds: tasks.filter(t => t.status === 'Done').map(t => t._id)
        }
    };

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId &&
            destination.index === source.index) return;

        const newStatus = destination.droppableId;

        if (socket) {
            socket.emit('task:drag', {
                taskId: draggableId,
                newStatus,
                newIndex: destination.index
            });
        }
    };

    const handleCreateTask = () => {
        setEditingTask(null);
        setShowTaskModal(true);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setShowTaskModal(true);
    };

    const handleSaveTask = async (taskData) => {
        try {
            if (editingTask) {
                const response = await api.put(`/tasks/${editingTask._id}`, {
                    ...taskData,
                    version: editingTask.version
                });
                setShowTaskModal(false);
            } else {
                await api.post('/tasks', taskData);
                setShowTaskModal(false);
            }
        } catch (error) {
            if (error.response?.status === 409) {
                onConflict({
                    ...error.response.data,
                    taskId: editingTask._id,
                    yourChanges: taskData
                });
                setShowTaskModal(false);
            } else {
                alert(error.response?.data?.error || 'Error saving task');
            }
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await api.delete(`/tasks/${taskId}`);
            } catch (error) {
                alert('Error deleting task');
            }
        }
    };

    const handleSmartAssign = async (taskId) => {
        try {
            await api.post(`/tasks/${taskId}/smart-assign`);
        } catch (error) {
            alert('Error assigning task');
        }
    };

    return (
        <div className="kanban-board">
            <div className="board-header">
                <h2>Task Board</h2>
                <button onClick={handleCreateTask} className="create-task-button">
                    + New Task
                </button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="columns-container">
                    {Object.values(columns).map(column => (
                        <Droppable key={column.id} droppableId={column.id}>
                            {(provided, snapshot) => (
                                <Column
                                    column={column}
                                    tasks={column.taskIds.map(id => tasks.find(t => t._id === id)).filter(Boolean)}
                                    provided={provided}
                                    isDraggingOver={snapshot.isDraggingOver}
                                    onEditTask={handleEditTask}
                                    onDeleteTask={handleDeleteTask}
                                    onSmartAssign={handleSmartAssign}
                                />
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>

            {showTaskModal && (
                <TaskModal
                    task={editingTask}
                    onSave={handleSaveTask}
                    onClose={() => setShowTaskModal(false)}
                />
            )}
        </div>
    );
};

export default KanbanBoard;