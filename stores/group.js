import { defineStore } from "pinia";

export const userGroupStore=defineStore('group',{
    state:()=>({
        groupData:[],
        errorMessage:''
    }),
    actions:{
        async getUsers(groupId,user_name){
            if(!groupId||!user_name){
                this.errorMessage='no group or name provided'
                return
            }
            const token=localStorage.getItem('token');
            try{
        const params = new URLSearchParams({
        userName:user_name,
        token:token,
        group_id:groupId
    })
    const response = await $fetch(`/api/get_users_from_group?${params.toString()}`,{
        baseURL:useRuntimeConfig().public.apiBaseURL,
        method:'GET'
    });
    this.groupData=response;
    this.errorMessage=''
    return response
            }
            catch(err){
                this.errorMessage='error fetching group or name'
                return null
            }
        }

    }
})
