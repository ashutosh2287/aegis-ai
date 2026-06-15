const fs = require('fs');
const path = require('path');

function getFieldNames(content) {
  const lines = content.split('\n');
  const withoutBang = new Set();
  const withBang = new Set();

  // Matches: [decorators] [modifiers] fieldName[!?] : type;
  const fieldRegex = /^\s*(?:@\w+\s*)*(?:\w+\s+)*(\w+)\s*([!?])?:\s*/;

  lines.forEach(line => {
    const match = line.match(fieldRegex);
    if (match) {
      const fieldName = match[1];
      const modifier = match[2];
      if (modifier === '!') {
        withBang.add(fieldName);
      } else {
          // This includes undefined (no modifier) and '?'
          withoutBang.add(fieldName);
      }
    }
  });

  return { withoutBang, withBang };
}

const filePath = path.join(__dirname, 'backend', 'src', 'exercise', 'dto', 'exercise-response.dto.ts');
const content = fs.readFileSync(filePath, 'utf8');
const { withoutBang, withBang } = getFieldNames(content);
console.log('File:', filePath);
console.log('withoutBang:', Array.from(withoutBang).sort());
console.log('withBang:', Array.from(withBang).sort());