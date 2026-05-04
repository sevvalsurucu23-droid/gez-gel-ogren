import fs from "fs";

fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vSf7D1lEnEk6PDJ50LpWscyd2K244n1-G167rgnrFbhJnSyvr1aGEbkGM_ljQ1iEGt71dU5MmY8Vooi/pub?output=csv")
  .then(res => res.text())
  .then(data => fs.writeFileSync("data2.csv", data));
