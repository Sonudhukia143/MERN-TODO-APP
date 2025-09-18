import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Action from '../models/Action.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all tasks
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('assignedTo', 'username email')
            .populate('createdBy', 'username')
            .populate('lastEditedBy', 'username')
            .sort('-createdAt');
        return res.json(tasks);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Create task
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, priority } = req.body;

        // Check if title already exists
        const existingTask = await Task.findOne({ title });
        if (existingTask) return res.status(400).json({ error: 'Task title must be unique' });
        
        const task = new Task({
            title,
            description,
            priority,
            createdBy: req.user._id,
            lastEditedBy: req.user._id
        });
        if(!task) return res.status(400).json({ error: 'Failed to create task in the database.' });

        const savedTask = await task.save();
        const populatedTask = await Task.findById(savedTask._id)
            .populate('assignedTo', 'username email')
            .populate('createdBy', 'username')
            .populate('lastEditedBy', 'username');

        // Log action
        await new Action({
            userId: req.user._id,
            taskId: savedTask._id,
            actionType: 'created',
            details: { title }
        }).save();

        // Emit socket event
        const io = req.app.get('io');
        io.emit('task:created', populatedTask);

        // Emit action log update
        const actions = await Action.find()
            .populate('userId', 'username')
            .populate('taskId', 'title')
            .sort('-timestamp')
            .limit(20);
        io.emit('actions:updated', actions);

        return res.status(201).json(populatedTask);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Update task
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, description, status, priority, version , assignedTo } = req.body;
        if(!title || !description || !status || !priority || !version) return res.status(400).json({ error: 'All fields are required' });
        if(!assignedTo) return res.status(400).json({ error: 'Assign the task to a user' });

        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        

        // Check version for conflict
        if (task.version !== version) {
            return res.status(409).json({
                error: 'Conflict detected',
                currentTask: task,
                yourChanges: req.body
            });
        }

        // Check unique title if changed
        if (title && title !== task.title) {
            const existingTask = await Task.findOne({ title });
            if (existingTask) {
                return res.status(400).json({ error: 'Task title must be unique' });
            }
        }

        // Track what changed for action logging
        const changes = {};
        if (title && title !== task.title) changes.title = { from: task.title, to: title };
        if (description !== undefined && description !== task.description) changes.description = true;
        if (status && status !== task.status) changes.status = { from: task.status, to: status };
        if (priority && priority !== task.priority) changes.priority = { from: task.priority, to: priority };
        if (assignedTo !== undefined && String(assignedTo) !== String(task.assignedTo)) {
            changes.assignedTo = { from: task.assignedTo, to: assignedTo };
        }

        // Update task
        task.title = title || task.title;
        task.description = description !== undefined ? description : task.description;
        task.status = status || task.status;
        task.priority = priority || task.priority;
        task.assignedTo = assignedTo !== undefined ? assignedTo : task.assignedTo;
        task.lastEditedBy = req.user._id;
        task.version += 1;

        const savedTask = await task.save();
        const populatedTask = await Task.findById(savedTask._id)
            .populate('assignedTo', 'username email')
            .populate('createdBy', 'username')
            .populate('lastEditedBy', 'username');

        // Log appropriate action
        let actionType = 'edited';
        if (changes.status) actionType = 'status_changed';
        else if (changes.assignedTo) actionType = 'assigned';
        else if (changes.priority) actionType = 'priority_changed';

        await new Action({
            userId: req.user._id,
            taskId: task._id,
            actionType,
            details: changes
        }).save();

        // Update user task counts if assignment changed
        // Update user task counts if assignment changed
        if (changes.assignedTo) {
            if (task.status !== 'Done') {
                if (changes.assignedTo.from) {
                    await User.findByIdAndUpdate(changes.assignedTo.from, { $inc: { activeTasksCount: -1 } });
                }
                if (changes.assignedTo.to) {
                    await User.findByIdAndUpdate(changes.assignedTo.to, { $inc: { activeTasksCount: 1 } });
                }
            }
        }

        // Update task count if status changed
        if (changes.status && task.assignedTo) {
            if (changes.status.from !== 'Done' && changes.status.to === 'Done') {
                await User.findByIdAndUpdate(task.assignedTo, { $inc: { activeTasksCount: -1 } });
            } else if (changes.status.from === 'Done' && changes.status.to !== 'Done') {
                await User.findByIdAndUpdate(task.assignedTo, { $inc: { activeTasksCount: 1 } });
            }
        }

        // Emit socket event
        const io = req.app.get('io');
        io.emit('task:updated', populatedTask);

        // Emit action log update
        const actions = await Action.find()
            .populate('userId', 'username')
            .populate('taskId', 'title')
            .sort('-timestamp')
            .limit(20);
        io.emit('actions:updated', actions);

        return res.json(populatedTask);
    } catch (error) {
        console.log("Error updating task", error);
        return res.status(500).json({ error: error.message });
    }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        
        // Update user task count if assigned and not done
        if (task.assignedTo && task.status !== 'Done') await User.findByIdAndUpdate(task.assignedTo, { $inc: { activeTasksCount: -1 } });


        // Log action before deletion
        await new Action({
            userId: req.user._id,
            taskId: task._id,
            actionType: 'deleted',
            details: { title: task.title }
        }).save();

        await Task.findByIdAndDelete(req.params.id);

        // Emit socket event
        const io = req.app.get('io');
        io.emit('task:deleted', req.params.id);

        // Emit action log update
        const actions = await Action.find()
            .populate('userId', 'username')
            .populate('taskId', 'title')
            .sort('-timestamp')
            .limit(20);
        io.emit('actions:updated', actions);

        return res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.log("Error deleting task", error);
        return res.status(500).json({ error: error.message });
    }
});

