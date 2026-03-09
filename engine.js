
let results=[]

function validateAPI(){

const key=document.getElementById("apiKey").value

if(key.startsWith("AIza")){
document.getElementById("apiStatus").innerText="API válida"
}else{
document.getElementById("apiStatus").innerText="API inválida"
}

}

async function processBatch(){

const files=document.getElementById("files").files

results=[]

for(const file of files){

let text=await extractText(file)

let data=await analyzeWithGemini(text)

results.push(data)

}

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
const page=await pdf.getPage(1)
const content=await page.getTextContent()
return content.items.map(i=>i.str).join(" ")

}

return ""

}

async function analyzeWithGemini(text){

const key=document.getElementById("apiKey").value

if(!key.startsWith("AIza")){
return {error:"API no válida"}
}

const prompt=`Extrae campos clave y tablas del siguiente documento y devuelve JSON: ${text.slice(0,4000)}`

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
