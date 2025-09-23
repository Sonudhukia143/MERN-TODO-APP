import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        // const normalQuery = Object.assign({}, req.query);

        // console.log("Register endpoint hit");
        // const username = normalQuery.username;
        // console.log(username);
        // console.log("Register endpoint hit");
        // const email = normalQuery.email;
        // console.log("Register endpoint hit");
        // const password = normalQuery.password;
        // console.log(password);

        const { username, email, password } = req.body;

        // checks for presence of all fields
        if (!username || !email || !password) return res.status(400).json({ error: 'All fields are required' });

        // Check if user or email exists in the database
        const userEmail = await User.findOne({ email });
        const userUsername = await User.findOne({ username });
        if (userUsername || userEmail) return res.status(400).json({ error: 'Username or email already exists in the database.' });

        // Hash password using bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user in the database using the User model
        const user = new User({
            username,
            email,
            password: hashedPassword
        });
        if (!user) return res.status(400).json({ error: "Unable to create user." })

        const savedUser = await user.save();
        if (!savedUser) return res.status(400).json({ error: 'Failed to save user in the database.' });

        // Create token
        const jwtToken = jwt.sign(
            { _id: savedUser._id, username: savedUser.username, isAdmin: savedUser?.isAdmin ? true : false },
            process.env.JWT_SECRET
        );

        return res.status(201).json({
            token: jwtToken,
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                isAdmin: savedUser?.isAdmin || false
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        // const normalQuery = Object.assign({}, req.query);

        // const email = normalQuery.email;
        // const password = normalQuery.password;

        // console.log(email, password);

        const { email, password } = req.body;

        // Validation checks for presence of all fields
        if (!email || !password) return res.status(400).json({ error: 'All fields are required' });

        // Check if user exists in the database
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'No user found with this email' });


        // Validate password using bcrypt
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Password is incorrect' });


        // Create token using jwt
        const jwtToken = jwt.sign(
            { _id: user._id, username: user.username },
            process.env.JWT_SECRET
        );

        return res.status(200).json({
            token: jwtToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user?.isAdmin || false
            }
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Verify token
router.get('/verify', async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified) return res.status(400).json({ error: 'Invalid token unverified' });

        const user = await User.findById(verified._id).select('-password');
        if (!user) return res.status(400).json({ error: 'User not found' });

        return res.json({ user });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

// Get all users (for assignment dropdown) //change it to only admin access
router.get('/users', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) return res.status(403).json({ error: 'Access denied' });

        const users = await User.find().select('_id username email isAdmin');
        return res.json(users);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;