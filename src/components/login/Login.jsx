import React, { useState } from 'react'
import "./login.css"
import { toast } from 'react-toastify'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import upload from '../../lib/upload'
const Login = () => {

  const [avatar,setAvatar]=useState({
    file:null,
    url:""
  })

  const [loading,Setloading]=useState(false);
  const handleAvatar=e=>{
    if(e.target.files[0]){
      setAvatar({
        file:e.target.files[0],
        url:URL.createObjectURL(e.target.files[0])
      })
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    Setloading(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const { username, email, password } = data;
  
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const imgUrl=await upload(avatar.file);
      await setDoc(doc(db,"users",res.user.uid),{
        username,
        email,
        avatar:imgUrl,
        id:res.user.uid,
        blocked:[],
      });

      await setDoc(doc(db,"userchats",res.user.uid),{
        chats:[],
      })
      toast.success("Account created! You can login now !");
      
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }finally{
      Setloading(false);
    }
  };

  const handleLogin=async(e)=>{
    e.preventDefault();
    Setloading(true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const {email, password } = data;

    try{

      await signInWithEmailAndPassword(auth,email,password)
      toast.success("Welcome again");

    }
    catch(err){
      console.log(err);
      toast.error(err.message);
    }
    finally{
      Setloading(false);
    }

  };
  return (
    <div className='login'>
      <div className="item">
        <h2>Welcome back,</h2>
        <form onSubmit={handleLogin}>
          <input type="text"  placeholder='Email' name='email'/>
          <input type="password" placeholder='Password' name='password' />
          <button disabled={loading}>{loading ? "loading" : "Sign In"}</button>
        </form>
      </div>
      <div className="separator"></div>
      <div className="item">
        <div className="separator"></div>
      <h2>Create an Account,</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            <img src={avatar.url || "./avatar.png"} alt="" />
          Upload an image
            </label>
          <input type="file" id='file'  style={{display:"none"}} onChange={handleAvatar} /> 
          <input type="text" placeholder='Username' name='username' />
          <input type="text"  placeholder='Email' name='email'/>
          <input type="password" placeholder='Password' name='password' />
          <button disabled={loading}>{loading ? "loading" : "Sign Up"}</button>
        </form>
      </div>
    </div>
  )
}

export default Login