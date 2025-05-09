<template>
    <div class="block-form">
    <button @click="$emit('close')">
        ˗ˏˋ ♡ ˎˊ˗close˗ˏˋ ♡ ˎˊ˗
    </button>
    <form @submit.prevent="createGroup" >
        <textarea v-model="groupName" placeholder="write the new group name" class="input-field"/>
        <div>
            <button type="submit" :disabled="isLoading||groupExists||!groupName" class="submit-button">
                (｡•̀ᴗ-)✧ create
            </button>
        </div>
        <div style="font-size: 14px">
                {{ errorMessage }}
            </div>
    </form>
</div>
</template>
<script setup>

import { ref,onMounted } from 'vue';
const groupName=ref('');
const errorMessage=ref('');
const props= defineProps({
    userName:String
});
const isLoading=ref(false);
const groupExists=ref(false);
const createGroup=async ()=>{
    console.log('checking if group exists',groupName.value);
    isLoading.value=true;
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({
        userName:props.userName,
        token:token
    });

    try{
        const response = await $fetch(`/api/get_my_groups?${params.toString()}`,{
            baseURL:useRuntimeConfig().public.apiBaseURL,
            method:'GET',
            throwHttpErrors:true
        })
        const groupFilter= response.filter(element=>element.name===groupName.value)

        if (groupFilter.length>0){
            groupExists.value=true;
            console.error('group exists')
            showTempMessage(errorMessage,'group exists already try another name (￣▽￣;)ゞ',2000);
            
        }
        else{
            console.log('group doesnt exist please proceed!');
            isLoading.value=false;
            try{
                const response = await $fetch('/api/create_group_id',{
                    baseURL:useRuntimeConfig().public.apiBaseURL,
                    method:'POST',
                    body:{
                        userName:props.userName,
                        token:token,
                        name:groupName.value
                    }
                })
            console.log('group created successfully',response)
            }
            catch(err){
                console.error('error trying to create group',err)
                showTempMessage(errorMessage,'oopsie we hit a snag, try again later (｡•́︿•̀｡)',2000);

            }

        }
    }
    catch(err){
        console.error('error trying to call api',err)
        showTempMessage(errorMessage,'oopsie we hit a snag, try again later (｡•́︿•̀｡)',2000);
    }
    finally{
        
        isLoading.value=false;
        groupExists.value=false;
    }
    
}
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
