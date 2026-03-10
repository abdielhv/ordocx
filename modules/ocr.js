export async function runOCR(file){

const result = await Tesseract.recognize(
    file,
    "spa"
)

return result.data.text

}
