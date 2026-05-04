import fs from "fs";
import https from "https";

https.get("https://docs.google.com/spreadsheets/d/e/2PACX-1vSf7D1lEnEk6PDJ50LpWscyd2K244n1-G167rgnrFbhJnSyvr1aGEbkGM_ljQ1iEGt71dU5MmY8Vooi/pub?output=csv", (res) => {
    let data = "";
    res.on("data", (chunk) => {
        data += chunk;
    });
    res.on("end", () => {
        fs.writeFileSync("data.csv", data);
        console.log("Done");
    });
});
