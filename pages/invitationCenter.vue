<template>
    <div class="block-form">
    <button @click="$emit('close')">
        ˗ˏˋ ♡ ˎˊ˗close˗ˏˋ ♡ ˎˊ˗
    </button>
    <h1>
        invitations
    </h1>
<div v-for="invitation in invitations" :key="invitation.id" class="user-item">

{{ invitation }}

</div>
</div>
</template>
<script setup>

import { ref } from 'vue';
const props= defineProps({
    invitations:Object
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
