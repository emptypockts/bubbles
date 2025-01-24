<template>
    <div>
        <h1>
            well hello there! log in below 👇
        </h1>
    </div>
    <div>
        <form @submit.prevent="handleLogin">
            <div class="input-group">
                <label for="username">
                    UserName
                </label>
                <input v-model="userName" label="UserName" placeholder="@username" required />
            </div>
            <div class="input-group">
                <label for="password">
                    Password
                </label>
                <input type="password" v-model="password" required />
            </div>
            <div class="input-group">
                <button type="submit" :disabled="isLoading">
                    Login
                </button>
            </div>
            <p class="error-message" v-if="errorMessage">
                {{ errorMessage }}
            </p>
        </form>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';


const userName = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const router = useRouter();

const handleLogin = async () => {
    isLoading.value = true;
    errorMessage.value = '';
    try {
        const response = await $fetch('/api/login_user', {
            baseURL: useRuntimeConfig().public.apiBaseURL,
            method: 'POST',
            body: {
                userName: userName.value,
                password: password.value
            },
        });
        console.log(response)
        localStorage.setItem('token', response.token);
        localStorage.setItem('userName', userName.value)
        localStorage.setItem('avatar', response.avatar)
        router.push('/playground')
    } catch (err) {
        errorMessage.value = err.message || 'Login failed';
    } finally {
        isLoading.value = false;

    }

}

</script>