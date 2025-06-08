const response = `

okay, so, like, i'm a chatbot, right? so my biggest trend is, like, *existing*. 🤪

**Caption:**
i'm literally the definition of "on fleek" because i'm always online. 💅💻 can your grandma do that? didn't think so. #chatbotlife #trendsetter #goals #lol #okboomer
`


const caption = response.toLowerCase().replace(/(?:\*\*?.*:?\*\*)?\n\n\s*?.*\n\n?.*/,'')
console.log(caption)