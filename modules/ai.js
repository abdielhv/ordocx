export async function runAI(prompt, apiKey){

const response = await fetch(

"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" + apiKey,

{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body: JSON.stringify({

contents:[
{
parts:[
{ text: prompt }
]
}
]

})

}

)

const data = await response.json()

return data.candidates[0].content.parts[0].text

}
