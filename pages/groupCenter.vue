<template>
    <div class="block-form">
    <button @click="$emit('close')">
        ˗ˏˋ ♡ ˎˊ˗close˗ˏˋ ♡ ˎˊ˗
    </button>
    <h1>
        users in group
    </h1>
<div v-for="user in groupUsers" :key="user.username" class="user-item">

{{ user.username }}

<button @click="removeUserFromGroup(user.username)">x</button>
</div>
<h1>
    invite to the group
</h1>
<input v-model="lookForUser"
@input="searchUsers"
placeholder="search for users to invite..."
class="search-field"
/>
<div v-if="loading_search">
searching ...
</div>
<div v-for="userNotInGroup in usersNotInGroup" :key="userNotInGroup.username" class="user-item">
{{ userNotInGroup.username}}
<button @click="inviteUser(userNotInGroup.username)">+</button>
</div>
</div>
</template>
<script setup>

import { ref,onMounted } from 'vue';
const loading_users=ref (false);
const loading_search = ref(false);
const props= defineProps({
    userName:String,
    group_id:Number,
    groupName:String
})
const groupUsers=ref([]);
const usersNotInGroup= ref([]);
const lookForUser=ref('');
const token = localStorage.getItem('token')

const fetchGroupUsers= async()=>{
    console.log('getting users')
 loading_users.value=true;
try{
    const params = new URLSearchParams({
        userName:props.userName,
        token:token,
        group_id:props.group_id
    })
    const response = await $fetch(`/api/get_users_from_group?${params.toString()}`,{
        baseURL:useRuntimeConfig().public.apiBaseURL,
        method:'GET'
    });
    groupUsers.value=response;
}
catch(err){
    console.log('error calling api',err)
}finally{
    loading_users.value=false;
}

};
const fetchUsersNotInGroup = async ()=>{
    const params = new URLSearchParams({
        userName:props.userName,
        token:token,
        group_id:props.group_id,
        lookForUser:lookForUser.value
    });
    loading_search.value=true;
    try{
        const response2 = await $fetch (`/api/get_users_not_in_group?${params.toString()}`,{
        baseURL:useRuntimeConfig().public.apiBaseURL,
        method:'GET'
    })
    usersNotInGroup.value=response2;
    }
    catch (err){
        console.log('error calling api',err);
    }
    finally{
        loading_search.value=false;
    }
}
const searchUsers=async()=>{
    await fetchUsersNotInGroup();
}
const removeUserFromGroup = async(usernameToRemove)=>{
    try{
    const response = await $fetch('/api/delete_users',{
        baseURL:useRuntimeConfig().public.apiBaseURL,
        method:'DELETE',
        body:{
            token:token,
            userName:props.userName,
            users:[usernameToRemove],
            name:props.groupName
        }   
    })
    console.log('user deleted successfully',response)
    await fetchGroupUsers();
}
catch (err){
    console.error('error trying to call the api: ',err)
}
}
const inviteUser = async(inviteUser)=>{

    try{
        const response =  await $fetch('/api/add_users',{
            baseURL:useRuntimeConfig().public.apiBaseURL,
            method:'PUT',
            body:{
                token:token,
                userName:props.userName,
                name:props.groupName,
                users:[inviteUser]
            }
        })
        console.log('invitation to user sent',response)
        await fetchGroupUsers();
    }
    catch(err){
        console.error('error trying to call the api',err)
    }
}
onMounted (async ()=>{
await fetchGroupUsers();
})

</script>
<style>
.user-item{
    color:white;
}

.search-field {
  display: flex;
  width: 280px;
  transition: all 0.3s ease;
  background: rgba(186, 80, 163, 0.356);
  padding: 10px;
  border-radius: 24px;
  color: rgba(255, 255, 255, 0.71);
  height: auto;
  color: white;
  margin-bottom: 20px;
}
.search-field::placeholder {
  color: rgba(255, 255, 255, 0.822);
}
.search-field:focus {
  border-color: rgba(224, 207, 223, 0.8);
  /* Bubble's pink color */
  box-shadow: 0 0 10px rgba(250, 101, 242, 0.4);
  /* Glow effect */
}


</style>
