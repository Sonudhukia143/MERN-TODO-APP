import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import '../../styles/Board.css';

const Column = ({ column, tasks, provided, isDraggingOver, onEditTask, onDeleteTask, onSmartAssign }) => {
    return (
        <div className={`column ${isDraggingOver ? 'dragging-over' : ''}`}>
            <h3 className="column-title">{column.title}</h3>
            <div className="task-count">{tasks.length} tasks</div>

            <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="task-list"
            >
                {tasks.map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                            <TaskCard
                                task={task}
                                provided={provided}
                                isDragging={snapshot.isDragging}
                                onEdit={() => onEditTask(task)}
                                onDelete={() => onDeleteTask(task._id)}
                                onSmartAssign={() => onSmartAssign(task._id)}
                            />
                        )}
                    </Draggable>
                ))}
                {provided.placeholder}
            </div>
        </div>
    );
};

export default Column;