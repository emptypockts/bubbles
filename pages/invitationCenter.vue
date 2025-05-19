<template>
  <div class="block-form">
    <button @click="$emit('close')">
      ˗ˏˋ ♡ ˎˊ˗close˗ˏˋ ♡ ˎˊ˗
    </button>
    <h1>
      invitations

    </h1>
    <div v-for="invitation in invites" :key="invitation.id" class="invitation-card">
      <div class="invitation-info">
        <div><strong>Invited to:</strong> {{ invitation.name }}</div>
        <div><strong>Invited by:</strong> {{ invitation.username }}</div>
        <div><strong>You:</strong> {{ invitation.invited }}</div>
      </div>
      <div class="invitation-actions">
        <button @click="respondInvite(invitation.name, true)">
          ٩(＾◡＾)۶ Accept
        </button>
        <button @click="respondInvite(invitation.name, false)">
          (︶︹︺) Decline
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>

import { ref } from 'vue';
const invitationStatus = ref(null);

const groupId = ref(0);
const props = defineProps({
  invitations: Array
})
const invites = ref([...props.invitations]);
console.log('invites',invites);
const respondInvite = async (group, isAccepted) => {
  try{
    
  invitationStatus.value = isAccepted;
  groupId.value = group;
  const invitation = props.invitations.find(invite => invite.name === group)
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');
  if (invitationStatus.value) {
      const response = await $fetch('/api/v1/invitations', {

        baseURL: useRuntimeConfig().public.apiBaseURL,
        method: 'PATCH',
        body: {
          token: token,
          userName: userName,
          invitation_id: invitation.invitation_id,
          group_id: invitation.group_id,
          status: 'accepted'
        }
      })
      console.log('invitation changed successfully')
    }

  

  else {
    console.log('you declined this invitation', group);
    
      const response = await $fetch('/api/v1/invitations', {

        baseURL: useRuntimeConfig().public.apiBaseURL,
        method: 'PATCH',
        body: {
          token: token,
          userName: userName,
          invitation_id: invitation.invitation_id,
          group_id: invitation.group_id,
          status: 'declined'
        }
      })
      console.log('invitation changed successfully')
  
  }
}
      catch (err) {
      console.error('error calling api', err.response)
    }
    finally{
      
      invites.value = invites.value.filter(invite =>invite.name!==group);
      console.log('final invites',invites.value)
    }

}
</script>
<style scoped>
.invitation-card {
  background: transparent;

  padding: 16px;
  margin-bottom: 12px;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.invitation-info {
  margin-bottom: 12px;
  font-size: 16px;
  line-height: 1.5;
}

.invitation-actions {
  display: flex;
  gap: 10px;
}
</style>
