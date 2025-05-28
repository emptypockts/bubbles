<template>
  <div v-if="play" class="app-container" :class="{ blurred: blurrBackground }">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <div class="bubble-container">
      <div v-if="(!selectedGroupName)">
        <h1 style="font-size: 14px; color:white">you are in: ⋆✴︎˚｡⋆playground⋆✴︎˚｡⋆</h1>
      </div>
      <div v-else>
        <h1 style="font-size: 14px; color:white">you are in: ⋆✴︎˚｡⋆{{ selectedGroupName }}⋆✴︎˚｡⋆</h1>
        <button v-if="isOwned" @click="deleteGroup">
          delete group (つ﹏<。)ノシ 
        </button>
          <button v-if="(!isOwned)" @click="leaveGroup">
            leave group (つ﹏<。)ノシ 
          </button>
          <p v-if="anyMessage" class="any-message">{{ anyMessage }}</p>
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
    
    <div class="right panel">

      <div class="block-form">
<div class="avatar-title">
      <h1>🫧bubbles🫧</h1>
           
        <div class="avatar-container">
          <div class="avatar-wrapper">
            <img 
            v-if="userAvatar" 
            :src="userAvatar" 
            alt="User Avatar" 
            class="avatar" 
            :title="userName"
            :class="{clickable:invitationCount>0}"
            @click="handleClick" 
              />
            <span v-if="invitationCount > 0" class="badge">
              {{ invitationCount }}
            </span>
          </div>
          
          <div class="menu-container">  
            <button class="dots" @click="toggleMenu">
              &#x22EE;
            </button>
          </div>
          <div v-if="showMenu">
            <button @click="logout">logout</button>
          </div>
        </div>
        </div>       
        <form @submit.prevent="create_bubble">
          <textarea 
          v-model="message" 
          label="message" 
          placeholder="post your bubble" 
          class="input-field" />
          <div class="button-form">
            <button :disabled="isLoading || message.length > 80" >
              💭post {{ 80 - message.length }} characters left💭
            </button>
            <button @click="loadMore"  :disabled="isLoading">
               ｡⋆*°○❀load more❀○°*⋆｡
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
          <button @click="go_to_group(groupName.group_id, groupName.name)">
            <strong>go to:</strong> 
            {{ groupName.name }}
          </button>
          <button @click="modifyGroup(groupName.group_id, groupName.name)" class="button-more">
          invite 
          </button>
        </div>
        <button @click="backToPlayground()">
          playground
        </button>

      </div>

    </div>
  </div>
  <div class="floating-group-center">
    <groupCenter v-if="guiForm === 'modifyGroup'" :group_id="selectedGroupId" :userName="userName"
      :groupName="selectedGroupName" @close="closeGui" />
  </div>
  <div class="floating-group-center">
    <createGroupCenter v-if="guiForm === 'createGroup'" :userName="userName" @close="closeGui" />
  </div>
  <div class="floating-group-center">
    <invitationCenter v-if="guiForm === 'modifyInvitation'" :invitations="userInvitations" @close="closeGui" />
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
const myGroups = ref([]);
const showMenu = ref(false);
const selectedGroupId = ref(null);
const selectedGroupName = ref(null);
const createGroupGui = ref(false);
const invitationCount = ref(0);
const invitationCenterDisp = ref(false);
const userInvitations = ref([]);
const blurrBackground = ref(false);
const anyMessage = ref('');
const isOwned = ref('');
const guiForm = ref('');
const handleClick=()=>{
  if (invitationCount.value>0){
    modifyInvitation();
  }
}

