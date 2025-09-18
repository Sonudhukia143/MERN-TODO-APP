import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        if (!user) return res.status(401).json({ error: 'Invalid or expired token or user not found' });
        req.user = user;

        next();
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

export default auth;