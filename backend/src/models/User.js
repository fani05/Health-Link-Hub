import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter a name'],
        trim: true // Remove leading/trailing whitespace
    },
    email: {
        type: String,
        required: [true, 'Please enter an email address'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gm, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    role: {
        type: String,
        required: [true, 'Please specify a role'],
        enum: ['patient', 'doctor'],
        default: 'patient'
    }, 
    specialization: {
        type: String,
        required: function() { 
            return this.role === 'doctor'; 
        },
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Please enter an address'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Please enter a phone number'],
        trim: true,
        unique: true,
        match: [/^\+?[1-9]\d{7,14}$/, 'Please enter a valid phone number']
    }
}, { 
    timestamps: true 
});

// Hash the password before saving the user for the first time or when it is modified
userSchema.pre('save', async function() {
    if (!this.isModified('password')) 
        return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;