function closeGui() {
  console.log('switch of close gui',guiForm.value)
  switch (guiForm.value){
    case 'modifyGroup':
      case 'createGroup':
      get_my_groups();
      get_groups();
      break
    case 'modifyInvitation':
      getInvitations();
      get_my_groups();
      get_groups();
      break
  }
  console.log('turning off gui')
  guiForm.value = null;
  blurrBackground.value = false;
}
const toggleMenu = () => {
  showMenu.value = !showMenu.value
};
const backToPlayground = async () => {
  group_id.value = null;
  selectedGroupId.value = null;
  selectedGroupName.value = null;
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
  console.log('claling message from playground ', event);
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
          group_id: group_id.value
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
const modifyGroup = async (groupId, groupName) => {
  guiForm.value = 'modifyGroup'
  blurrBackground.value = true;
  userName.value = localStorage.getItem('userName')
  selectedGroupId.value = groupId;
  selectedGroupName.value = groupName;
  group_id.value = groupId;
};
const createGroup = async () => {
  guiForm.value = 'createGroup';
  blurrBackground.value = true;
  userName.value = localStorage.getItem('userName');
}
const go_to_group = async (groupId, groupName) => {
  console.log('go to group', groupId);
  console.log('group called', groupName);
  selectedGroupId.value = groupId;
  selectedGroupName.value = groupName;
  group_id.value = groupId;
  bubbles.value = [];
  allBubbles.value = [];
  lastLoadedAt.value = null;
  allLastLoadedAt.value = null;
  await get_bubbles();
  await get_bubbles_all();
  await get_my_groups();
  await get_groups();
  isOwned.value = groupsNames.value.some(element=>element.group_id===groupId)
  
}
const get_my_groups = async () => {
  console.log('getting my groups')
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');
  try {
    const params = new URLSearchParams({
      userName: userName,
      token: token
    })
    const response = await $fetch(`/api/get_my_groups?${params.toString()}`, {
      baseURL: useRuntimeConfig().public.apiBaseURL,
      method: 'GET'
    });
    if (response && response.length > 0) {
      myGroups.value = response.map(myGroup => ({
        ...myGroup
      }))
    }
  }
  catch (err) {
    console.error('error trying to call api', err);

  }
};
const leaveGroup = async()=>{
  console.log('leaving group', selectedGroupName.value);
  const token=localStorage.getItem('token');
  const userName=localStorage.getItem('userName');
  const groupId=group_id.value;
  console.log('delete groupID',groupId)
  if (confirm('are you sure you want to leave this group?')){
    try{
      const response = await $fetch('/api/v1/GroupUser',{
        baseURL:useRuntimeConfig().public.apiBaseURL,
        method:'DELETE',
        body:{
          userName:userName,
          token:token,
          group_id:groupId
        }
      })
      console.log(response);
      showTempMessage(anyMessage,`(￣▽￣;)ゞ ${response.message}`,2000);
    }
    catch(err){
      console.error(err);
      showTempMessage(anyMessage,`(￣▽￣;)ゞ ${err.response._data.error}`,2000);

    }
    finally{
      myGroups.value=[];
      go_to_group(null,null);
      
    }
  }
}
const deleteGroup=async() =>{
  console.log('delete group ',selectedGroupName.value)
  const token=localStorage.getItem('token');
  const userName = localStorage.getItem('userName')
  const deleteGroupName =selectedGroupName.value 
  if (confirm('are you sure you want to delete this group?')){
    try{
  const response = await $fetch('api/delete_group_id',{
    baseURL:useRuntimeConfig().public.apiBaseURL,
    method:'DELETE',
    body:{
      userName:userName,
      token:token,
      name:deleteGroupName
    }
  })
console.log(response);
showTempMessage(anyMessage,`(￣▽￣;)ゞ ${response.message}`,2000);
  }
  catch(err){
    console.error(err);
    showTempMessage(anyMessage,`(￣▽￣;)ゞ ${err.response._data.error}`,2000);
  }
  finally{
    myGroups.value=[];
    go_to_group(null,null);
  }
  }
  
}
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

const getInvitations = async () => {
  console.log('pulling invitations');
  const token = localStorage.getItem('token');
  try {
    const params = new URLSearchParams({
      userName: userName.value,
      token: token
    })
    const response = await $fetch(`/api/v1/invitations?${params.toString()}`, {
      baseURL: useRuntimeConfig().public.apiBaseURL,
      method: 'GET'
    })
    if (response.length>0){
    const formattedInvitation = response.map(element => {
      return {
        ...element,
        invited: `${formatDateAgo(element.created_at)} ago`
      }

    })

    userInvitations.value = formattedInvitation;
    invitationCount.value = response.filter(invite=>invite.status==='pending').length
    
    console.log('invitations', invitationCount.value);
  }
  else{
    invitationCount.value=0;
    console.log('no pending invitations');
  }


  }
  catch (err) {
    console.error('erorr trying to fetch invitations', err)
  }

}
const modifyInvitation = async () => {
  guiForm.value = 'modifyInvitation';
  blurrBackground.value = true;
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
        left: Math.random() *60,
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
      const response = await $fetch(`/api/other_avatar?userName=${userName}`, {
        baseURL: useRuntimeConfig().public.apiBaseURL,
        method: 'GET'
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
  newBubble.left = Math.random() *60;
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

.avatar.clickable{
cursor:pointer;
transition:transform 0.2s;
}
.avatar-wrapper {
  position: relative;
  display: inline-block;
}
.badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: red;
  color: white;
  font-size: 10px;
  border-radius: 50%;
  padding: 2px 6px;
  font-weight: bold;
  transition: transform 0.2s ease-in-out;
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
  transition: filter 0.3s ease;
}
.app-container.blurred {
  filter: blur(4px);
  pointer-events: none;
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
    top: 10px;
    right: 10px;
    padding: 5px;
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
  transition: transform 0.2s ease-in-out;
  opacity: 1;
  z-index: 2;
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
  width: 250px;
  height: 250px;
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
  animation:drift 20s infinite ease-in-out;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-sizing: border-box;
  overflow: hidden;
  z-index: 1;
  margin-bottom: 10px;
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
    transform: translateX(30px);
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
  width: 200px;
  height: 200px;
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
  justify-content: center;
  align-items:left;
  text-align: center;
  font-size: 10px;
  color: #f90b9ac9;
  animation:drift 20s infinite ease-in-out;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-sizing: border-box;
  overflow: hidden;
  margin-bottom: 10px;
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

.menu-container {
  margin-left: 10px;
}
.dots {
  background-color: transparent;
  border: transparent;
  transition: transform 0.3s ease, color 0.3s ease;
}
.dots:hover {
  background: transparent;
  background-color: transparent;
  transform: scale(1.8);
  color: white;
  
}
.bubble-container {
  max-width: 1200px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
  margin: 0 auto;
  padding: 1rem;
  gap: 1rem;

}
.bubble-container::-webkit-scrollbar {
  width: 12px;
}

.bubble-container::-webkit-scrollbar-track {
  background: rgba(186, 80, 163, 0.2);
}

.bubble-container::-webkit-scrollbar-thumb {
  background: rgba(186, 80, 163, 0.6);
}

.bubble-container::-webkit-scrollbar-thumb:hover {
  background: rgba(186, 80, 163, 0.8);
  cursor: pointer;
}
.right-panel{
  position:-webkit-sticky;
}
</style>