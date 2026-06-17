import dotenv from 'dotenv';
import { CloudAdapter,ConfigurationServiceClientCredentialFactory,TurnContext } from 'botbuilder';
dotenv.config()
const tenantId = process.env.TENANT_ID;
const clientSecret = process.env.SECRET_VALUE;
const clientId = process.env.APP_ID;
const myEmail = process.env.EMAIL;
const bubbleSecret =process.env.BUBBLE_BOT_SECRET
const bubbleAppId= process.env.BUBBLE_APP_ID
const MicrosoftAppId = process.env.BUBBLE_APP_ID
const MicrosoftAppSecret = process.env.BUBBLE_BOT_SECRET
const TenantId = process.env.TENANT_ID

const credentials = new ConfigurationServiceClientCredentialFactory({
    MicrosoftAppId,
    MicrosoftAppPassword:MicrosoftAppSecret
});
const adapter = new CloudAdapter(credentials)

export async function getToken() {
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`
    const tokenData = {
        "client_id": clientId,
        "client_secret": clientSecret,
        "scope": "https://graph.microsoft.com/.default",
        "grant_type": "client_credentials"
    }
    const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        body: new URLSearchParams(tokenData),
        headers: {
            "Accept": "application/json"
        }
    })
    const responseJson = tokenResponse.json();
    if (!tokenResponse.ok) throw new Error(`Failed to get token ${JSON.stringify(responseJson)}`);
    return responseJson
}

export async function sendEmail(eTo, eSubject, eBody) {
    const tokenObject = await getToken();
    const token = tokenObject.access_token;
    const recipients = eTo.map(e => ({ emailAddress: { address: e } }))
    const emailData = {
        message: {
            subject: eSubject,
            body: {
                contentType: "Text",
                content: eBody
            },
            toRecipients: recipients
        }
    }
    const response = await fetch(`https://graph.microsoft.com/v1.0/users/${myEmail}/sendMail`, {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(emailData)
    });
    if (!response.ok) {
        throw new Error(`failed to send email error ${JSON.stringify(response.json())}`)
    }
    console.log('email sent!')
};

export async function getFromToId(toUpn, fromUpn) {
    const tokenObject = await getToken();
    const token = tokenObject.access_token;
    const response = await fetch(`https://graph.microsoft.com/v1.0/users`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
    const objectResponse = (await response.json()).value;
    const toId = objectResponse.find(e => e['userPrincipalName'] === toUpn)['id']
    // fetching my id 
    const response2 = await fetch(`https://graph.microsoft.com/v1.0/users/${fromUpn}`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })

    const fromId = (await response2.json()).id


    return {
        "fromId": fromId,
        "toId": toId
    }
}

export async function chatSend(fromTo, messageText) {
    const post =
    `( ＾▽＾)っ✉ You’ve got an invite!\n
    from: ${fromTo.fromId}\n
    to: ${fromTo.toId} \n
    message: ${messageText}\n`

    const data = JSON.stringify({
        "type": "message",
        "attachments": [
            {
                "contentType": "application/vnd.microsoft.card.adaptive",
                "content": {
                    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                    "type": "AdaptiveCard",
                    "version": "1.4",
                    "body": [
                        { "type": "TextBlock", 
                            "wrap":true,
                            "text": post
                            
                        }
                    ]
                }
            }
        ]
    })
    const response = await fetch(process.env.WH_BUBBLES, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: data
    })

    if (!response.ok){
        const errorResponse = await response.json()
    throw new Error (`error posting message ${JSON.stringify(errorResponse)}`)
    }
    
    return true;

}

export async function getBubbleToken(){
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`
    const tokenData = {
        "client_id": bubbleAppId,
        "client_secret": bubbleSecret,
        "scope": "https://graph.microsoft.com/.default",
        "grant_type": "client_credentials"
    }
    const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        body: new URLSearchParams(tokenData),
        headers: {
            "Accept": "application/json"
        }
    })
    const responseJson = await tokenResponse.json();
    if (!tokenResponse.ok) throw new Error(`Failed to get token ${JSON.stringify(responseJson)}`);
    return responseJson
}

const getChats = async (fromTo)=>{
    const bubbleToken = (await getBubbleToken()).access_token;
    const response = await fetch(`https://graph.microsoft.com/v1.0/users/${fromTo.fromId}/chats`,{
        method:'GET',
        headers:{
            "Authorization":`Bearer ${bubbleToken}`
        }

    })
    const responseObj = await response.json();
    if (!response.ok){
        throw new Error (`failed to get chats ${JSON.stringify(responseObj)}`)
    }
    return responseObj
}

export async function postMessage(message,fromTo,chatId){
    
    const bubbleToken = (await getBubbleToken()).access_token;
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/chats/${chatId}/messages`,{
        method:'POST',
        headers:{
            "Authorization":`Bearer ${bubbleToken}`,
            "Content-Type":"application/json"
        },
        body :JSON.stringify({
            body:{
                "content":message
            }
        })
    })
    const responseObj = await response.json()
    console.log(responseObj)
}


const toUpn = 'myrtis@NETORG18906009.onmicrosoft.com'
const fromUpn = 'noreply.info@eacsa.us'
const chatId = '19:4651e255-1001-4334-bf30-fc7f3ebaa86b_fb4bcef5-e615-49c9-8c92-950982b2ac7d@unq.gbl.spaces'
// const fromTo = await getFromToId(toUpn, fromUpn);
// await chatSend(fromTo, "yikes new chat!")
// const fromTo = await getFromToId(toUpn,fromUpn);
// const chats = await getChats(fromTo);
// postMessage("yikes",fromTo,chatId)
