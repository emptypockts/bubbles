<template>
    hello group center
{{userName }}
{{selectedGroupId}}
</template>
<script setup>

import { ref, watch } from 'vue';
const props= defineProps({
    userName:String,
    group_id:Number
})
console.log('hello group center userName',props.userName);
console.log('hello group center group_id',props.group_id);
</script>
