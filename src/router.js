import { createMemoryHistory, createRouter } from 'vue-router'
const router =createRouter({
      history: createMemoryHistory(),

})
router.onError((error, to) => {
  if (error.message.includes('Failed to fetch dynamically imported module') || error.message.includes("Importing a module script failed")) {
    window.location = to.fullPath
  }
})