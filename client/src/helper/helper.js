import axios from 'axios';
import jwt_decode from 'jwt-decode';


axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

// make api request 

/** To get username from Token */
export async function getUsername() {
    const token = localStorage.getItem('token');
    if (!token) return Promise.reject('cannnot find token');
    let decode = jwt_decode(token);
    return decode;
}

//authenticate fun
export async function authenticate(username) {
    try {

        return await axios.get('/api/authenticate', { username });
    }
    catch (error) {
        return { error: "username doesnt exist" };
    }
}

//get User details;
export async function getUser({ username }) {
    try {
        const { data } = await axios.get(`/api/user/${username}`)
        return { data };
    } catch (error) {
        return { error: "password doent match..." }
    }
}

//register user fun
export async function registerUser(credential) {
    try {
        const { data: { msg }, status } = await axios.post('/api/register', credential);//it will take data and status from register and will destructure the msg from data
        let { username, email } = credential;

        //send email
        if (status === 201) {
            await axios.post('/api/registerMail', { username, userEmail: email, text: msg });
        }
        return Promise.resolve(msg);

    } catch (error) {
        return Promise.reject({ error });
    }
}

//login fun
export async function verifyPassword({ username, password }) {
    try {
        if (username) {
            const { data } = await axios.post('/api/login', { username, password });
            return Promise.resolve({ data });
        }
    }
    catch (error) {
        return Promise.reject({ error: "password doesnt Match" })
    }
}

//update user Profile func
export async function updateUser(response) {
    try {
        const token = await localStorage.getItem('token');
        const data = await axios.put('/api/Updateuser', response, { headers: { "Authorization": `Bearer ${token}` } })

        return Promise.resolve({ data });

    } catch (error) {
        return Promise.reject({ error: "couldnt update Profile" });
    }
}

//generate OTP
export async function generateOTP(username) {
    try {

        const { data: { code, status } } = await axios.get('/api/generateOTP', { params: { username } })

        //send mail with the OTP
        if (status === 201) {
            let { data: { email } } = await getUser({ username });
            let text = `your password recovery OTP is ${code}.Verify and recover your password`;
            await axios.post('/api/registerMail', { username, userEmail: email, text, subject: "password Recovery OTP" });
        }
        return Promise.resolve(code);
    } catch (error) {
        return Promise.reject({ error });
    }
}

//verify OTP
export async function verifyOTP({ username, code }) {
    try {
        const { data, status } = await axios.get('/api/verifyOTP', { params: { username, code } });
        return { data, status };

    } catch (error) {
        return Promise.reject({ error });
    }
}

//reset password
export async function resetPassword({ username, password }) {
    try {
        const { data, status } = await axios.put('/api/resetPassword', { username, password });
        return Promise.resolve({ data, status });
    } catch (error) {
        return Promise.reject({ error });
    }
}