<template>
    <div class="invite-form">
    <button @click="$emit('close')">
        ˗ˏˋ ♡ ˎˊ˗close˗ˏˋ ♡ ˎˊ˗
    </button>
    <div class="invite-list">
 <div v-for="pendingUser in pendingList" :key="pendingUser.invited_user">
    <strong>{{ pendingUser.invited_user }}</strong> invite already sent
 </div>   
</div>
<div v-for="user in groupUsers" :key="user.username">
{{ user.username }}
<button @click="removeUserFromGroup(user.username)">remove</button>
</div>
<input v-model="lookForUser"
@input="e =>debouncedSearchUsers(e.target.value)"
placeholder="search...."
class="singleU-field"
/>
<p v-if="anyMessage" class="any-message">{{ anyMessage }}</p>
<div v-if="loading_search">
searching ...
</div>
<div v-for="userNotInGroup in usersNotInGroup" :key="userNotInGroup.username">
{{ userNotInGroup.username}}
<button @click="inviteUser(userNotInGroup.username)">add</button>
</div>
</div>
</template>
<script setup>

import { ref,onMounted } from 'vue';
import { debounce } from '@/utils/debounce'
const { $websocket } = useNuxtApp();
const loading_users=ref (false);
const loading_search = ref(false);
const anyMessage=ref('');
const props= defineProps({
    userName:String,
    group_id:Number,
    groupName:String
})
const groupUsers=ref([]);
const usersNotInGroup= ref([]);
const pendingList=ref([]);
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
    console.log('error calling api',err);
    showTempMessage(anyMessage,`(￣▽￣;)ゞ ${err.response._data.error}`,2000);

}finally{
    loading_users.value=false;
}



};
const fetchUsersPending= async()=>{
    const params = new URLSearchParams({
        userName:props.userName,
        token:token,
        group_id:props.group_id
    });
    loading_search.value=true;
    try{
        const response = await $fetch(`/api/v1/invitations?${params.toString()}`,{
            baseURL:useRuntimeConfig().public.apiBaseURL,
            method:'GET'
        })
        if (response.length>0){
            console.log('invitations pending',response)
            pendingList.value=response;
        }
        else{
            console.log('no pending invitations');
        }
    }   
    catch(err){
        console.error(err);
        showTempMessage(anyMessage,`(￣▽￣;)ゞ ${err.response._data.error}`,2000);
    }
    finally{
        loading_search.value=false;
    }
}
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
        showTempMessage(anyMessage,`(￣▽￣;)ゞ ${err.response._data.error}`,2000);
    }
    finally{
        loading_search.value=false;
    }
}
const searchUsers=async(query)=>{
    if (query){
    await fetchUsersNotInGroup();
    }
};
const debouncedSearchUsers = debounce(searchUsers,500);
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
    console.error('error trying to call the api: ',err);
    showTempMessage(anyMessage,`(￣▽￣;)ゞ ${err.response._data.error}`,2000);

}
}
const inviteUser = async(selectedUser)=>{

    try{
        const response =  await $fetch('/api/v1/invitations',{
            baseURL:useRuntimeConfig().public.apiBaseURL,
            method:'POST',
            body:{
                token:token,
                userName:props.userName,
                group_id:props.group_id,
                inviteUser:selectedUser,
            },
        })
        console.log('invitation to user sent',response)
        await fetchGroupUsers();
        const inviteObject ={
            type:'invitation',
            data:response
        }
        $websocket.send(JSON.stringify(inviteObject))
        pendingList.value.push(response)
    }
    catch(err){
        console.error('error trying to call the api')
        showTempMessage(anyMessage,`(￣▽￣;)ゞ ${err.response._data.error}`,2000);
    }
}
onMounted (async ()=>{
await fetchGroupUsers();
await fetchUsersPending();
})

</script>
<style>

</style>
