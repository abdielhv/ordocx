
let results = {}
let extractedText = ""

function validateAPI(){

const key=document.getElementById("apiKey").value

if(key.startsWith("AIza")){
document.getElementById("apiStatus").innerText="API válida"
}else{
document.getElementById("apiStatus").innerText="API inválida"
}

}

function listFiles(){

const files=document.getElementById("sourceFiles").files
const list=document.getElementById("fileList")

list.innerHTML=""

for(const f of files){

const li=document.createElement("li")
li.textContent=f.name
list.appendChild(li)

}

}

async function processAll(){

const files=document.getElementById("sourceFiles").files
const template=document.getElementById("templateFile").files[0]
const instructions=document.getElementById("instructions").value

extractedText=""

for(const file of files){

document.getElementById("progress").innerText="Procesando "+file.name
let text=await extractText(file)
extractedText += "\n"+text

}

const templateText = await extractText(template)
const data = await analyzeWithGemini(extractedText,templateText,instructions)

results=data

document.getElementById("progress").innerText="Procesamiento completado"
document.getElementById("output").innerText=JSON.stringify(results,null,2)

}

async function extractText(file){

if(!file) return ""

const type=file.name.split(".").pop().toLowerCase()

if(type==="png"||type==="jpg"||type==="jpeg"){
const r=await Tesseract.recognize(file)
return r.data.text
}

if(type==="xlsx"){
const data=await file.arrayBuffer()
const wb=XLSX.read(data)
const sheet=wb.Sheets[wb.SheetNames[0]]
return XLSX.utils.sheet_to_csv(sheet)
}

if(type==="docx"){
const buffer=await file.arrayBuffer()
const r=await mammoth.extractRawText({arrayBuffer:buffer})
return r.value
}

if(type==="pdf"){
const buffer=await file.arrayBuffer()
const pdf=await pdfjsLib.getDocument({data:buffer}).promise
let fullText=""
for(let p=1;p<=pdf.numPages;p++){
const page=await pdf.getPage(p)
const content=await page.getTextContent()
fullText+=content.items.map(i=>i.str).join(" ")
}
return fullText
}

return ""

}

async function analyzeWithGemini(sourceText,templateText,instructions){

const key=document.getElementById("apiKey").value

const prompt=`
Analiza los documentos fuente y la plantilla destino.

Documentos fuente:
${sourceText}

Plantilla destino:
${templateText}

Instrucciones del usuario:
${instructions}

Devuelve un JSON con los datos que deben insertarse en la plantilla.
`

const response=await fetch(
`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`,
{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
contents:[{parts:[{text:prompt}]}]
})
})

const data=await response.json()
return data

}

async function exportWord(){

const {Document,Packer,Paragraph,TextRun}=docx

const doc=new Document({
sections:[{
children:[
new Paragraph({children:[new TextRun("Resultado generado por ORDOCX")]}),
new Paragraph({children:[new TextRun(JSON.stringify(results,null,2))]})
]
}]
})

const blob=await Packer.toBlob(doc)

const a=document.createElement("a")
a.href=URL.createObjectURL(blob)
a.download="resultado_final.docx"
a.click()

}
