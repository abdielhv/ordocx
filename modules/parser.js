export function buildPrompt(instructions, texts){

return instructions + "\\n\\n" + texts.join("\\n")

}
