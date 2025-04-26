<template>
    <button @click="$emit('close')">
        ˗ˏˋ ♡ ˎˊ˗close˗ˏˋ ♡ ˎˊ˗
    </button>
{{ groupUsers }}
</template>
<script setup>

import { ref, watch,onMounted } from 'vue';
const loading_users=ref (false);
const props= defineProps({
    userName:String,
    group_id:Number
})
const groupUsers=ref([])
onMounted (async ()=>{
 console.log('getting users')
 loading_users.value=true;
const token = localStorage.getItem('token')
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
    console.log('response from api', response);
    groupUsers.value=response
    if (groupUsers && groupUsers.length>0){
        console.log('users available',groupUsers)
    }
}catch(err){
    console.log('error getting users',err)
}
});
</script>
