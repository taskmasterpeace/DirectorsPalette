// Test story UI overflow fix
const testStory = `
Chapter 1: The Meeting

John walked into the abandoned warehouse. The place was dark and dusty. 
He heard footsteps behind him. It was Sarah, his partner.
"We need to find the evidence before they come back," she whispered.
They searched through old boxes until they found a briefcase.

Chapter 2: The Discovery

Inside the briefcase was exactly what they were looking for - the stolen documents.
Suddenly, the door slammed shut. They were trapped.
John used his crowbar to pry open a window.

Chapter 3: The Escape

Sarah grabbed the flashlight and the documents while John worked on the window.
They heard voices outside - the criminals were returning.
Finally, the window gave way and they escaped into the night.
`;

console.log("Test Story for UI Overflow Check:");
console.log("=================================");
console.log(testStory);
console.log("\nExpected UI behavior:");
console.log("- Chapter badges should wrap within card boundaries");
console.log("- No horizontal overflow on chapter cards");
console.log("- Character/location badges should be visible but contained");
console.log("\nTo test:");
console.log("1. Navigate to http://localhost:3333");
console.log("2. Paste the story above");
console.log("3. Select a director (e.g., Tarantino)");
console.log("4. Click 'Extract Story References'");
console.log("5. Configure references and generate");
console.log("6. Check that chapter badges don't overflow");