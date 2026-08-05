const User = require ('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn:'30d'});

};

const getConfiguredAdminEmails = () => {
    const emails = [
        process.env.ADMIN_EMAIL,
        ...(process.env.ADMIN_EMAILS || '').split(',')
    ];

    return emails
        .map((email) => String(email || '').trim().toLowerCase())
        .filter(Boolean);
};

const shouldBeAdmin = async (email) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const configuredAdminEmails = getConfiguredAdminEmails();

    if (configuredAdminEmails.includes(normalizedEmail)) {
        return true;
    }

    return false;
};

const ensureAdminRoleIfNeeded = async (user) => {
    if (user.role === 'admin') {
        return user;
    }

    if (await shouldBeAdmin(user.email)) {
        user.role = 'admin';
        await user.save();
    }

    return user;
};

// Register a new user
const registerUser = async (req, res) => {
    const {name, email, password} = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({message: 'Please provide name, email, and password'});
    }

    try {
        const normalizedEmail = String(email).trim().toLowerCase();
        const existingUser = await User.findOne({email: normalizedEmail});
        if (existingUser) {
            return res.status(400).json({message: 'User already exists'});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userRole = await shouldBeAdmin(normalizedEmail) ? 'admin' : 'user';
        const user = await User.create({name: String(name).trim(), email: normalizedEmail, password: hashedPassword, role: userRole});

        if (user) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const message = `welcom to shopnest ${name}! thank you for registering with us. We are exited to have as part of our community. To completed to have your OTP for shopnest register is:${otp}`;
            await sendEmail(email, 'welcome to shopnest - your OTP for registration', message);

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({message: 'Invalid user data'});
        }

    } catch (error) {
        console.error('Registration failed:', error.message);
        res.status(500).json({message: 'Server error'});
    }
};

// Login user
const loginUser = async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json({message: 'Please provide email and password'});
    }

    try {
        let user = await User.findOne({email: String(email).trim().toLowerCase()});
        if (user && (await bcrypt.compare(password, user.password))) {
            user = await ensureAdminRoleIfNeeded(user);

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({message: 'Invalid email or password'});
        }
    } catch (error) {
        console.error('Login failed:', error.message);
        res.status(500).json({message: 'Server error'});
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        console.error('Get users failed:', error.message);
        res.status(500).json({message: 'Server error'});
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUsers
};
