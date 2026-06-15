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

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && path.extname(fullPath) === '.ts') {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const { withoutBang, withBang } = getFieldNames(content);
        const intersection = [...withoutBang].filter(field => withBang.has(field));
        if (intersection.length > 0) {
          console.log(`${fullPath}: ${intersection.join(', ')}`);
        }
      } catch (e) {
        console.error(`Error processing ${fullPath}:`, e.message);
      }
    }
  }
}

scanDir(path.join(__dirname, 'backend', 'src'));