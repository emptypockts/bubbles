<template>
  <html lang="EN">    
    <div class="login-container">
      <div class="login-box">
        <h1 class="login-title">
          bubbles<br>
          ( ˘ ³˘)ノ°ﾟº❍｡</h1>
        <form @submit.prevent="handleLogin" class="login-form">
          <div>
            <textarea 
            v-model="userName"
              placeholder="@username"
              required
              class="singleU-field"/>
          </div>
          <div>
            <input
              type="password"
              v-model="password"
              id="password"
              required
              class="singleU-field"
              placeholder="@password"
            />
          </div>
          <div>
            <button :disabled="isLoading" >
              {{ isLoading ? 'Logging in...' : 'Login' }}
            </button>
            <div class="any-message" v-if="anyMessage">
            {{ anyMessage }}
          </div>
          </div>

        </form>
      </div>
    </div>
    </html>

  </template>
<script setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';


const userName= ref('');
const password = ref('');
const isLoading=ref(false);
const anyMessage=ref('');
const router=useRouter();

const handleLogin= async()=>{
    isLoading.value=true;
    anyMessage.value='';
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
       console.log(err);
       showTempMessage(anyMessage,'oopsie we hit a snag, try again later (｡•́︿•̀｡)',2000);
    }finally{
        isLoading.value=false;

    }

}

</script>
<style scoped>
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
  height: auto;
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
  align-items: center;
}


.login-title{
    color: rgb(249, 218, 251);
}
</style>