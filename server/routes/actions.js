import express from 'express';
import Action from '../models/Action.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// This route fetches the last 20 actions
router.get('/', auth, async (req, res) => {
    console.log("Actions route is running");

    try {
        if (req.user.isAdmin) {
            const actions = await Action.find()
                .populate('userId', 'username')
                .populate('taskId', 'title')
                .sort('-timestamp')
                .limit(20);

            return res.json(actions);
        } else {
            const actions = await Action.find({ userId: req.user._id })
                .populate('userId', 'username')
                .populate('taskId', 'title')
                .sort('-timestamp')
                .limit(20);

            console.log(actions);

            return res.json(actions);
        }
    } catch (error) {
        console.log("Error in actions route", error);
        return res.status(500).json({ error: error });
    }
});

export default router;