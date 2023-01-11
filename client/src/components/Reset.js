import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import avatar from "../assets/profile.png"
import styles from "../styles/Username.module.css";
import { useFormik } from 'formik'
import { resetPasswordValidation } from '../helper/validate';
import token, { toast, Toaster } from 'react-hot-toast';
import { resetPassword } from '../helper/helper';
import { useAuthStore } from '../store/store';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/fetch.hook'

export default function Reset() {

  const { username } = useAuthStore(state => state.auth);
  const navigate = useNavigate();
  const[{isLoading,apiData,status,serverError}]=useFetch('createResetSession');

  const formik = useFormik({
    initialValues: {
      password: 'admin@123',
      confirm_password: 'admin@123'
    },
    validate: resetPasswordValidation,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async values => {

      let resetPassword = resetPassword({ username, password: values.password });

      toast.promise(resetPassword, {
        loading: 'Updating...',
        success: <b>Reset successfully</b>,
        error: <b>could not Reset!</b>
      })

      resetPassword.then(function () {
        navigate('/password')
      });

    }
  })

  if (isLoading) return <h1 className='text-2xl font-bold'>isLoading</h1>;
  if (serverError) return <h1 className='text-xl text-red-500'>{serverError.message}</h1>
if(status &&  status!==201)  return  <Navigate to={'/password'} replace={true}></Navigate>

  return (
    <div className='container mx-auto'>
      <Toaster className="top-center" reverseOrder={false}></Toaster>
      <div className='flex justify-center item-center h-screen'>
        <div className={styles.glass} style={{ width: "50%" }}>

          <div className='title flex flex-col items-center'>
            <h4 className='text-5xl font-bold'>Reset</h4>
            <span className='py-4 text-xl w-2/3 text-center text-gray-500'>
              Enter new Password.
            </span>
          </div>

          <form className='py-20' onSubmit={formik.handleSubmit}>


            <div className='textbox flex flex-col items-center gap-6'>
              <input {...formik.getFieldProps('password')} className={styles.textbox} type="text" placeholder='New Password' />
              <input {...formik.getFieldProps('confirm_password')} className={styles.textbox} type="text" placeholder='Repeat Password' />

              <button className={styles.btn} type='submit'>Reset</button>
            </div>


          </form>

        </div>
      </div>
    </div>
  )
}
