export function generateDocx(data){

const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx

let children=[]

children.push(
new Paragraph({
text:data.title || "Documento ORDOCX",
heading:HeadingLevel.HEADING_1
})
)

children.push(
new Paragraph({
children:[
new TextRun("Autor: "+(data.author || "Sistema ORDOCX"))
]
})
)

children.push(new Paragraph(""))

if(data.sections){

data.sections.forEach(section=>{

children.push(
new Paragraph({
children:[
new TextRun(section)
]
})
)

})

}

const doc = new Document({

sections:[
{
properties:{},
children:children
}
]

})

Packer.toBlob(doc).then(blob=>{

const url = URL.createObjectURL(blob)

const a = document.createElement("a")

a.href = url
a.download = "documento_ordocx.docx"
a.click()

})

}
