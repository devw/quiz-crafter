import { parseQuizToBatchUpdate } from "./src/utils/quizParser.js";
import fs from "fs";

const quiz = JSON.parse(fs.readFileSync("/tmp/python.json", "utf8"));
const result = parseQuizToBatchUpdate(quiz);

console.log("🔍 Analyzing quiz structure...\n");

// Analizza i primi 5 requests
result.requests.slice(0, 5).forEach((req, index) => {
    console.log(`\n━━━ Request ${index} ━━━`);
    
    if (req.updateFormInfo) {
        console.log("Type: FORM INFO");
        console.log(`Title: ${req.updateFormInfo.info.title}`);
    } else if (req.createItem?.item) {
        const item = req.createItem.item;
        
        if (item.questionItem) {
            console.log("Type: QUESTION");
            console.log(`Title: ${item.title?.substring(0, 60)}...`);
            console.log(`\n📌 Structure check:`);
            console.log(`  - 'required' at item level: ${item.required !== undefined ? '❌ YES (WRONG!)' : '✅ NO (correct)'}`);
            console.log(`  - 'required' in question: ${item.questionItem?.question?.required !== undefined ? '✅ YES (correct)' : '❌ NO (WRONG!)'}`);
            console.log(`\n🔑 Item keys:`, Object.keys(item));
            console.log(`🔑 Question keys:`, Object.keys(item.questionItem?.question || {}));
        } else if (item.pageBreakItem) {
            console.log("Type: PAGE BREAK");
        } else {
            console.log("Type: SECTION HEADER");
            console.log(`Title: ${item.title}`);
        }
    }
});

// Mostra un esempio completo
console.log("\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("📄 FULL EXAMPLE (Request 2):");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
console.log(JSON.stringify(result.requests[2], null, 2));

// Salva anche su file
fs.writeFileSync('/tmp/debug_payload_full.json', JSON.stringify(result, null, 2));
console.log("\n\n💾 Full payload saved to: /tmp/debug_payload_full.json");
console.log(`📊 Total requests: ${result.requests.length}`);
