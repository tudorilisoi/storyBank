const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const jsonParser = bodyParser.json();

const { UserModel } = require('./userModel');
const tryCatch = require('../../helpers').expressTryCatchWrapper;
const config = require('../../../config')
const { localStrategy, jwtStrategy } = require('../../../auth/strategies');
passport.use(localStrategy);
passport.use(jwtStrategy);

const router = express.Router();

const createAuthToken = function (user) {
    return jwt.sign({ user }, config.JWT_SECRET, {
        subject: user.email,
        expiresIn: config.JWT_EXPIRY,
        algorithm: 'HS256'
    });
};

const localAuth = passport.authenticate('local', { session: false, failWithError: false });

//POST user signup (create new user)
async function createNewUser(req, res) {
    const requiredFields = ['email', 'password'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message)
        }
    }

    const userPassword = await UserModel.hashPassword(req.body.password);

    const userRecord = await UserModel.create({
        email: req.body.email,
        password: userPassword
    });

    res.json({
        user: userRecord.serialize()
    })
}

router.post('/user/createUser', tryCatch(createNewUser));

const jwtAuth = passport.authenticate('jwt', { session: false });


async function getUserProfile(req, res) {
    const userProfile = await UserModel.findOne({ email: req.user.email });

    res.json({
        user: userProfile.serialize()
    });
}

router.get('/profile', jwtAuth, tryCatch(getUserProfile));


router.post('/login', localAuth, (req, res) => {
    console.log('Login attempt successful', req.user)

    const authToken = createAuthToken(req.user.serialize());
    const email = req.user.serialize().email;
    res.json({ authToken, email });
});

router.post('/refresh-auth-token', jwtAuth, (req, res) => {
    const authToken = createAuthToken(req.user);
    res.json({ authToken });
});


async function changePassword(req, res) {
    const requiredFields = ['newPassword', 'retypeNewPassword'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(404).send(message);
        }
    }

    const { newPassword } = req.body
    const hashedNewPassword = await UserModel.hashPassword(newPassword);

    const userRecordByEmail = await UserModel.findOne({ email: req.user.email })
    const userRecord = await UserModel.findByIdAndUpdate(userRecordByEmail._id, { password: hashedNewPassword });

    res.json({
        user: userRecord.serialize()
    })
}

router.post('/changepassword', jwtAuth, tryCatch(changePassword));


module.exports = router;
