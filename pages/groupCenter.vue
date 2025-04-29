<template>
    <button @click="$emit('close')">
        ˗ˏˋ ♡ ˎˊ˗close˗ˏˋ ♡ ˎˊ˗
    </button>
    <h1>
        users in group
    </h1>
<div v-for="user in groupUsers" :key="user.username" class="user-item">
{{ user.username }}
<button @click="removeUserFromGroup(user.username)">❌</button>
</div>
<h1>
    invite to the group
</h1>
<input v-model="lookForUser"
@input="searchUsers"
placeholder="search for users to invite..."
class="search-bar"
/>
<div v-if="loading_search">
searching ...
</div>
<div v-for="userNotInGroup in usersNotInGroup" :key="userNotInGroup.username" class="user-item">
{{ userNotInGroup.username}}
<button @click="inviteUser(userNotInGroup.username)">➕</button>
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
