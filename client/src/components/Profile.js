import React from 'react'
import { useState } from 'react';
import avatar from "../assets/profile.png"
import { useFormik } from 'formik';
import { profileValidation } from '../helper/validate';
import toast, { Toaster } from 'react-hot-toast';
import convertToBase64 from '../helper/convert';
import useFetch from '../hooks/fetch.hook';
import styles from '../styles/Username.module.css';
import extend from '../styles/Profile.module.css'
import { updateUser } from '../helper/helper';
import { useNavigate } from 'react-router-dom'

export default function Profile() {

  const [file, setFile] = useState(); //setFile here helps to specify the file variable 
  const [{ isLoading, apiData, serverError }] = useFetch();

  const navigate=useNavigate();

  const formik = useFormik({
    initialValues: {
      firstName: apiData?.firstName || '',
      lastName: apiData?.lastName || '',
      email: apiData?.email || '',
      mobile: apiData?.mobile || '',
      address: apiData?.address || ''
    },
    enableReinitialize: true,
    validate: profileValidation,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async values => {
      values = await Object.assign(values, { profile: file || apiData?.profile || '' }); //its for image upload
      let updatePromise = updateUser(values);

      toast.promise(updatePromise, {
        loading: 'Updating...',
        success: <b>Update successfully</b>,
        error: <b>could not update</b>
      })
    }
  })

  if (isLoading) return <h1 className='text-2xl font-bold'>isLoading</h1>;
  if (serverError) return <h1 className='text-xl text-red-500'>{serverError.message}</h1>

  //formik doesnt support file upload so we need to create new file

  const onUpload = async e => {
    const base64 = await convertToBase64(e.target.files[0]);
    setFile(base64);
  }

  // logout function
  function userLogout(){
    localStorage.removeItem('token');
    navigate('/');
  }

  return (
    <div className='container mx-auto'>
      <Toaster className="top-center" reverseOrder={false}></Toaster>
      <div className='flex justify-center item-center h-screen'>
        <div className={`${styles.glass} ${extend.glass}`} style={{ width: "45%" }}>

          <div className='title flex flex-col items-center'>
            <h4 className='text-5xl font-bold'>profile</h4>
            <span className='py-4 text-xl w-2/3 text-center text-gray-500'>
              You can update the details
            </span>
          </div>

          <form className='py-1' onSubmit={formik.handleSubmit}>

            <div className='profile flex justify-center py-4'>
              <label htmlFor='profile'>
                <img src={apiData?.profile || file || avatar} className={`${styles.profile_img} ${extend.profile_img}`} alt="avatar" />
                {/* this file variable helps to change the image  */}
              </label>
              <input onChange={onUpload} type="file" id='profile' name='profile' />
            </div>

            <div className='textbox flex flex-col items-center gap-6'>
              <div className='name flex w-3/4 gap-10'>

                <input {...formik.getFieldProps('firstName')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder='FirstName' />
                <input {...formik.getFieldProps('lastName')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder='LastName' />
              </div>

              <div className="name flex w-3/4 gap-10">
                <input {...formik.getFieldProps('mobile')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder='Mobile No.' />
                <input {...formik.getFieldProps('email')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder='Email*' />
              </div>


              <input {...formik.getFieldProps('address')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder='Address' />
              <button className={styles.btn} type='submit'>Update</button>

            </div>
            <div className='text-center py-4'>

            <span className='text-gray-500'>come back later? <button onClick={userLogout} className='text-red-500' to="/">Logout</button></span>            </div>
          </form>

        </div>
      </div>
    </div>
  )
}
