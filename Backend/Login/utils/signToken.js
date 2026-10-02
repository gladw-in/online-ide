// Signs a JWT for the given user with the token version and 1-week expiry.

const jwt = require('jsonwebtoken');

function signToken(user) {
    return jwt.sign(
        {
            userId: user._id,
            v: user.tokenVersion,
        },
        process.env.JWT_SECRET,
        {
            algorithm: 'HS512',
            expiresIn: '1w',
        }
    );
}

module.exports = signToken;