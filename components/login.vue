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
        <input v-model="username" label="UserName" placeholder="@username" required/>
    </div>
    <div class="input-group">
        <label for="password">
            Password
        </label>
        <input type="password" v-model="password" required/>
    </div>
    <div class="input-group">
        <button type="submit">
            Login
        </button>
    </div>
    <p class="error-message" v-if="errorMessage">
        {{ errorMessage }}
    </p>
</form>
</div>
</template>
<script>

</script>