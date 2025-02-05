<template>
  <div class="app-container">
    <meta name="viewport" content="width=device-width, initial-scale=0.5">
  <div v-if="play" class="bubble-container">
    <div >
      <div v-for="bubble in sortedBubbles" :key="bubble.id" :style="getBubbleStyle(bubble)"
        :class="bubble.username === userName ? 'my-bubble': 'bubble'">

        <button v-if="bubble.username===userName" @click="deleteBubble(bubble.bubble_id)" class="bubble-delete-logo">
          ˗ˏˋ ♡ ˎˊ˗ 
          </button>
        <p class="bubble-username">
          <div v-if="bubble.username!==userName">
          {{ bubble.username }} said<br>
          </div>
          <div v-else>
            me said
          </div>
          <small class="bubble-date">
            {{ bubble.timeAgo }} ago:
            <p class="bubble-content">
              {{ bubble.content }}
            </p>
          </small>
        </p>
      </div>
    </div>

  </div>
  
  <div class="bubble-form">
    <img v-if="userAvatar" :src="userAvatar" alt="User Avatar" class="avatar" :title="userName" />
    <div class="menu-container">
      <button class="menu-button" @click="toggleMenu">
        &#x22EE;
      </button>
      
      <div v-if="showMenu" class="menu-dropdown">
        <button @click="logout">logout</button>
      </div>
    </div>
    <form @submit.prevent="create_bubble" class="input-container">
      <input v-model="message" label="message" placeholder="bubble pop bubble pop" class="input-field">

      <button type="submit" :disabled="isLoading" class="submit-button">
        post
      </button>
  
    <button v-if="!isLoading" @click="loadMore" class="submit-button">
    load more
  </button>
  
    </form>
  </div>

</div>
</template>
<script setup>

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNuxtApp, useRuntimeConfig } from '#app';
import { formatDateAgo } from '#imports';
const {$websocket}=useNuxtApp();
const route = useRouter();
const isLoading = ref(false);
const play = ref(false);
const bubbles = ref([]);
const allBubbles = ref([]);
const userName = ref('');
const message = ref('');
const userAvatar = ref(null);
const lastLoadedAt = ref(null);
const allLastLoadedAt = ref(null);

const showMenu = ref(false);
const toggleMenu = () => {
  showMenu.value = !showMenu.value
};
const logout = () => {
  console.log('bye bye')
  localStorage.clear();
  route.push('/');
}

const create_bubble = async () => {
  isLoading.value = true;
  if (play.value) {
    try {
      const response = await $fetch('api/create_bubble', {
        baseURL: useRuntimeConfig().public.apiBaseURL,
        method: 'POST',
        body: {
          userName: userName.value,
          content: message.value
        }
      })
      console.log('bubble created response :',response.bubble);
      $websocket.send(JSON.stringify(response.bubble))
      // removed this as it is redundant with the websocket line above 👆
      // handleNewBubble(response.bubble);
      message.value = '';
      isLoading.value = false;

    } catch (err) {
      console.log('Error trying to create bubble: ', err)
      isLoading.value = false;
    }
  }

}

const deleteBubble=async (bubbleId)=>{
  isLoading.value=true;
  console.log('deleting bubbleId',bubbleId)
  console.log('user',userName.value)
  try{
  const response  = await $fetch('/api/delete_bubble',{
    baseURL:useRuntimeConfig().public.apiBaseURL,
    method:'POST',
    body:{
      bubbleId: bubbleId,
      userName:userName.value
    }
  })
  console.log('bubble deleted',response)
  console.log(bubbles.value)
  bubbles.value =bubbles.value.filter(bubble=>bubble.bubble_id!==bubbleId);
  console.log('now we have this ',bubbles.value)
  }catch(err){
    console.error('error deleting bubble',err)
    isLoading.value=false;
  }finally{
    isLoading.value=false;
  }

};

const verifyToken = async () => {

  isLoading.value = true;
  const token = localStorage.getItem('token');
  try {
    const decodeToken = await $fetch('/api/verify_token', {
      baseURL: useRuntimeConfig().public.apiBaseURL,
      method: 'POST',
      body: {
        token: token
      }
    })

    if (decodeToken.token) {
      console.log("valid token found Loading playground for: ", decodeToken.token.username)
      userName.value = decodeToken.token.username
      play.value = true

      isLoading.value = false;
    } else {
      console.error('Token expired :', decodeToken.error)
      play.value = false;
      localStorage.clear();
      route.push('/')


    }
  } catch (err) {
    console.error('Token verification error: ', err)
    localStorage.clear();
    play.value = false;
    route.push('/')
  } finally {
    isLoading.value = false;
  }
};


