import {defineStore} from 'pinia'
import { userGroupStore } from './group'

export const userSearchStore=defineStore('search',{
    state:()=>({
        results:[],
        errorMessage:''
    }),
    actions:{
        async search(query){
            if(!query.trim()){
                this.errorMessage='search cannot be empty';
                this.results=[];
                return;
            }
            const groupStore = userGroupStore();
            const response = await groupStore.groupData()

            if (!response){
                this.errorMessage='error during search'
                this.results=[]
                return
            }
            this.results=response
            this.errorMessage=''
            return response
            }
    }
})