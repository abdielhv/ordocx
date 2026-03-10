import { runOCR } from "./modules/ocr.js"
import { runAI } from "./modules/ai.js"
import { buildPrompt } from "./modules/parser.js"
let files=[]

document.getElementById("fileInput").addEventListener("change",function(e){

files=[...files,...Array.from(e.target.files)]

renderFileList()

})

function renderFileList(){

let list=document.getElementById("fileList")

list.innerHTML=""

files.forEach(f=>{

let div=document.createElement("div")
div.className="fileItem"
div.innerText=f.name

list.appendChild(div)

})

}


async function processBatch(){

let status=document.getElementById("status")
let results=document.getElementById("results")

status.innerText="Iniciando procesamiento..."

let texts=[]

for(let file of files){

if(file.type.includes("image")){

status.innerText="Ejecutando OCR en "+file.name

try{

let result=await Tesseract.recognize(file,'spa')

texts.push(result.data.text)

}catch(err){

console.error(err)
texts.push("")

}

}

else if(file.name.endsWith(".docx")){

status.innerText="Leyendo documento "+file.name

let text=await file.text()

texts.push(text)

}

}


status.innerText="Enviando datos a Gemini..."

let apiKey=document.getElementById("apiKey").value

let instructions=document.getElementById("instructions").value

let prompt=instructions+"\n\n"+texts.join("\n")

try{

const url="https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key="+apiKey

const response=await fetch(url,{

method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
contents:[{
parts:[{text:prompt}]
}]
})

})

const data=await response.json()

console.log("Respuesta Gemini:",data)

if(!data.candidates){

results.innerText="ERROR API:\n"+JSON.stringify(data,null,2)
status.innerText="Error en respuesta de IA"
return

}

let output=data.candidates[0].content.parts[0].text

results.innerText=output

status.innerText="Proceso completado"

}catch(error){

console.error(error)

results.innerText="Error de conexión con Gemini"

status.innerText="Error"

}

}


function exportResult(){

let text=document.getElementById("results").innerText

let blob=new Blob([text],{type:"text/plain"})

let a=document.createElement("a")

a.href=URL.createObjectURL(blob)

a.download="resultado.txt"

a.click()

}
