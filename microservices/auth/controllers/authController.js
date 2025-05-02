// controller/authController.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/userModel'); // Asegúrate de que la ruta sea correcta


const signup = async (req, res) => {

    const { username, email, password } = req.body;

    try {
        const newUser = await User.create({
            username,
            email,
            password // Encriptar la contraseña
        });
        return res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ message: 'Error creating user' });
    }
};


const login = async (req, res) => {
    const { identifier, password } = req.body;

    try {
        const user = await User.findUser(identifier);

        console.log(user);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email/username or password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });
        const userInfo = {
            username: user.username,
            email: user.email,
            token: token
        };

        return res.status(200).json({ userInfo });
    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ message: 'Error logging in' });
    }
}


const passwordSendToken = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findUser(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        //envio token a correo

        const transporter = nodemailer.createTransport({
            service: 'gmail',

            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });


        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset',
            text: `Token: ${token}`,

        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'Password reset token sent to email' });

    } catch (error) {
        console.error('Error sending password reset email:', error);
        return res.status(500).json({ message: 'Error sending password reset email' });
    }

}

const updatePassword = async (req, res) => {
    const {token, newPassword, email } = req.body;

    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 

        const user = await User.findUser(email);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.updatePassword(email, newPassword); 

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ message: 'Error updating password' });
    }
}

const updatePasswordReset = async (req, res) => {
    const {newPassword, email } = req.body;

    try {
        
        //const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifica el token antes de proceder

        const user = await User.findUser(email);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.updatePassword(email, newPassword); // Asegúrate de que el método updatePassword esté definido en tu modelo User

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ message: 'Error updating password' });
    }
}

const verifyToken = async (req, res) => {
    const { token } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return res.status(200).json({ message: 'Token is valid :)', decoded });
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}




module.exports = {
    signup,
    login,
    passwordSendToken,
    updatePassword,
    updatePasswordReset,
    verifyToken
};