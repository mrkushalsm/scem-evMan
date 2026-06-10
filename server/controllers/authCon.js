const bcrypt = require('bcryptjs');
const User = require('../models/User');

const handleLogin = async (req, res, next) => {
    try {
        const { SignJWT } = await import('jose');
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordsMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
        const token = await new SignJWT({
            userId: user._id.toString(),
            username: user.username,
            role: user.role
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(secret);

        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        next(error);
    }
}

const handleRegister = async (req, res, next) => {
    try {
        const { SignJWT } = await import('jose');
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'Username is already taken' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const derivedName = username.charAt(0).toUpperCase() + username.slice(1);

        const newUser = new User({
            name: derivedName,
            username,
            passwordHash,
            role: 'user',
            registeredContests: []
        });

        await newUser.save();

        // Generate JWT token
        const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
        const token = await new SignJWT({
            userId: newUser._id.toString(),
            username: newUser.username,
            role: newUser.role
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(secret);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                _id: newUser._id,
                username: newUser.username,
                name: newUser.name,
                role: newUser.role
            }
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    handleLogin,
    handleRegister
}