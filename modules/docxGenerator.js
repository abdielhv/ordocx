export function generateDocx(data){

const { Document, Packer, Paragraph, TextRun } = docx

const doc = new Document({
sections:[
{
properties:{},
children:[
new Paragraph({
children:[
new TextRun("Documento generado por ORDOCX"),
]
}),
new Paragraph({
children:[
new TextRun(JSON.stringify(data,null,2))
]
})
]
}
]
})

Packer.toBlob(doc).then(blob=>{

const url = URL.createObjectURL(blob)

const a = document.createElement("a")

a.href = url

a.download = "documento_generado.docx"

a.click()

})

}
