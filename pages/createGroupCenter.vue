<template>
    <div class="createGroup-form">
        <div>
        <button @click="$emit('close')">
            ˗ˏˋ ♡ ˎˊ˗close˗ˏˋ ♡ ˎˊ˗
        </button>
        </div>
        <div>
        <form @submit.prevent="createGroup">
            <textarea 
            v-model="groupName" 
            placeholder="write the new group name" 
            class="singleU-field"
             />
        
        <div>
                <button :disabled="isLoading || groupExists || !groupName">
                    (｡•̀ᴗ-)✧ create
                </button>
            </div>
            <div style="font-size: 14px">
                {{ anyMessage }}
            </div>
        </form>
        </div>
    </div>
</template>
<script setup>

import { ref } from 'vue';
const groupName = ref('');
const anyMessage = ref('');
const props = defineProps({
    userName: String
});
const isLoading = ref(false);
const groupExists = ref(false);
const createGroup = async () => {
    console.log('checking if group exists', groupName.value);
    isLoading.value = true;
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({
        userName: props.userName,
        token: token
    });

    try {
        const response = await $fetch(`/api/get_my_groups?${params.toString()}`, {
            baseURL: useRuntimeConfig().public.apiBaseURL,
            method: 'GET',
            throwHttpErrors: true
        })
        const groupFilter = response.filter(element => element.name === groupName.value)

        if (groupFilter.length > 0) {
            groupExists.value = true;
            console.error('group exists')
            showTempMessage(anyMessage, 'group exists already try another name (￣▽￣;)ゞ', 2000);

        }
        else {
            console.log('group doesnt exist please proceed!');
            isLoading.value = false;
            try {
                const response = await $fetch('/api/create_group_id', {
                    baseURL: useRuntimeConfig().public.apiBaseURL,
                    method: 'POST',
                    body: {
                        userName: props.userName,
                        token: token,
                        name: groupName.value
                    }
                })
                console.log('group created successfully', response)
                showTempMessage(anyMessage, '｡ﾟ( ﾟ^∀^ﾟ)ﾟ｡ your group is ready!', 2000);

            }
            catch (err) {
                console.error('error trying to create group', err)
                showTempMessage(anyMessage, 'oopsie we hit a snag, try again later (｡•́︿•̀｡)', 2000);

            }

        }
    }
    catch (err) {
        console.error('error trying to call api', err)
        showTempMessage(anyMessage, 'oopsie we hit a snag, try again later (｡•́︿•̀｡)', 2000);
    }
    finally {

        isLoading.value = false;
        groupExists.value = false;
    }

}
</script>


<style></style>
