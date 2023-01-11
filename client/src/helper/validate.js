import toast from 'react-hot-toast'
import {authenticate} from './helper';

//validate login page username
export async function usernameValidate(values) {
    const error = usernameVerify({}, values);

    if(values.username){
        //chk user exist or not
        const {status}=await authenticate(values.username);
        if(status!==200){
            error.exist=toast.error('Úser does not match');
        }
    }
    return error;
}

//validate password
export async function  passwordValidate(values){
    const error=passwordVerify({},values);

    return error;
}

//validate reset password
export async function resetPasswordValidation(values){
    const error=passwordVerify({},values);

    if(values.password!==values.confirm_password){
        error.exist=toast.error("Password not matched...");
    }
    return error;
}

// validete register form
export async function registerValidation(values){
    const errors=usernameValidate({},values);
    
    passwordVerify(errors,values);
    emailVerify(errors,values);
    return errors;
}

//validate profile page
export async function profileValidation(values){
    const errors=emailVerify({},values);
    return errors;
}

// -----------------***************----------------------

// validate password
function passwordVerify(error = {}, values) {

    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

    if (!values.password) {
        error.password = toast.error('Password Required..');
    }
    else if (values.password.includes(" ")) {
        error.password = toast.error('Invalid Password');
    }
    else if (values.password.length < 4) {
        error.password = toast.error(' Password length must be more than 4..');
    }
    else if (!specialChars.test(values.password)) {
        error.password = toast.error('password must contain special char');
    }

    return error;
}

// validate username
function usernameVerify(error = {}, values) {
    if (!values.username) {
        error.username = toast.error('username Required..');
    }
    else if (values.username.includes(" ")) {
        error.username = toast.error('Invalid Username');
    }

    return error;
}

//validate email
function emailVerify(error={},values){
    if(!values.email){
        error.email=toast.error("Email Required");
    }
    else if(values.email.includes(" ")){
        error.email=toast.error("Wrong Email.. ");
    }
    else if(!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)){
        error.email = toast.error("Invalid email address...!")
    }

    return error;
}
