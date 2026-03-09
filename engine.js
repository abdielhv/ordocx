
let files = [];

document.getElementById("fileInput").addEventListener("change",function(e){
files=[...files,...Array.from(e.target.files)];
renderFileList();
});

function renderFileList(){
let list=document.getElementById("fileList");
list.innerHTML="";
files.forEach(f=>{
let div=document.createElement("div");
div.className="fileItem";
div.innerText=f.name;
list.appendChild(div);
});
}

async function processBatch(){

let status=document.getElementById("status");
status.innerText="Iniciando procesamiento...";

let texts=[];

for(let file of files){

if(file.type.includes("image")){
status.innerText="OCR en "+file.name;
let result=await Tesseract.recognize(file,'spa');
texts.push(result.data.text);
}

else if(file.name.endsWith(".docx")){
status.innerText="Leyendo DOCX "+file.name;
let text=await file.text();
texts.push(text);
}

}

status.innerText="Enviando a IA...";

let apiKey=document.getElementById("apiKey").value;
let instructions=document.getElementById("instructions").value;

let prompt=instructions+"\n\n"+texts.join("\n");

let response=await fetch(
"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key="+apiKey,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
contents:[{
parts:[{text:prompt}]
}]
})
});

let data=await response.json();

let output=data.candidates?.[0]?.content?.parts?.[0]?.text;

document.getElementById("results").innerText=output;

status.innerText="Proceso completado";
}

function exportResult(){

let text=document.getElementById("results").innerText;

let blob=new Blob([text],{type:"text/plain"});

let a=document.createElement("a");

a.href=URL.createObjectURL(blob);

a.download="resultado.txt";

a.click();

}
