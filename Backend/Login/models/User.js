const mongoose = require('mongoose');
const { logUserAction } = require('../utils/useLogger')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 5,
        maxlength: 30,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, 'Please provide a valid email address'],
    },
    googleId: {
		type: String,
		unique: true,
		sparse: true
	},
    password: {
        type: String,
    },
    lastLogin: {
        type: Date,
        default: null,
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
        default: null,
    },
    otpExpires: {
        type: Date,
        default: null,
    },
    generateCodeCount: {
        type: Map,
        of: Number,
        default: () => ({
            py: 0,
            js: 0,
            HtmlJsCss: 0,
            c: 0,
            cpp: 0,
            java: 0,
            cs: 0,
            rust: 0,
            go: 0,
            sql: 0,
            mongodb: 0,
            swift: 0,
            ruby: 0,
            ts: 0,
            dart: 0,
            kt: 0,
            perl: 0,
            scala: 0,
            julia: 0,
            verilog: 0,
        }),
    },
    refactorCodeCount: {
        type: Map,
        of: Number,
        default: () => ({
            py: 0,
            js: 0,
            HtmlJsCss: 0,
            c: 0,
            cpp: 0,
            java: 0,
            cs: 0,
            rust: 0,
            go: 0,
            sql: 0,
            mongodb: 0,
            swift: 0,
            ruby: 0,
            ts: 0,
            dart: 0,
            kt: 0,
            perl: 0,
            scala: 0,
            julia: 0,
            verilog: 0,
        }),
    },
    runCodeCount: {
        type: Map,
        of: Number,
        default: () => ({
            py: 0,
            js: 0,
            c: 0,
            cpp: 0,
            java: 0,
            cs: 0,
            rust: 0,
            go: 0,
            sql: 0,
            mongodb: 0,
            swift: 0,
            ruby: 0,
            ts: 0,
            dart: 0,
            kt: 0,
            perl: 0,
            scala: 0,
            julia: 0,
            verilog: 0,
        }),
    },
    sharedLinks: {
        type: [{
            shareId: {
                type: String,
                required: true,
                unique: true,
            },
            title: {
                type: String,
                required: true,
            },
            expiryTime: {
                type: Date,
                required: true,
            },
        }, ],
        default: [],
    },
});

userSchema.pre('save', function(next) {
    const user = this;
    const actionType = user.isNew ? 'create' : 'update';
    logUserAction(user, actionType);
    next();
});

userSchema.pre('remove', function(next) {
    const user = this;
    logUserAction(user, 'delete');
    next();
});

module.exports = mongoose.model('User', userSchema);