// Smart assign
router.post('/:id/smart-assign', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });

        // Get all users with their active task counts
        const users = await User.find().sort('username');

        // Count active tasks for each user
        const userTaskCounts = await Promise.all(users.map(async (user) => {
            const activeTaskCount = await Task.countDocuments({
                assignedTo: user._id,
                status: { $ne: 'Done' }
            });
            return {
                user,
                activeTaskCount
            };
        }));

        // Find user with minimum tasks
        let selectedUser = userTaskCounts[0];
        for (const userCount of userTaskCounts) {
            if (userCount.activeTaskCount < selectedUser.activeTaskCount) {
                selectedUser = userCount;
            } else if (userCount.activeTaskCount === selectedUser.activeTaskCount &&
                userCount.user.username < selectedUser.user.username) {
                selectedUser = userCount;
            }
        }

        // Update task
        const oldAssignee = task.assignedTo;
        task.assignedTo = selectedUser.user._id;
        task.lastEditedBy = req.user._id;
        task.version += 1;
        await task.save();

        // Update user counts
        if (task.status !== 'Done') {
            if (oldAssignee) {
                await User.findByIdAndUpdate(oldAssignee, { $inc: { activeTasksCount: -1 } });
            }
            await User.findByIdAndUpdate(selectedUser.user._id, { $inc: { activeTasksCount: 1 } });
        }

        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'username email')
            .populate('createdBy', 'username')
            .populate('lastEditedBy', 'username');

        // Log action
        await new Action({
            userId: req.user._id,
            taskId: task._id,
            actionType: 'assigned',
            details: {
                assignedTo: selectedUser.user.username,
                reason: 'Smart Assign',
                taskCount: selectedUser.activeTaskCount
            }
        }).save();

        // Emit socket events
        const io = req.app.get('io');
        io.emit('task:updated', populatedTask);

        const actions = await Action.find()
            .populate('userId', 'username')
            .populate('taskId', 'title')
            .sort('-timestamp')
            .limit(20);
        io.emit('actions:updated', actions);

        return res.json(populatedTask);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;