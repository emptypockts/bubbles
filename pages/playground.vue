<template>
  <div v-if="play">
    <h1>
      Hello Playground (❁´◡`❁)
    </h1>

    <ul class="bubble-list">
      <li v-for="bubble in bubbles" :key="bubble.id" :style="getBubbleStyle()">
        <div class="bubble-container">
          <div class="bubble">
            <p class="bubble-username">
              @{{ bubble.username }}
            </p>
            <p class="bubble-username">
              at {{ bubble.created_at }}:
            </p>
            <p class="bubble-content">
              {{ bubble.content }}
            </p>
          </div>
        </div>
      </li>
    </ul>
  </div>
  <div class="bubble-form">
    <img v-if="userAvatar" :src="userAvatar" alt="User Avatar" class="avatar" :title="userName" />
    <form @submit.prevent="create_bubble">
      <input v-model="message" label="message" placeholder="bubble pop bubble pop">

      <button type="submit" :disabled="isLoading">
        bubble
      </button>
    </form>
  </div>
</template>
<script setup>

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { initializeWebSocket, sendMessage, closeWebSocket } from '~/utils/websocket';
const route = useRouter();
const isLoading = ref(false);
const play = ref(false);
const bubbles = ref([]);
const userName = ref('');
const message = ref('');
const userAvatar = ref(null);
const getBubbleStyle = () => {
  const randomLeft = Math.random() * 90; // Random position between 0% and 90% of the container width
  const randomDuration = Math.random() * 5 + 5; // Random animation duration between 5s and 10s
  return {
    left: `${randomLeft}%`,
    animation: `rise ${randomDuration}s linear infinite`,
  };
};



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
      console.log(response)
      handleNewBubble(response.bubble);
      message.value = '';
      isLoading.value = false;

    } catch (err) {
      console.log('Error trying to create bubble: ', err)
      isLoading.value = false;
    }
  }

}


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
  try {
    bubbles.value = await $fetch(`/api/get_bubbles?userName=${userName.value}`, {
      baseURL: useRuntimeConfig().public.apiBaseURL,
      method: 'GET'
    })
  } catch (err) {
    console.error('Error fetching bubbles: ', err)
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

  bubbles.value.push(newBubble);
  console.log('bubble pushed successfully')
}

onMounted(async () => {

  await verifyToken();
  get_bubbles();
  get_avatar;
  if (play.value) {
    initializeWebSocket('ws:raspberrypi.local:3000', handleNewBubble);
  }
})

onUnmounted(() => {
  closeWebSocket();
})

</script>

<style>
.bubble-form {
  position: fixed;
  right: 20px;
  bottom: 20px;
  display: flex;
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
  height: 150px;
  overflow: hidden;
  background: rgba(250, 163, 246, 0.121)
}

.bubble {
  position: absolute;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: rgba(135, 206, 250, 0.057);
  box-shadow: 0 2px 2px rgba(102, 159, 244, 0.411);
  display: flex;
  flex-direction: column;
  /* Stack items vertically */
  justify-content: center;
  /* Vertically align items in the center */
  align-items: center;
  /* Horizontally align items in the center */
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: #ffffff;
  animation: float 8s infinite ease-in-out, drift 12s infinite ease-in-out;
  padding: 10px;
  /* Add padding for spacing inside the bubble */
  border: 1px solid #ffffff;
  /* Optional: Border to enhance bubble effect */
  box-sizing: border-box;
  /* Ensure padding doesn't affect bubble size */
}

.bubble-username,
.bubble-content {
  margin: 0;
  padding: 2px 0;
  color: rgba(0, 0, 0, 0.482);
}

.bubble-username {
  font-size: 12px;
  /* Optional: Adjust username size */
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  /* Create a shadow effect */
}

.bubble-content {
  font-size: 14px;
  /* Optional: Adjust content size */
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  /* Create a shadow effect */
}

/* Optional: Add a glow effect to text */
.bubble-username,
.bubble-content {
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
    transform: translateX(20px);
  }

  100% {
    transform: translateX(0px);
  }
}

.bubble-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.bubble-list li {
  margin-bottom: 20px;
}
</style>