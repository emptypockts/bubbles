<template>
    <div class="login-container">
      <div class="login-box">
        <h1 class="login-title">
          bubbles<br>
          ( ˘ ³˘)ノ°ﾟº❍｡</h1>
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="input-container">
            <label for="username" class="input-label">Username</label>
            <input
              v-model="userName"
              id="username"
              placeholder="@username"
              required
              class="input-field"
            />
          </div>
          <div class="input-container">
            <label for="password" class="input-label">Password</label>
            <input
              type="password"
              v-model="password"
              id="password"
              required
              class="input-field"
            />
          </div>
          <div class="input-container">
            <button type="submit" :disabled="isLoading" class="submit-button">
              {{ isLoading ? 'Logging in...' : 'Login' }}
            </button>
          </div>
          <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>
        </form>
      </div>
    </div>
  </template>
<script setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';


const userName= ref('');
const password = ref('');
const isLoading=ref(false);
const errorMessage=ref('');
const router=useRouter();

const handleLogin= async()=>{
    isLoading.value=true;
    errorMessage.value='';
    try{
        const response = await $fetch('/api/login_user',{
            baseURL:useRuntimeConfig().public.apiBaseURL,
            method:'POST',
            body:{
                userName:userName.value,
                password:password.value
            },
        });
        console.log(response)
        localStorage.setItem('token',response.token);
        localStorage.setItem('userName',userName.value)
        localStorage.setItem('avatar',response.avatar)
        router.push('/playground')
    }catch(err){
        errorMessage.value=err.message||'Login failed';
    }finally{
        isLoading.value=false;

    }

}

</script>
<style>
/* Login container with background image */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-image: url('https://plus.unsplash.com/premium_photo-1664037539537-1961b6e2e53f?q=80&w=2174&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'); /* Bubble-themed background */
  background-size: cover;
  background-position: center;
  padding: 20px;
}

/* Login box */
.login-box {
  background: rgba(233, 163, 248, 0.324); /* Semi-transparent white background */
  backdrop-filter: blur(10px); /* Frosted glass effect */
  border-radius: 24px; /* Rounded corners */
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  max-width: 400px;
  width: 100%;
  text-align: center;
}

/* Login title */
.login-title {
  font-size: 2rem;
  color: #f5c1f4;
  margin-bottom: 20px;
  font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
}


/* Login form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Input container */
.input-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Input label */
.input-label {
  font-size: 2rem;
  color: #ffffff;
  text-align: left;
  font-weight: 400;
  font-size: 16px;
  font-family:'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
}

/* Input field */
.input-field {
  padding: 12px 16px;
  font-size: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.5); /* Semi-transparent border */
  border-radius: 12px; /* Rounded corners */
  outline: none;
  background: rgba(255, 255, 255, 0.8); /* Semi-transparent background */
  color: #333;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.input-field:focus {
  border-color: rgba(250, 101, 242, 0.8); /* Bubble's pink color */
  box-shadow: 0 0 10px rgba(250, 101, 242, 0.4); /* Glow effect */
}

/* Submit button */
.submit-button {
  padding: 12px 24px;
  font-size: 1rem;
  background: radial-gradient(
    circle at 10% 10%,
    rgba(255, 255, 255, 0.8),
    rgba(250, 101, 242, 0.4) 40%,
    rgba(250, 101, 242, 0.2) 70%,
    rgba(250, 101, 242, 0.1) 100%
  ); /* Bubble gradient */
  color: #fdebf6c9; /* Bubble text color */
  border: 1px solid rgba(229, 174, 253, 0.5); /* Semi-transparent border */
  border-radius: 24px; /* Rounded corners */
  cursor: pointer;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.submit-button:disabled {
  opacity: 0.6; /* Reduce opacity when disabled */
  cursor: not-allowed;
}

.submit-button:hover:not(:disabled) {
  background: radial-gradient(
    circle at 30% 30%,
    rgba(250, 249, 250, 0.9),
    rgba(250, 101, 242, 0.5) 40%,
    rgba(250, 101, 242, 0.3) 70%,
    rgba(250, 101, 242, 0.2) 100%
  ); /* Brighter gradient on hover */
  box-shadow: 0 0 10px rgba(250, 101, 242, 0.4); /* Glow effect */
}

/* Error message */
.error-message {
  color: #faf9f9; /* Red color for errors */
  font-size: 0.9rem;
  margin-top: 10px;
}
.login-title{
    color: rgb(249, 218, 251);
}
</style>