import jwt from 'jsonwebtoken';
import Task from '../models/Task.js';
import Action from '../models/Action.js';

const socketHandlers = (io) => {
    // Middleware for socket authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded._id;
            socket.username = decoded.username;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User ${socket.username} connected`);

        // Join a room for all users
        socket.join('board');

        // Handle real-time task updates
        socket.on('task:drag', async (data) => {
            try {
                const { taskId, newStatus, newIndex } = data;

                const task = await Task.findById(taskId);
                if (!task) return;

                const oldStatus = task.status;
                task.status = newStatus;
                task.lastEditedBy = socket.userId;
                task.version += 1;

                await task.save();

                const populatedTask = await Task.findById(task._id)
                    .populate('assignedTo', 'username email')
                    .populate('createdBy', 'username')
                    .populate('lastEditedBy', 'username');

                // Log action
                await new Action({
                    userId: socket.userId,
                    taskId: task._id,
                    actionType: 'status_changed',
                    details: { from: oldStatus, to: newStatus }
                }).save();

                // Broadcast to all users
                io.to('board').emit('task:moved', {
                    task: populatedTask,
                    oldStatus,
                    newStatus,
                    newIndex
                });

                // Update action log
                const actions = await Action.find()
                    .populate('userId', 'username')
                    .populate('taskId', 'title')
                    .sort('-timestamp')
                    .limit(20);
                io.to('board').emit('actions:updated', actions);

            } catch (error) {
                console.error('Socket error:', error);
            }
        });

        // Handle conflict resolution
        socket.on('conflict:resolve', async (data) => {
            try {
                const { taskId, resolution, changes } = data;

                if (resolution === 'overwrite') {
                    // Apply the changes
                    const task = await Task.findById(taskId);
                    Object.assign(task, changes);
                    task.version += 1;
                    task.lastEditedBy = socket.userId;
                    await task.save();

                    const populatedTask = await Task.findById(task._id)
                        .populate('assignedTo', 'username email')
                        .populate('createdBy', 'username')
                        .populate('lastEditedBy', 'username');

                    io.to('board').emit('task:updated', populatedTask);
                }
            } catch (error) {
                console.error('Conflict resolution error:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`User ${socket.username} disconnected`);
        });
    });
};

export default socketHandlers;