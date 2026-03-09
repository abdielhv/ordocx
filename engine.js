
let uploadedFiles = []

function addFiles(input){
const newFiles = Array.from(input.files)
uploadedFiles = [...uploadedFiles, ...newFiles]
renderFileList()
}

function renderFileList(){
const container = document.getElementById("fileList")
container.innerHTML = ""
uploadedFiles.forEach((file)=>{
const item = document.createElement("div")
item.style.padding="4px"
item.style.borderBottom="1px solid #333"
item.innerText=file.name
container.appendChild(item)
})
}

async function extractText(file){

const ext = file.name.split(".").pop().toLowerCase()

if(ext==="pdf"){
const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise
let text=""
for(let i=1;i<=pdf.numPages;i++){
const page = await pdf.getPage(i)
const content = await page.getTextContent()
text += content.items.map(i=>i.str).join(" ")
}
return text
}

if(ext==="docx"){
const arrayBuffer = await file.arrayBuffer()
const result = await mammoth.extractRawText({arrayBuffer})
return result.value
}

if(ext==="xlsx" || ext==="xls"){
const data = await file.arrayBuffer()
const workbook = XLSX.read(data)
let text=""
workbook.SheetNames.forEach(name=>{
const sheet = workbook.Sheets[name]
text += XLSX.utils.sheet_to_csv(sheet)
})
return text
}

if(ext==="jpg" || ext==="jpeg" || ext==="png"){
const { data:{ text } } = await Tesseract.recognize(file,"spa")
return text
}

return ""
}

async function analyzeWithGemini(text,instructions){

const key = document.getElementById("apiKey").value

const prompt = `
Analiza el siguiente texto y devuelve la información estructurada.

INSTRUCCIONES:
${instructions}

TEXTO:
${text.slice(0,12000)}
`

const response = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({
contents:[{parts:[{text:prompt}]}]
})
}
)

const data = await response.json()

if(data.error){
return JSON.stringify(data.error,null,2)
}

return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta"
}

async function processBatch(){

const resultsContainer = document.getElementById("results")
resultsContainer.innerText="Procesando..."

const instructions = document.getElementById("instructions").value

if(uploadedFiles.length===0){
resultsContainer.innerText="No hay archivos cargados"
return
}

const texts = await Promise.all(
uploadedFiles.map(file=>extractText(file))
)

const combinedText = texts.join("\n\n")

const result = await analyzeWithGemini(combinedText,instructions)

resultsContainer.innerText=result
}

function exportResult(){

const text = document.getElementById("results").innerText

const blob = new Blob([text],{type:"text/plain"})

const a = document.createElement("a")

a.href = URL.createObjectURL(blob)

a.download="resultado.txt"

a.click()
}
