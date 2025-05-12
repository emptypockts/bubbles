<template>
  <div v-if="play" class="app-container" :class="{blurred:groupGui}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <div class="bubble-container">
      <div v-if="(!selectedGroupName)">
        <h1 style="font-size: 14px">⋆✴︎˚｡⋆playground⋆✴︎˚｡⋆</h1>
      </div>
      <div v-else>
        <h1 style="font-size: 14px">⋆✴︎˚｡⋆{{ selectedGroupName }}⋆✴︎˚｡⋆</h1>
      </div>
      <div>
        <div v-for="bubble in sortedBubbles" :key="bubble.id" :style="getBubbleStyle(bubble)"
          :class="bubble.username === userName ? 'my-bubble' : 'bubble'">
          <button v-if="bubble.username === userName" @click="deleteBubble(bubble.bubble_id)"
            class="bubble-delete-logo">
            ˗ˏˋ ♡ ˎˊ˗
          </button>
          <div class="bubble-username">
            <div v-if="bubble.username !== userName">
              <img v-if="avatars[bubble.username]" :src="avatars[bubble.username]" alt="user avatar" class="mini-avatar"
                :title="bubble.username" />
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
          </div>
        </div>
      </div>

    </div>
    <div class="forms-container">
      <div class="bubble-form">
        <div class="avatar-container">
          <div class="avatar-wrapper">
          <img 
          v-if="userAvatar" 
          :src="userAvatar" 
          alt="User Avatar" 
          class="avatar" 
          :title="userName" 
          @click="invitationCenterDisp=!invitationCenterDisp"
          />
          <span v-if="invitationCount>0" class="badge">
            {{ invitationCount }}
          </span>
        </div>
          <div class="menu-container">
            <button class="dots" @click="toggleMenu">
              &#x22EE;
            </button>
          </div>
          <div v-if="showMenu">
            <button @click="logout" class="menu-dropdown">logout</button>
          </div>
        </div>
        <form @submit.prevent="create_bubble">
          <textarea v-model="message" label="message" placeholder="what are you up to?" class="input-field" />
          <div class="buttons">
            <button type="submit" :disabled="isLoading || message.length > 80" class="submit-button">
              post
              {{ 80 - message.length }} characters left
            </button>
            <button @click="loadMore" class="submit-button" :disabled="isLoading">
              load more
            </button>
          </div>
        </form>
      </div>
      <div class="block-form">
        <ai />
      </div>
      <div class="block-form">
        <h1>Groups (´｡• ᵕ •｡`) </h1>
        <button @click="createGroup()" class="modify-button">
        create group
        </button>
        <div v-for="groupName in myGroups" :key="groupName.group_id">
          <button  @click="go_to_group(groupName.group_id,groupName.name)" class="groups">
            {{ groupName.name }}
          </button>
          <button @click="modifyGroup(groupName.group_id,groupName.name)" class="modify-button">
            ✎﹏
          </button>
        </div>
        <button @click="backToPlayground()" class="modify-button">
          playground
        </button> 

      </div>

    </div>
  </div>
  <div class="floating-group-center">
      <groupCenter v-if="groupGui" :group_id="selectedGroupId" :userName="userName" :groupName="selectedGroupName" @close="groupGui=false"/>
      </div>
      <div class="floating-group-center">
        <createGroupCenter v-if="createGroupGui" :userName="userName" @close="createGroupGui=false"/>
      </div>
      <div class="floating-group-center">
        <invitationCenter v-if="invitationCenterDisp" :invitations="userInvitations" @close="invitationCenterDisp=false"/>
      </div>

</template>
<script setup>
useHead({
  title: 'Bubbles',
});

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNuxtApp, useRuntimeConfig } from '#app';
import { formatDateAgo } from '#imports';
import ai from './ai.vue';
import groupCenter from './groupCenter.vue';
import createGroupCenter from './createGroupCenter.vue';
import invitationCenter from './invitationCenter.vue';
const webSocketUrl = 'wss://wss.dahoncho.com';
const isConnected = ref(false);
const { $websocket } = useNuxtApp();
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
const avatars = ref({});
const group_id = ref(null);
const groupGui = ref(false);
const groupsNames = ref([]);
const myGroups= ref([]);
const showMenu = ref(false);
const selectedGroupId = ref(null);
const selectedGroupName=ref(null);
const createGroupGui=ref(false);
const invitationCount=ref(0);
const invitationCenterDisp=ref(false);
const userInvitations=ref([]);
const toggleMenu = () => {
  showMenu.value = !showMenu.value
};
const backToPlayground = async ()=>{
  group_id.value = null;
  selectedGroupId.value=null;
  selectedGroupName.value=null;
  bubbles.value = [];
  allBubbles.value = [];
  lastLoadedAt.value = null;
  allLastLoadedAt.value = null;

  await get_bubbles();
  await get_bubbles_all();

}
const logout = () => {
  console.log('bye bye')
  localStorage.clear();
  route.push('/');
};
const connectWebSocket = () => {
  console.log('attempting to connect websocket...');
  $websocket.connect(webSocketUrl, defineMessage);

};
const defineMessage = (event) => {
  switch (event.type) {
    case 'bubble':
      if (selectedGroupId.value == event.data.group_id) {
        console.log('bubble matching group, calling for update')
        handleNewBubble(event.data);
      }
      break;
      case 'invitation':
        console.log('invitation sent!')
        getInvitations();
        break;
    default:
      console.error('invalid websocket message', event);
      break;
  }
};
const disconnectWebSocket = () => {
  if (isConnected.value) {
    console.log('closing websocket connection');
    $websocket.close();
    isConnected.value = false;
  }
};
const create_bubble = async () => {
  await verifyToken();
  isLoading.value = true;
  const token = localStorage.getItem('token');
  if (play.value) {
    try {
      const response = await $fetch('api/create_bubble', {
        baseURL: useRuntimeConfig().public.apiBaseURL,
        method: 'POST',
        body: {
          userName: userName.value,
          content: message.value,
          token: token,
          group_id:group_id.value
        }
      })
      console.log('bubble created');
      $websocket.send(JSON.stringify(response))
      message.value = '';
      isLoading.value = false;

    } catch (err) {
      console.log('Error trying to create bubble: ', err)
      isLoading.value = false;
    }
  }

};
const deleteBubble = async (bubbleId) => {
  const token = localStorage.getItem('token');
  const bubbleSound = new Audio('/bubble.mp3');
  isLoading.value = true;
  console.log('deleting bubbleId', bubbleId)
  console.log('user', userName.value)
  try {
    const response = await $fetch('/api/delete_bubble', {
      baseURL: useRuntimeConfig().public.apiBaseURL,
      method: 'POST',
      body: {
        bubbleId: bubbleId,
        userName: userName.value,
        token: token
      }
    })
    console.log('bubble deleted', response)
    bubbleSound.play().catch(error => console.error("Error playing sound:", error));

    console.log(bubbles.value)
    bubbles.value = bubbles.value.filter(bubble => bubble.bubble_id !== bubbleId);


  } catch (err) {
    console.error('error deleting bubble', err)
    isLoading.value = false;
  } finally {
    isLoading.value = false;
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

    } else {
      console.error('Token expired :', decodeToken.error)
      route.push('/')
      localStorage.clear();
      play.value = false;
    }
  } catch (err) {
    console.error('Token verification error: ', err)
    route.push('/')
    localStorage.clear();
    play.value = false;

  } finally {
    console.log('turning off loading status')
    isLoading.value = false;

  }
};
const modifyGroup = async (groupId,groupName) => {
  groupGui.value = true
  userName.value = localStorage.getItem('userName')
  selectedGroupId.value =groupId;
  selectedGroupName.value=groupName;
  group_id.value=groupId;
  console.log('the the group id ', selectedGroupId.value);
  console.log('the username is ', userName.value);
  console.log('the group name is',selectedGroupName.value);
};
const createGroup = async()=>{
  createGroupGui.value=true;
  userName.value=localStorage.getItem('userName');
}
const go_to_group= async (groupId,groupName)=>{
  console.log('go to group',groupId);
  console.log('group callced',groupName);
  selectedGroupId.value =groupId;
  selectedGroupName.value=groupName;
  group_id.value=groupId;
  bubbles.value = [];
  allBubbles.value = [];
  lastLoadedAt.value = null;
  allLastLoadedAt.value = null;
  await get_bubbles();
  await get_bubbles_all();
}
const get_my_groups = async()=>{
  console.log('getting my groups')
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');
  try{
    const params = new URLSearchParams({
      userName:userName,
      token:token
    })
    const response = await $fetch(`/api/get_my_groups?${params.toString()}`,{
      baseURL:useRuntimeConfig().public.apiBaseURL,
      method:'GET'
    });
    console.log('my groups',response)
    if (response&&response.length>0){
      myGroups.value=response.map(myGroup=>({
        ...myGroup
      }))
    }
  }
  catch (err){
    console.error('error trying to call api',err);

  }
};
const get_groups = async () => {
  console.log('getting groups')
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName')
  try {
    const params = new URLSearchParams({
      userName: userName,
      token: token
    })
    const groupsTable = await $fetch(`/api/get_users_groups?${params.toString()}`, {
      baseURL: useRuntimeConfig().public.apiBaseURL,
      method: 'GET'
    });
    if (groupsTable && groupsTable.length > 0) {
      console.log('groups available', groupsTable)
      groupsNames.value = groupsTable.map(groupName => ({
        ...groupName
      }))

    }
  }
  catch (err) {
    console.error('error fetching groups', err)

  }
};
const getInvitations = async ()=>{
  console.log('pulling invitations');
  const token =localStorage.getItem('token');
try{
  const params = new URLSearchParams({
    userName:userName.value,
    token:token
  })
  const response = await $fetch(`/api/v1/invitations?${params.toString()}`,{
    baseURL:useRuntimeConfig().public.apiBaseURL,
    method:'GET'
  })
  userInvitations.value=response;
  invitationCount.value=response.length;

  console.log('invitations',response.length);
} 
catch(err){
 console.error('erorr trying to fetch invitations',err.response)
} 

}
const get_bubbles = async () => {
  console.log('getting all my bubbles')
  isLoading.value = true;
  const token = localStorage.getItem('token');
  try {
    const params = new URLSearchParams({
      userName: userName.value,
      token: token,
      group_id: group_id.value
    });
    if (lastLoadedAt.value) {
      params.append("lastLoadedAt", encodeURIComponent(lastLoadedAt.value))
    }
    const response = await $fetch(`/api/get_bubbles?${params.toString()}`, {
      baseURL: useRuntimeConfig().public.apiBaseURL,
      method: 'GET'
    });
    if (response && response.length > 0) {
      const bubblesWithPosition = response.map(bubble => ({
        ...bubble,
        left: Math.random() * 60,
      }));
      bubbles.value.push(...bubblesWithPosition)
      lastLoadedAt.value = response[response.length - 1].created_at;
    }
  } catch (err) {
    console.error('Error fetching bubbles: ', err.response)
    route.push('/');
  } finally {
    isLoading.value = false;
  }
};
const get_bubbles_all = async () => {
  console.log('getting all bubbles but mine')
  isLoading.value = true;
  const token = localStorage.getItem('token');
  try {
    const params = new URLSearchParams({
      userName: userName.value,
      token: token,
      group_id: group_id.value
    })
    if (allLastLoadedAt.value) {
      params.append("allLastLoadedAt", encodeURIComponent(allLastLoadedAt.value))
    }
    const response = await $fetch(`/api/get_bubbles_all?${params.toString()}`, {
      baseURL: useRuntimeConfig().public.apiBaseURL,
      method: 'GET'
    })
    if (response && response.length > 0) {
      console.log('response', response)
      const allBubblesWithPosition = response.map(bubble => ({
        ...bubble,
        left: Math.random() * 60,
      }));
      allBubbles.value.push(...allBubblesWithPosition)
      allLastLoadedAt.value = response[response.length - 1].created_at;
    }
  } catch (err) {
    console.error('error fetching all user bubbles', err.response);
    route.push('/');
  } finally {
    isLoading.value = false;
  }
};
const get_avatar = async () => {
  isLoading.value = true;
  try {
    console.log('getting avatar')
    userAvatar.value = localStorage.getItem('avatar')
  } catch (err) {
    console.error('Error trying to get avatar: ', err)
  } finally {
    isLoading.value = false;
  }
};
const get_other_avatars = async (userName) => {
  if (!avatars.value[userName]) {
    try {
      const response = await $fetch(`/api/other_avatar?userName=${userName}`,{
        baseURL:useRuntimeConfig().public.apiBaseURL,
        method:'GET'
      })
      avatars.value[userName] = response.avatar;
    } catch (err) {
      console.log('error trying to get avatar', err)
    }
  }
};
const broadcast_all_users = async () => {
  console.log('attempting to send message to socket')
  $websocket.send(
    JSON.stringify({
      type: 'new_user',
      userName: userName.value
    })
  )
};
const handleNewBubble = (newBubble) => {
  newBubble.left = Math.random() * 90;
  bubbles.value.push(newBubble);
  console.log('handling new bubble: ', newBubble);

};
const loadMore = (async () => {
  isLoading.value = true;
  await get_bubbles();
  await get_bubbles_all();
  isLoading.value = false;
});
onMounted(async () => {
  isLoading.value = true;
  await verifyToken();
  if (play.value) {
    console.log('playground access granted. getting all bubbles')
    connectWebSocket();
    await get_bubbles();
    await get_bubbles_all();
    await get_avatar();
    await get_my_groups();
    await getInvitations();
  }
  isLoading.value = false;
});
const sortedBubbles = computed(() => {
  console.log('sorting bubbles')
  const combined = [...bubbles.value, ...allBubbles.value];
  combined.forEach(bubble => {
    get_other_avatars(bubble.username)
  })

  return combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(combined => ({
    ...combined,
    timeAgo: formatDateAgo(combined.created_at)
  }))
});
const getBubbleStyle = (bubble) => {
  return {
    left: `${bubble.left}%`
  };
};
</script>
<style>
.avatar-wrapper{
  position: relative;
  display: inline-block;
}
.badge{
  position:absolute;
  bottom:0;
  right:0;
  background-color: red;
  color:white;
  font-size: 10px;
  border-radius: 50%;
  padding: 2px 6px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}
.floating-group-center{
  position: fixed;
  top:50%;
  left: 50%;
  transform:translate(-50%,-50%);
  background: rgba(black ,0.6);
  border-radius: 20px;
  padding: 2rem;
  z-index: 999;
  box-shadow: 0 0 20px rgb(white,0.2);
}
.groups {
  padding: 100px;
  padding: 12px 24px;
  /* Larger padding */
  font-size: 16px;
  /* Larger font size */
  background: radial-gradient(circle at 10% 10%,
      rgba(255, 255, 255, 0.742),
      rgba(250, 101, 242, 0.4) 40%,
      rgba(250, 101, 242, 0.2) 70%,
      rgba(250, 101, 242, 0.1) 100%);
  color: #f9f7f8e8;

  border: 1px;
  border-radius: 20px;

  cursor: pointer;
  transition: background 0.3s ease, box-shadow 0.3s ease;

}
.menu-dropdown {
  color: white;
  background-color: transparent;
  background: transparent;
  color: rgb(252, 220, 252)
}
.menu-dropdown:hover {
  background-color: transparent;
  background: transparent;
  transform: scale(1.1);
  transition: color, transform 1s ease-in-out;
}
.buttons {
  display: flex;
  flex-direction: column;
  width: auto;
  gap: 10px;
}
.app-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
    align-items: flex-start;
    background-image: url('https://plus.unsplash.com/premium_photo-1664037539537-1961b6e2e53f?q=80&w=2174&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
  background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    padding: 20px;
  background-color: rgba(241, 163, 237, 0.071);
  min-height: 100vh;
    height: auto;
  transition:filter 0.3s ease;
}
.app-container.blurred {
  filter: blur(4px);
  pointer-events: none;
}
.left-content {
  /* Add styles for your left content here */
  width: 50%;
  /* Adjust as needed */
}
.forms-container {
  display: flex;
  flex-direction: column;
  /* Stack riddle and bubble forms vertically */
  align-items: flex-end;
  /* Align forms to the right */
  gap: 20px;
  /* Space between riddle and bubble forms */
}
.block-form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 300px;
  background: rgba(233, 163, 248, 0.324);
  /* Semi-transparent white background */
  backdrop-filter: blur(10px);
  /* Frosted glass effect */

  padding: 10px;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  color: white;
  height: auto;
  gap: 10px;
}
.bubble-form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 300px;
  width: 100%;
  background: rgba(233, 163, 248, 0.324);
  /* Semi-transparent white background */
  backdrop-filter: blur(10px);
  /* Frosted glass effect */
  padding: 10px;
  gap: 20px;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  height: auto;
  font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;

}
.bubble-delete-logo {
  size: 10px;
  background: transparent;
  border: transparent;
  color: white;
}
.bubble-delete-logo:hover {
  color: #1c0101ce;
  opacity: .5;
  cursor: pointer;

}
@media (max-width: 768px) {
  .bubble-form {
    max-width: 250px;
    padding: 8px;
  }
}
@media (max-width: 480px) {
  .bubble-form {
    max-width: 200px;
    /* Even smaller for very small screens */
    top: 10px;
    /* Adjust position */
    right: 10px;
    padding: 5px;
  }

  .submit-button {
    padding: 8px 16px;
    /* Smaller button padding */
    font-size: 14px;
    /* Smaller font size */
  }

}
.avatar-container {
  display: flex;
  align-items: center;
  position: relative
}
.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;

}
.mini-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2 ease-in-out;
}
.avatar:hover {
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}
.my-bubble {
  position: relative;
  width: 280px;
  height: 280px;
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
  text-align: center;
  font-size: 10px;
  color: #f90b9ac9;
  animation: float 20s infinite ease-in-out, drift 20s infinite ease-in-out;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-sizing: border-box;
  overflow: hidden;
  z-index: 1;
}
.my-bubble::before,
.bubble::before {
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
  font-family: sans-serif;
  font-weight: 400;
  color: rgba(252, 247, 247, 0.906);
  font-size: 16px;

}
.bubble-content {
  font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
  font-size: 12px;
  align-items: center;
  justify-items: center;
  padding: 10px;
  word-wrap: break-word;
  max-width: 90%;
  color: white;
}
.bubble {
  position: relative;
  width: 250px;
  height: 250px;
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
  align-items: left;
  /* Horizontally align items in the center */
  text-align: center;
  font-size: 10px;
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
.input-field {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  width: 280px;
  transition: all 0.3s ease;
  background: rgba(186, 80, 163, 0.356);
  /* Semi-transparent background */
  padding: 10px;
  border-radius: 24px;
  /* Rounded corners to match bubbles */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  color: rgba(255, 255, 255, 0.71);
  height: 100px;
  color: white;
  margin-bottom: 20px;
}
.input-field::placeholder {
  color: rgba(255, 255, 255, 0.822);
}
.input-field:focus {
  border-color: rgba(224, 207, 223, 0.8);
  /* Bubble's pink color */
  box-shadow: 0 0 10px rgba(250, 101, 242, 0.4);
  /* Glow effect */
}
.submit-button {
  position: flex;
  flex-direction: row;
  padding: 12px 24px;
  /* Larger padding */
  font-size: 16px;
  /* Larger font size */
  background: radial-gradient(circle at 10% 10%,
      rgba(255, 255, 255, 0.742),
      rgba(250, 101, 242, 0.4) 40%,
      rgba(250, 101, 242, 0.2) 70%,
      rgba(250, 101, 242, 0.1) 100%);
  /* Bubble gradient */
  color: #f9f7f8e8;
  /* Bubble text color */
  border: 1px;
  border-radius: 20px;
  /* Rounded corners */
  cursor: pointer;
  transition: background 0.3s ease, box-shadow 0.3s ease;
  /* Smooth transitions */
  z-index: 3;
}
.submit-button:disabled {
  opacity: 0.6;
  /* Reduce opacity when disabled */
  cursor: not-allowed;
}
.submit-button:hover:not(:disabled) {
  background: radial-gradient(circle at 30% 30%,
      rgba(255, 255, 255, 0.317),
      rgba(250, 101, 242, 0.5) 40%,
      rgba(250, 101, 242, 0.3) 70%,
      rgba(250, 101, 242, 0.2) 100%);
  /* Brighter gradient on hover */
  box-shadow: 0 0 10px rgba(238, 182, 235, 0.4);
  /* Glow effect */
}
.menu-container {
  margin-left: 10px;
}
.dots {
  background-color: transparent;
  background: transparent;
}
.dots:hover {
  background: transparent;
  background-color: transparent;
  transform: scale(1.8);
  color: blue;
  transition: transform, color 1s ease-in-out;
}
.bubble-container {
  display: flex;
  flex-direction: row;
  max-width: 100%;
}
.modify-button{
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}
</style>