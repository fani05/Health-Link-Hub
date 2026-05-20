import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter a name'],
        trim: true, // Remove leading/trailing whitespace
        maxlength: [25, 'Name cannot exceed 25 characters']
    },
    email: {
        type: String,
        required: [true, 'Please enter an email address'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gm, 'Please enter a valid email address'],
        maxlength: [30, 'Email cannot exceed 30 characters']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false,
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
        trim: true,
        maxlength: [20, 'Specialization cannot exceed 20 characters']
    },
    address: {
        type: String,
        required: [true, 'Please enter an address'],
        trim: true,
        maxlength: [100, 'Address cannot exceed 100 characters']
    },
    phone: {
        type: String,
        required: [true, 'Please enter a phone number'],
        trim: true,
        unique: true,
        match: [/^\+?[1-9]\d{7,14}$/, 'Please enter a valid phone number'],
        maxlength: [15, 'Phone number cannot exceed 15 characters']
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