const get_bubbles = async () => {
  isLoading.value = true;
  try {
    const params = new URLSearchParams({
      userName: userName.value,
    });
    if (lastLoadedAt.value) {
      params.append("lastLoadedAt", lastLoadedAt.value)
    }

    const response = await $fetch(`/api/get_bubbles?${params.toString()}`, {
      baseURL: useRuntimeConfig().public.apiBaseURL,
      method: 'GET'
    })
    console.log('response is ', response)
    console.log('response length ', response.length)
    if (response && response.length > 0) {
      const bubblesWithPosition=response.map(bubble=>({
        ...bubble,
        left:Math.random()*90,
      }));
      bubbles.value.push(...bubblesWithPosition)
      lastLoadedAt.value = response[response.length - 1].created_at;
    }
  } catch (err) {
    console.error('Error fetching bubbles: ', err)
  } finally {
    isLoading.value = false;
  }
}

const get_bubbles_all = async () => {
  isLoading.value = true;
  try {
    const params = new URLSearchParams({
      userName: userName.value
    })
    if (lastLoadedAt.value) {
      params.append("lastLoadedAt", lastLoadedAt.value)

    }
    const response = await $fetch(`/api/get_bubbles_all?${params.toString()}`, {
      baseURL: useRuntimeConfig().public.apiBaseURL,
      method: 'GET'
    })
    console.log('response is ', response)
    console.log('response length ', response.length)
    if (response && response.length > 0) {
      const bubblesWithPosition=response.map(bubble=>({
        ...bubble,
        left:Math.random()*90,
      }));
      allBubbles.value.push(...bubblesWithPosition)
      allLastLoadedAt.value = response[response.length - 1].created_at;
    }
  } catch (err) {
    console.error('error fetching all user bubbles', err)
  } finally {
    isLoading.value = false;
  }
}

const get_avatar = async () => {
  try {
    userAvatar.value = localStorage.getItem('avatar')
  } catch (err) {
    console.error('Error trying to get avatar: ', err)
  }
};

const handleNewBubble = (newBubble) => {
  newBubble.left=Math.random()*90;
  bubbles.value.push(newBubble);
  console.log('handling new bubble: ',newBubble);

}
const loadMore = () => {
  get_bubbles();
  get_bubbles_all();
}

onMounted(async () => {

  await verifyToken();
  get_bubbles();
  get_bubbles_all();
  get_avatar();
  if (play.value) {
    console.log('WebSocket connection attempted');
    $websocket.connect('ws://raspberrypi.local:3003',handleNewBubble);

  
  }
  
})

onUnmounted(() => {
  $websocket.close;
});
const sortedBubbles = computed(() => {
  const combined = [...bubbles.value, ...allBubbles.value];

  return combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(combined=>({
    ...combined,
    timeAgo:formatDateAgo(combined.created_at)
  }))
});



const getBubbleStyle = (bubble) => {
  return {
    left: `${bubble.left}%`
  };
};



</script>
<style>

.app-container{
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  background-image:url('https://plus.unsplash.com/premium_photo-1664037539537-1961b6e2e53f?q=80&w=2174&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'); /* Bubble-themed background */
  background-size:auto;
  background-position: center;
  padding: 20px;
  background-color: rgba(241, 163, 237, 0.071);
  background-repeat: repeat-y;
}
.bubble-delete-logo{
  size: 10px;
  background: transparent;
  border: transparent;
  color:white;
}
.bubble-delete-logo:hover {
    color: #1c0101ce;
    opacity:.5;
    cursor: pointer;
    
}

.bubble-form {
  position:fixed;
  right: 20px;
  bottom: 20px;
  display: flex;
  align-items: center;
  background: rgba(187, 127, 174, 0.326); /* Semi-transparent background */
  padding: 10px;
  border-radius: 24px; /* Rounded corners to match bubbles */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Subtle shadow */
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
}

.my-bubble {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: radial-gradient(circle at 20% 20%,
      rgba(255, 255, 255, 0.683),
      rgba(250, 101, 242, 0.345) 40%,
      rgba(250, 101, 242, 0.2) 70%,
      rgba(250, 101, 242, 0.1) 100%);
  box-shadow:
    0 4px 10px rgba(234, 125, 237, 0.3),
    0 0 20px rgba(255, 255, 255, 0.5) inset,
    0 0 30px rgba(255, 255, 255, 0.3) inset;
  display: flex;
  flex-direction: column;
  /* Stack items vertically */
 
  text-align: center;
  font-size: 14px;
  color: #f90b9ac9;
  animation: float 20s infinite ease-in-out, drift 20s infinite ease-in-out;
  padding: 10px;
  /* Add padding for spacing inside the bubble */
  border: 1px solid rgba(255, 255, 255, 0.5);
  /* Semi-transparent border */
  box-sizing: border-box;
  /* Ensure padding doesn't affect bubble size */
  overflow: hidden;
  /* Ensure content stays within the bubble */
  z-index: 2; /* Ensure it's above bubbles */

}

/* Add a pseudo-element for a reflection effect */
.my-bubble::before, .bubble::before{
  content: '';
  position: absolute;
  top: 10%;
  left: 20%;
  width: 40%;
  height: 20%;
  background: radial-gradient(circle at 50% 50%,
      rgb(241, 236, 241),
      rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  transform: rotate(45deg);
  opacity: .1;
}

/* Float animation */
@keyframes float {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-20px) rotate(20deg);
  }
}

