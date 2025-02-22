<template>
        <meta name="viewport" content="width=device-width, initial-scale=0.5">

    <div>
        <div>
            <h1> (╭ರ_•́)</h1>
        </div>

        <div>
          <textarea readonly v-model="formattedResponse" label="ai" placeholder="it's me!. ai"  class="chat-messages"/>

        </div>
        <div class="buttons">
        <button @click="riddle">riddles ∘ ∘ ∘ ( °ヮ° ) ?</button>
        <button @click="joke">jokes (  ≧ᗜ≦)</button>
        <button @click="kaomoji">kaomoji ✧˚₊‧✧˖°..𖥔 ݁ ˖⋆｡ °✩ !!</button>
      </div>
        <div>
        </div>
        <div v-if="loading" class="loading-overlay">
            <div class="loading-kaomoji">
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
const formattedResponse=ref();
async function riddle() {
 loading.value=true;
    userMessage.value ="you are an expert in making the funniest riddles for children between 7 to 9 years old. invent yourself 2 riddles in english and 2 in spanish with no answers. renew the riddles everytime I ask you. remember to invent them don't repeat"; 
    if (userMessage.value.trim()) {
        try {

            console.log("Sending query",userMessage.value)
            console.log("loading status:", loading)
            const response = await $fetch('/api/ai_riddle', {
      baseURL: useRuntimeConfig().public.apiBaseURL,
      method: 'POST',
      body: {
        query: userMessage.value,
      }
    })
    
    formattedResponse.value=response.riddle .replace(/\n/g, '\n').trim();
    console.log('formatted response',formattedResponse)
            

        }
        catch (error) {
            console.error('Error getting riddle', error);
        }finally{ 
          loading.value = false;
          userMessage.value='';
        }
    }

}

async function joke() {
  loading.value=true;

    userMessage.value ="you are an expert in making the funniest jokes for children between 7 to 9 years old. invent 4 new jokes 2 in english and 2 in spanishh. renew the jokes everytime I ask you. remember to invent them, don't repeat"; 
    if (userMessage.value.trim()) {
        try {

          console.log("Sending query",userMessage.value)
            console.log("loading status:", loading)
            const response = await $fetch('/api/ai_riddle', {
      baseURL: useRuntimeConfig().public.apiBaseURL,
      method: 'POST',
      body: {
        query: userMessage.value,
      }
    })
    
    formattedResponse.value=response.riddle .replace(/\n/g, '\n').trim();
    console.log('formatted response',formattedResponse)
            

        }
        catch (error) {
            console.error('Error getting jokes', error);
        } finally{ 
          loading.value = false;
          userMessage.value='';
          
        }
    }
}

async function fact() {
  loading.value=true;

    userMessage.value ="you are an expert in making the most interesting facts for children between 7 to 9 years old. give me 2 facts in english and 2 in spanish. renew the facts  everytime I ask you"; 
    if (userMessage.value.trim()) {
        try {

          console.log("Sending query",userMessage.value)
            console.log("loading status:", loading)
            const response = await $fetch('/api/ai_riddle', {
      baseURL: useRuntimeConfig().public.apiBaseURL,
      method: 'POST',
      body: {
        query: userMessage.value,
      }
    })
    
    formattedResponse.value=response.riddle .replace(/\n/g, '\n').trim();
    console.log('formatted response',formattedResponse)
            

        }
        catch (error) {
            console.error('Error getting facts', error);
        }finally{ 
          loading.value = false;
          userMessage.value=''
        }
    }
}

async function kaomoji() {
  loading.value=true;

    userMessage.value ="you are an expert in making the most beautiful elaborated kaomoji for children between 7 to 9 years old. give me  4 kaomojis and explain them  in english and in spanish. renew them anytime I call you"; 
    if (userMessage.value.trim()) {
        try {

          console.log("Sending query",userMessage.value)
            console.log("loading status:", loading)
            const response = await $fetch('/api/ai_riddle', {
      baseURL: useRuntimeConfig().public.apiBaseURL,
      method: 'POST',
      body: {
        query: userMessage.value,
      }
    })
    
    formattedResponse.value=response.riddle .replace(/\n/g, '\n').trim();
    console.log('formatted response',formattedResponse)
            

        }
        catch (error) {
            console.error('Error getting facts', error);
        }finally{ 
          loading.value = false;
          userMessage.value=''
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

.loading-kaomoji {
  font-size: 40px;
  color: white;
  text-align: center;
  animation: bounce 1.5s infinite;
}

/* Animation to bounce the kaomoji up and down */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

h1{
  font-size: 20px;
  color: #ffffff;
  margin-bottom: 20px;
  font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;

}
.buttons{
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: flex-start;
}
.chat-messages {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  width: 280px;
  transition: all 0.3s ease;
  background: rgba(186, 80, 163, 0.356);
  padding: 10px;
  border-radius: 24px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  color: rgba(255, 255, 255, 0.938);
  border: 0px;
  margin-bottom: 20px;
  overflow-y: auto; /* Ensure the scrollbar appears when content overflows */
  max-height: 100px; /* Set a max height to enable scrolling */
  height: 100px;
  resize: none;
}

/* Custom scrollbar styles */
.chat-messages::-webkit-scrollbar {
  width: 12px; /* Width of the scrollbar */
}

.chat-messages::-webkit-scrollbar-track {
  background: rgba(186, 80, 163, 0.2); /* Semi-transparent bubble-themed track */
  border-radius: 10px; /* Rounded corners for the track */
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(186, 80, 163, 0.6); /* Bubble-themed thumb color */
  border-radius: 10px; /* Rounded corners for the thumb */
  border: 2px solid rgba(255, 255, 255, 0.3); /* Add a subtle border */
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(186, 80, 163, 0.8); /* Darker color on hover */
}
.chat-messages::placeholder{
  color: rgba(255, 255, 255, 0.822);
}
button{
  padding:100px;
  padding: 12px 24px;
  /* Larger padding */
  font-size: 16px;
  /* Larger font size */
  background: radial-gradient(circle at 10% 10%,
      rgba(255, 255, 255, 0.742),
      rgba(250, 101, 242, 0.4) 40%,
      rgba(250, 101, 242, 0.2) 70%,
      rgba(250, 101, 242, 0.1) 100%);
  color: #f9f7f8e8;
  
  border: 1px;
  border-radius: 20px;
  
  cursor: pointer;
  transition: background 0.3s ease, box-shadow 0.3s ease;
  
}
@media (max-width: 768px) {
  .bubble-form {
    max-width: 250px;
    padding: 8px;
  }
}

@media (max-width: 480px) {
  .bubble-form {
    max-width: 200px;
    /* Even smaller for very small screens */
    top: 10px;
    /* Adjust position */
    right: 10px;
    padding: 5px;
  }
}
button:hover{
  background: radial-gradient(circle at 30% 30%,
      rgba(255, 255, 255, 0.317),
      rgba(250, 101, 242, 0.5) 40%,
      rgba(250, 101, 242, 0.3) 70%,
      rgba(250, 101, 242, 0.2) 100%);
  /* Brighter gradient on hover */
  box-shadow: 0 0 10px rgba(238, 182, 235, 0.4);

}
</style>