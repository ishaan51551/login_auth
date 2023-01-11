import UserModel from '../model/User.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import ENV from '../config.js'
import otpGenerator from 'otp-generator'

//  middleware for vefify user
export async function verifyUser(req, res, next) {
    try {
        const { username } = req.method == "GET" ? req.query : req.body;

        //chk the userexistance
        let exist = await UserModel.findOne({ username });
        if (!exist) {
            return res.status(404).send({ error: "cant find user" });
            next();
        }

    } catch (error) {
        return res.status(404).send({ error: "Authentication Errror" });
    }
}

/** POST: http://localhost:8080/api/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "firstName" : "bill",
  "lastName": "william",
  "mobile": 8009860560,
  "address" : "Apt. 556, Kulas Light, Gwenborough",
  "profile": ""
}
*/
export async function register(req, res) {

    try {

        const { username, password, profile, email } = req.body;

        //chk for existing user
        const existUsername = new Promise((resolve, reject) => {

            UserModel.findOne({ username }, function (err, user) {
                if (err) reject(new Error(err));
                if (user) reject({ error: "Please use unique username" });

                resolve();//resolve when empty username
            })
        })

        //chk for existing email
        const existEmail = new Promise((resolve, reject) => {

            UserModel.findOne({ email }, function (err, email) {
                if (err) reject(new Error(err));
                if (email) reject({ error: "Please use unique Email" });

                resolve();//Promise.resolve() will call the then() method with two callbacks it prepared; otherwise the returned promise will be fulfilled with the value
            });
        });

        Promise.all([existUsername, existEmail]) //Promise.all waits for all fulfillments (or the first rejection).,
            //The Promise.all() static method takes an iterable of promises as input and returns a single Promise. This returned promise fulfills when all of the input's promises fulfill (including when an empty iterable is passed), with an array of the fulfillment values. It rejects when any of the input's promises rejects, with this first rejection reason.
            .then(() => {
                if (password) {
                    bcrypt.hash(password, 10)
                        .then(hashedPassword => { //now send the hashedpassword to mongodb server
                            const user = new UserModel({
                                username,
                                password: hashedPassword,
                                profile: profile || '',
                                email
                            });

                            // return save result as a response
                            user.save()
                                .then(result => res.status(201).send({ msg: "User Register Successfully" }))
                                .catch(error => res.status(500).send({ error }))

                        }).catch(error => {
                            return res.status(500).send({
                                error: "Enable to hashed password"
                            })
                        })
                }
            }).catch(error => {
                return res.status(500).send({
                    error
                })
            })

    } catch (error) {
        return res.status(500).send(error);
    }
}


/** POST: http://localhost:8080/api/login 
 * @param: {
  "username" : "example123",
  "password" : "admin123"
}
*/
export async function login(req, res) {

    const { username, password } = req.body;

    try {

        UserModel.findOne({ username })
            .then(user => {
                bcrypt.compare(password, user.password)
                    .then(passwordCheck => {

                        if (!passwordCheck) return res.status(400).send({ error: "Don't have Password" });

                        // create jwt token
                        const token = jwt.sign({
                            userId: user._id,
                            username: user.username
                        }, ENV.JWT_SECRET, { expiresIn: "24h" });

                        return res.status(200).send({
                            msg: "Login Successful...!",
                            username: user.username,
                            token
                        });

                    })
                    .catch(error => {
                        return res.status(400).send({ error: "Password does not Match" })
                    })
            })
            .catch(error => {
                return res.status(404).send({ error: "Username not Found" });
            })

    } catch (error) {
        return res.status(500).send({ error });
    }
}

/** GET: http://localhost:8080/api/user/example123 */
export async function getUser(req, res) {
    const { username } = req.params; // we will get the username{example123} from req.params and it will destructure with variable {username}

    try {
        UserModel.findOne({ username }, function (err, user) {
            if (err) return res.status(500).send({ err });
            if (!user) return res.status(501).send({ error: "Could not find the User" });

            // remove password from user
            //mongoose return unnecessary data with objects so convert it into json
            const { password, ...rest } = Object.assign({}, user.toJSON());
            return res.status(201).send(rest);
        })

    } catch (error) {
        return res.status(404).send({ error: "could not Find user Data" });
    }
}

/** PUT: http://localhost:8080/api/updateuser 
 * @param: {
  "header" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
export async function updateuser(req, res) {
    try {
        //const id = req.query.id;
        const { userId } = req.user;
        if (userId) {

            const body = req.body;

            //update the data
            UserModel.findOne({ _id: userId }, body, function (err, data) {
                if (err) throw error;

                return res.status(201).send({ msg: "Record Update" });
            })
        }
        else {
            return res.status(401).send({ error: "user not found" });
        }

    } catch (error) {
        return res.status(401).send({ error });
    }
}

/** GET: http://localhost:8080/api/generateOTP */
export async function generateOTP(req, res) {

    req.app.locals.OTP = await otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
    res.status(201).send({ code: req.app.locals.OTP });
}


/** GET: http://localhost:8080/api/verifyOTP */
export async function verifyOTP(req, res) {
    const { code } = req.query;
    if (parseInt(req.app.locals.OTP) == parseInt(code)) {
        req.app.locals.OTP = null; //reset the OTP value
        req.app.locals.ResetSession = true;//start session for reset password
        return res.status(201).send({ msg: 'verify successfully' });
    }
    return res.status(400).send({ error: "Invalid OTP" });
}

// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
export async function createResetSession(req, res) {
    if (req.app.locals.ResetSession) {
        // req.app.locals.ResetSession = false;//allow access to this route only once when user try to reset their password
        return res.status(201).send({ flag: req.app.locals.ResetSession});
    }
    return res.status(440).send({ error: "session expired" });
}


// update the password when we have valid session
/** PUT: http://localhost:8080/api/resetPassword */
export async function resetPassword(req, res) {
    try {

        if (!req.app.locals.ResetSession) return res.status(440).send({ error: "session expired" });

        const { username, password } = req.body;
        try {
            UserModel.findOne({ username })
                .then(user => {
                    bcrypt.hash(password, 10)
                        .then(hashedPassword => {
                            UserModel.findOne({ username: user.username },
                                { password: hashedPassword }, function (err, data) {
                                    if (err) throw err;
                                    res.app.locals.ResetSession = false; //reset session
                                    return res.status(201).send({ msg: "Record Updated" });
                                })
                        })
                        .catch(e => {
                            return res.status(500).send({
                                error: "Enable to hashed password"
                            })
                        })
                })
                .catch(error => {
                    return res.status(404).send({ error: "username not found" })
                })

        } catch (error) {
            return res.status(404).send({ error });
        }
    }
    catch (error) {
        return res.status(401).send({ error });
    }

}