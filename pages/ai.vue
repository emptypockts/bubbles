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
          <textarea readonly v-model="formattedResponse" label="ai" placeholder="it's me!. ai"  class="input-field"/>
        </div>
        <div class="button-form">
              <button @click="witty">∘ ∘ ∘ ( °ヮ° ) witty? ∘ ∘ ∘ ( °ヮ° )</button>
             <button @click="joke">(  ≧ᗜ≦) y la queso (  ≧ᗜ≦)</button>
                    <button @click="kaomoji">✧˚₊‧✧˖°..𖥔 ݁ ˖⋆｡ °✩ kaomoji ✧˚₊‧✧˖°..𖥔 ݁ ˖⋆｡ °✩</button>
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
const anyMessage=ref('');
async function witty() {
 loading.value=true;
    userMessage.value ="so funny that this thing..."
    const agent =`
    you are a professional comedy writter for teenagers 10 years old and you only write about things and animals not humans, friends, family or tragedies.
    and you will provide the answer with the following structure in a witty genz vibe all in lower case:
    **caption:**
    `
    if (userMessage.value.trim()) {
      const payload = {
        "system_instruction":{
          "parts":[{
            "text":agent
          }]
        },
        "contents":[
          {
            "parts":[
            {
              "text":userMessage.value
            }
          ]
          }
        ]
      }
        try {
            
            const response = await $fetch('/api/v1/gemini', {
      baseURL: useRuntimeConfig().public.apiBaseURL,
      method: 'POST',
      body: {
        query: payload
      }
    })
    formattedResponse.value=response.post
            

        }
        catch (error) {
            showTempMessage(anyMessage,`(￣▽￣;)ゞ ${error}`,2000);
            console.error('Error getting witty post', error);
        }finally{ 
          loading.value = false;
          userMessage.value='';
        }
    }

}

async function joke() {
  loading.value=true;

    userMessage.value ="esta cosa no sirve!"; 
    const agent =`
    eres una escritora profesional de comedia para adolescentes de 10 a. tu estilo es 'mordaz' y vas a generar posts de instagram con esta unica estructura
    **caption:**
    `
    if (userMessage.value.trim()) {
        try {

    
          const payload = {
        "system_instruction":{
          "parts":[{
            "text":agent
          }]
        },
        "contents":[
          {
            "parts":[
            {
              "text":userMessage.value
            }
          ]
          }
        ]
      }
            const response = await $fetch('/api/v1/gemini', {
      baseURL: useRuntimeConfig().public.apiBaseURL,
      method: 'POST',
      body: {
        query: payload
      }
    })
    
    formattedResponse.value=response.post
        }
        catch (error) {
            console.error('Error getting jokes', error);
            showTempMessage(anyMessage,`(￣▽￣;)ゞ ${error.response._data.error}`,2000);
            
        } finally{ 
          loading.value = false;
          userMessage.value='';
          
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
                        showTempMessage(anyMessage,`(￣▽￣;)ゞ ${error.response._data.error}`,2000);
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




</style>