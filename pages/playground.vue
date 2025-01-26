<template>
    <div v-if="play">
        <h1>
            Hello Playground (❁´◡`❁)
        </h1>
          <div class="bubble-container">
            <div v-for="bubble in bubbles" :key="bubble.id" :style="getBubbleStyle()" class="bubble">
                    <p class="bubble-username"> @{{bubble.username}}</p>
                    
                    <small class="bubble-content">
                        at {{ bubble.created_at }}:
                    </small>
                    <p class="bubble-content">
                        {{ bubble.content }} 
                    </p>
                </div>
                <div v-for="allBubble in allBubbles" :key="allBubble.id" :style="getBubbleStyle()" class="bubble">
                  <p class="bubble-username">@{{ allBubble.username }}

                  </p>
                  <small class="bubble-content">
                    at{{ allBubble.created_at}}
                  </small>
                  <p class="bubble-content">
                    {{ allBubble.content }}

                  </p>
                </div>
            </div>
        </div>
        <button v-if="!isLoading" @click="loadMore" class="load-more">
          load more
        </button>
        <p v-else>
          loading...
        </p>
        <div class="bubble-form">
            <img v-if="userAvatar" :src="userAvatar" alt="User Avatar" class="avatar" :title="userName"/>
            <div class="menu-container">
              <button class="menu-button" @click="toggleMenu">
                &#x22EE;
              </button>
              <div v-if="showMenu" class="menu-dropdown">
                <button @click="logout">logout</button>
              </div>
            </div>
        <form @submit.prevent="create_bubble">
        <input v-model="message" label="message" placeholder="bubble pop bubble pop">
        
        <button type="submit":disabled="isLoading">
            bubble
        </button>
    </form>
</div>
</template>
<script setup>

import {ref, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import { initializeWebSocket,sendMessage,closeWebSocket } from '~/utils/websocket';
const route = useRouter();
const isLoading = ref(false);
const play = ref(false);
const bubbles = ref([]);
const allBubbles=ref([]);
const userName=ref('');
const message=ref('');
const userAvatar=ref(null);
const lastLoadedAt=ref(null);
const allLastLoadedAt=ref(null);
const getBubbleStyle = () => {
  const randomLeft = Math.random() * 90; // Random position between 0% and 90% of the container width
  const randomDuration = Math.random() * 5 + 5; // Random animation duration between 5s and 10s
  return {
    left: `${randomLeft}%`,
    animation: `rise ${randomDuration}s linear infinite`,
  };
};

const showMenu=ref(false);
const toggleMenu=()=>{
  showMenu.value =!showMenu.value
};
const logout=()=>{
  console.log('bye bye')
  localStorage.clear();
  route.push('/');
}

const create_bubble=async()=>{
    isLoading.value=true;
    if (play.value){
    try{
        const response = await $fetch('api/create_bubble',{
            baseURL:useRuntimeConfig().public.apiBaseURL,
            method:'POST',
            body:{
                userName:userName.value,
                content:message.value
            }
        })
        console.log(response)
        handleNewBubble(response.bubble);
        message.value='';
        isLoading.value=false;
        
    }catch (err){
        console.log('Error trying to create bubble: ',err)
        isLoading.value=false;
    }
    }

}


const verifyToken= async ()=>{

    isLoading.value=true;
    const token = localStorage.getItem('token');
try{
    const decodeToken= await $fetch('/api/verify_token',{
        baseURL:useRuntimeConfig().public.apiBaseURL,
        method:'POST',
        body:{
            token:token
        }
    })
    
    if (decodeToken.token){
        console.log("valid token found Loading playground for: ",decodeToken.token.username)
        userName.value=decodeToken.token.username
        play.value =true

        isLoading.value=false;
    }else{
        console.error('Token expired :',decodeToken.error)
        play.value=false;
        localStorage.clear();
        route.push('/')


    }   
}catch(err){
console.error('Token verification error: ',err)
localStorage.clear();
play.value=false;
route.push('/')
}finally{
    isLoading.value=false;
}
};


const get_bubbles=async ()=>{
  isLoading.value = true;
    try{
      const params = new URLSearchParams({
        userName:userName.value,
      });
      if (lastLoadedAt.value){
        params.append("lastLoadedAt",lastLoadedAt.value)
      }

    const response =await $fetch(`/api/get_bubbles?${params.toString()}`,{
        baseURL:useRuntimeConfig().public.apiBaseURL,
        method:'GET'
    })
    console.log('response is ',response)
console.log('response length ',response.length)
    if(response && response.length>0){
      bubbles.value.push(...response)
      lastLoadedAt.value = response[response.length-1].created_at;
    }
}catch (err){
    console.error('Error fetching bubbles: ',err)
}finally{
  isLoading.value=false;
}
}

const get_bubbles_all=async ()=>{
isLoading.value=true;
try{
const params = new URLSearchParams({
  userName:userName.value
})
if(lastLoadedAt.value){
  params.append("lastLoadedAt",lastLoadedAt.value)

}
const response = await $fetch(`/api/get_bubbles_all?${params.toString()}`,{
  baseURL:useRuntimeConfig().public.apiBaseURL,
  method:'GET'
})
console.log('response is ',response)
console.log('response length ',response.length)
if(response && response.length>0){
allBubbles.value.push(...response)
allLastLoadedAt.value=response[response.length-1].created_at;
}
}catch (err){
  console.error('error fetching all user bubbles',err)
}finally{
  isLoading.value=false;
}
}

const get_avatar=async()=>{
    try{
       userAvatar.value=localStorage.getItem('avatar')
    }catch(err){
        console.error('Error trying to get avatar: ',err)
    }
};

const handleNewBubble=(newBubble) =>{

    bubbles.value.push(newBubble);
    console.log('bubble pushed successfully')
}
const loadMore=()=>{
  get_bubbles();
  get_bubbles_all();
}

onMounted(async ()=>{

    await verifyToken();
    get_bubbles();
    get_bubbles_all();
    get_avatar();
    if (play.value){
        initializeWebSocket('ws:raspberrypi.local:3000',handleNewBubble);
    }
})

onUnmounted(()=>{
    closeWebSocket();
})

</script>
<style>
.bubble-form {
  position: fixed;
  right: 20px;
  bottom:20px;
display:flex;
align-items: center;
}
.avatar {
width: 50px;
height: 50px;
border-radius: 50%;
object-fit: cover;
margin-right: 10px;
}
.bubble-container {
position: relative;
width: 100%;
height: 100%;
overflow-y: auto;
background:rgba(250, 163, 246, 0.121)
}
.bubble {
position: relative;
width: 150px;
height: 150px;
border-radius: 50%;
background: rgba(135, 206, 250, 0.057);
box-shadow: 0 2px 2px rgba(102, 159, 244, 0.411);
display: flex;
flex-direction: column; /* Stack items vertically */
justify-content: center; /* Vertically align items in the center */
align-items: center; /* Horizontally align items in the center */
text-align: center;
font-size: 14px;
font-weight: bold;
color: #ffffff;
animation: float 8s infinite ease-in-out, drift 12s infinite ease-in-out;
padding: 10px; /* Add padding for spacing inside the bubble */
border: 1px solid #ffffff; /* Optional: Border to enhance bubble effect */
box-sizing: border-box; /* Ensure padding doesn't affect bubble size */
}

.bubble-username,
.bubble-content {
margin: 0;
padding: 2px 0;
color: rgba(0, 0, 0, 0.482);
}

.bubble-username {
font-size: 12px; /* Optional: Adjust username size */
text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5); /* Create a shadow effect */
}

.bubble-content {
font-size: 14px; /* Optional: Adjust content size */
text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5); /* Create a shadow effect */
}

/* Optional: Add a glow effect to text */
.bubble-username, .bubble-content {
text-shadow: 0 0 8px rgba(255, 255, 255, 0.8), 0 0 12px rgba(255, 255, 255, 0.6);
}


/* Float animation: Moves the bubble up and down */
@keyframes float {
0% {
  transform: translateY(0px);
}
50% {
  transform: translateY(-30px);
}
100% {
  transform: translateY(0px);
}
}

/* Drift animation: Moves the bubble left and right */
@keyframes drift {
0% {
  transform: translateX(0px);
}
50% {
  transform: translateX(200px);
}
100% {
  transform: translateX(0px);
}
}

.menu-container {
position: relative;
}

.menu-button {
background: none;
border: none;
font-size: 1.5rem;
cursor: pointer;
margin-left: 10px;
}

.menu-dropdown {
position: absolute;
top: 100%;
right: 0;
background: white;
border: 1px solid #ccc;
box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
border-radius: 5px;
z-index: 1000;
padding: 5px;
}

.menu-dropdown button {
background: none;
border: none;
padding: 5px 10px;
cursor: pointer;
width: 100%;
text-align: left;
}

.menu-dropdown button:hover {
background: #f0f0f0;
}

.load-more {
padding: 10px 20px;
border: none;
background-color: #007bff;
color: rgb(77, 16, 16);
cursor: pointer;
border-radius: 5px;
}
</style>