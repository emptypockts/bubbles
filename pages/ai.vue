<template>
  <meta name="viewport" content="width=device-width, initial-scale=0.5">

  <div>
    <div>
      <h1> tell me ai ....(╭ರ_•́)</h1>
    </div>
    <div class="any-message">
      {{ anyMessage }}
    </div>
    <div>
      <textarea readonly v-model="formattedResponse" label="ai" placeholder="it's me!. ai" class="input-field" />
    </div>
    <div class="button-form">
      <button @click="witty">∘ ∘ ∘ ( °ヮ° ) make me laugh ∘ ∘ ∘ ( °ヮ° )</button>
      <button @click="joke">( ≧ᗜ≦) hazme reir ( ≧ᗜ≦)</button>
    </div>
    <div v-if="loading" class="loading-overlay">
      <div class="loading-response">
        (｡♥‿♥｡)
      </div>
    </div>
  </div>


</template>

<script setup>
import { ref, watch } from 'vue';
const analysisDone = ref(false);
const loading = ref(false);
const userMessage = ref('');
const messages = ref([]);
const formattedResponse = ref();
const anyMessage = ref('');
async function witty() {
  loading.value = true;
  userMessage.value = "make me laugh"
  if (userMessage.value.trim()) {

    try {

      const response = await $fetch('/api/v1/gemini', {
        method: 'POST',
        body: {
          query:{
          message: userMessage.value,
          type:"witty"
          }
        }
      })
      formattedResponse.value = response.post


    }
    catch (error) {
      showTempMessage(anyMessage, `(￣▽￣;)ゞ ${error}`, 10000);
      console.error('Error getting witty post', error);
    } finally {
      loading.value = false;
      userMessage.value = '';
    }
  }

}

async function joke() {
  loading.value = true;
  userMessage.value = "hazme reir";

    if (userMessage.value.trim()) {

    try {

      const response = await $fetch('/api/v1/gemini', {
        method: 'POST',
        body: {
          query:{
            message: userMessage.value,
            type:'laqueso'
          }
        }
      })
      formattedResponse.value = response.post
    }
    catch (error) {
      console.error('Error al usar ai', error);
      showTempMessage(anyMessage, `(￣▽￣;)ゞ ${error.response._data.error}`, 10000);

    } finally {
      loading.value = false;
      userMessage.value = '';

    }
  }
}



</script>
<style>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-response {
  font-size: 40px;
  color: white;
  text-align: center;
  animation: bounce 1.5s infinite;
}

/* Animation to bounce the kaomoji up and down */
@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}
</style>