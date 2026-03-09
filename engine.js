let results=[]

function validateAPI(){

const key=document.getElementById("apiKey").value

if(key.startsWith("AIza")){
document.getElementById("apiStatus").innerText="API válida"
}else{
document.getElementById("apiStatus").innerText="API inválida"
}

}

async function processAll(){

const files=document.getElementById("sourceFiles").files
const template=document.getElementById("templateFile").files[0]

results=[]

let count=0

for(const file of files){

document.getElementById("progress").innerText="Procesando "+file.name

let text=await extractText(file)
let data=await analyzeWithGemini(text)

results.push({
archivo:file.name,
datos:data
})

count++
}

document.getElementById("progress").innerText="Procesados "+count+" documentos"

document.getElementById("output").innerText=JSON.stringify(results,null,2)

}

async function extractText(file){

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

async function analyzeWithGemini(text){

const key=document.getElementById("apiKey").value

const prompt=`
Extrae los datos clave del documento.
Devuelve un JSON estructurado con la información relevante.

Texto:
${text.slice(0,10000)}
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

function exportExcel(){

const ws=XLSX.utils.json_to_sheet(results)
const wb=XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb,ws,"Resultados")
XLSX.writeFile(wb,"ordocx_batch.xlsx")

}

async function exportPDF(){

const pdfDoc=await PDFLib.PDFDocument.create()
const page=pdfDoc.addPage()

page.drawText(JSON.stringify(results,null,2),{x:20,y:700,size:10})

const bytes=await pdfDoc.save()

const blob=new Blob([bytes],{type:"application/pdf"})

const a=document.createElement("a")
a.href=URL.createObjectURL(blob)
a.download="ordocx_batch.pdf"
a.click()

}