/* Drift animation */
@keyframes drift {

  0%,
  100% {
    transform: translateX(0);
  }

  50% {
    transform: translateX(100px);
  }
}

.bubble-username,
.bubble-date {
  margin: 0;
  font-family:sans-serif;
  font-weight:400;
  color: rgba(252, 247, 247, 0.906);
  font-size:16px;

}

.bubble-content{
  color:white
}

.bubble {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: radial-gradient(circle at 20% 20%,
      rgba(255, 255, 255, 0.6),
      rgba(101, 153, 250, 0.4) 40%,
      rgba(101, 193, 250, 0.2) 70%,
      rgba(145, 165, 254, 0.1) 100%);
  box-shadow:
    0 4px 10px rgba(234, 125, 237, 0.3),
    0 0 20px rgba(255, 255, 255, 0.5) inset,
    0 0 30px rgba(255, 255, 255, 0.3) inset;
  display: flex;
  flex-direction: column;
  /* Stack items vertically */
  justify-content: center;
  /* Vertically align items in the center */
  align-items: center;
  /* Horizontally align items in the center */
  text-align: center;
  font-size: 14px;
  color: #f90b9ac9;
  animation: float 20s infinite ease-in-out, drift 20s infinite ease-in-out;
  padding: 10px;
  /* Add padding for spacing inside the bubble */
  border: 1px solid rgba(255, 255, 255, 0.5);
  /* Semi-transparent border */
  box-sizing: border-box;
  /* Ensure padding doesn't affect bubble size */
  overflow: hidden;
  /* Ensure content stays within the bubble */
}

/* Add a pseudo-element for a reflection effect */
.bubble::before {
  content: '';
  position: absolute;
  top: 10%;
  left: 20%;
  width: 40%;
  height: 20%;
  background: radial-gradient(circle at 50% 50%,
      rgba(255, 255, 255, 0.687),
      rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  transform: rotate(45deg);
  opacity: 0.4;
}





.input-container {
  display: flex;
  align-items: center;
  gap: 10px; /* Space between input and button */
  width: 100%;
  
}

.input-field {
  flex: 1; /* Take up remaining space */
  padding: 12px 16px; /* Larger padding */
  font-size: 16px; /* Larger font size */
  border: 1px solid rgba(255, 255, 255, 0.5); /* Semi-transparent border */
  border-radius: 24px; /* Rounded corners */
  outline: none; /* Remove default outline */
  background: rgba(255, 255, 255, 0.356); /* Semi-transparent background */
  color: #f9f6f6; /* Dark text color */
  transition: border-color 0.3s ease, box-shadow 0.3s ease; /* Smooth transitions */
  flex-direction: row;
}

.input-field:focus {
  border-color: rgba(224, 207, 223, 0.8); /* Bubble's pink color */
  box-shadow: 0 0 10px rgba(250, 101, 242, 0.4); /* Glow effect */
}
.submit-button {
  padding: 12px 24px; /* Larger padding */
  font-size: 16px; /* Larger font size */
  background: radial-gradient(
    circle at 10% 10%,
    rgba(255, 255, 255, 0.742),
    rgba(250, 101, 242, 0.4) 40%,
    rgba(250, 101, 242, 0.2) 70%,
    rgba(250, 101, 242, 0.1) 100%
  ); /* Bubble gradient */
  color: #f9f7f8e8; /* Bubble text color */
  border: 1px;
  border-radius: 20px; /* Rounded corners */
  cursor: pointer;
  transition: background 0.3s ease, box-shadow 0.3s ease; /* Smooth transitions */
}

.submit-button:disabled {
  opacity: 0.6; /* Reduce opacity when disabled */
  cursor: not-allowed;
}


.submit-button:hover:not(:disabled) {
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.317),
    rgba(250, 101, 242, 0.5) 40%,
    rgba(250, 101, 242, 0.3) 70%,
    rgba(250, 101, 242, 0.2) 100%
  ); /* Brighter gradient on hover */
  box-shadow: 0 0 10px rgba(238, 182, 235, 0.4); /* Glow effect */
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
  color: #fae6f2c9; /* Bubble text color */
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(190, 59, 162, 0.326); /* Semi-transparent background */
  border: 1px solid rgba(255, 255, 255, 0.5); /* Semi-transparent border */
  border-radius: 12px; /* Rounded corners */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  z-index: 1000;
  padding: 5px;
  backdrop-filter: blur(5px); /* Blur effect for frosted glass */
}

.menu-dropdown button {
  background: none;
  border: none;
  padding: 8px 16px; /* Larger padding */
  font-size: 14px;
  cursor: pointer;
  width: 100%;
  text-align: left;
  color: white; /* Dark text color */
  border-radius: 8px; /* Rounded corners */
  transition: background 0.3s ease; /* Smooth transition */
}

.menu-dropdown button:hover {
  background: rgba(250, 101, 242, 0.2); /* Light pink background on hover */
}
.bubble-container{
  position: flex;
  top:20px;
  margin-top: 0%;
  justify-content: center;
}

</style>