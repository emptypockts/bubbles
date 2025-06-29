import dotenv from 'dotenv';
dotenv.config()
const tenantId = process.env.TENANT_ID;
const clientSecret = process.env.SECRET_VALUE;
const clientId = process.env.APP_ID;
const myEmail = process.env.EMAIL;
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

const sendEmail = async (eTo, eSubject, eBody) => {
    const tokenObject = await getToken();
    const token = tokenObject.access_token;
    const recipients = eTo.map(e=>({emailAddress:{address:e}}))
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
    const response = await fetch(`https://graph.microsoft.com/v1.0/users/${myEmail}/sendMail`,{
        method:'POST',
        headers:{
            "Authorization":`Bearer ${token}`,
            "Content-Type":"application/json"
        },
        body:JSON.stringify(emailData)
    });
    if (!response.ok) {
        throw new Error(`failed to send email error ${JSON.stringify(response.json())}`)}
    console.log('email sent!')
};


sendEmail(["jjmr86@live.com.mx","myrtis.m@icloud.com"],"(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ 💭 New Bubble!",`📢 BREAKING: A fresh Bubble just slid into your playground.No cap 🧢— it might be tea, it might be random. Either way...Open it or stay basic. 😤🫧`);
