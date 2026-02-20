#!/usr/bin/env node

import { readFile, readdir, stat } from 'fs/promises';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuration
const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'target', 'dist', '.next', '.turbo',
  '.pnpm-store', '.cache', 'build', 'out', '.vscode', '.idea',
  '~', 'deprecated', '.claude'
]);

const MAX_TREE_DEPTH = 5;
const MAX_FILE_LINES = 60;

// Find UI folder
async function findUIFolder() {
  const possibleUIFolders = ['ui', 'app', 'frontend', 'web'];
  
  for (const folder of possibleUIFolders) {
    const folderPath = join(projectRoot, folder);
    try {
      const stats = await stat(folderPath);
      if (stats.isDirectory()) {
        const packageJsonPath = join(folderPath, 'package.json');
        const srcPath = join(folderPath, 'src');
        
        try {
          await stat(packageJsonPath);
          await stat(srcPath);
          return folder;
        } catch {
          continue;
        }
      }
    } catch {
      continue;
    }
  }
  
  return null;
}

// Generate ASCII tree
async function generateTree(dir, prefix = '', depth = 0) {
  if (depth >= MAX_TREE_DEPTH) return '';
  
  let result = '';
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const sortedEntries = entries
      .filter(entry => !IGNORE_DIRS.has(entry.name))
      .sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entry = sortedEntries[i];
      const isLast = i === sortedEntries.length - 1;
      const currentPrefix = isLast ? '└── ' : '├── ';
      const nextPrefix = isLast ? '    ' : '│   ';
      
      result += `${prefix}${currentPrefix}${entry.name}\n`;
      
      if (entry.isDirectory()) {
        const subDir = join(dir, entry.name);
        result += await generateTree(subDir, prefix + nextPrefix, depth + 1);
      }
    }
  } catch (error) {
    result += `${prefix}└── [ERROR: ${error.message}]\n`;
  }
  
  return result;
}

// Read file content with line limit and syntax validation
async function readFileContent(filePath, maxLines = MAX_FILE_LINES, validateSyntax = false) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    let truncatedContent = lines.slice(0, maxLines).join('\n');
    
    if (validateSyntax) {
      truncatedContent = validateAndFixSyntax(truncatedContent, filePath);
    }
    
    return truncatedContent;
  } catch {
    return 'НЕ НАЙДЕНО';
  }
}

// Validate and fix syntax for different file types
function validateAndFixSyntax(content, filePath) {
  const ext = filePath.split('.').pop().toLowerCase();
  
  switch (ext) {
    case 'json':
      return validateAndFixJSON(content);
    case 'tsx':
    case 'ts':
      return validateAndFixTypeScript(content);
    case 'js':
      return validateAndFixJavaScript(content);
    default:
      return content;
  }
}

// Validate and fix JSON syntax
function validateAndFixJSON(content) {
  try {
    // Try to parse the content
    JSON.parse(content);
    return content;
  } catch (error) {
    // If parsing fails, try to fix common issues
    let fixedContent = content;
    
    // Remove trailing commas
    fixedContent = fixedContent.replace(/,(\s*[}\]])/g, '$1');
    
    // Try to close unclosed objects/arrays
    const openBraces = (fixedContent.match(/\{/g) || []).length;
    const closeBraces = (fixedContent.match(/\}/g) || []).length;
    const openBrackets = (fixedContent.match(/\[/g) || []).length;
    const closeBrackets = (fixedContent.match(/\]/g) || []).length;
    
    // Add missing closing braces
    for (let i = 0; i < openBraces - closeBraces; i++) {
      fixedContent += '}';
    }
    
    // Add missing closing brackets
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      fixedContent += ']';
    }
    
    // Try parsing again
    try {
      JSON.parse(fixedContent);
      return fixedContent;
    } catch {
      // If still fails, return original content with error comment
      return content + '\n// ... (truncated due to syntax error)';
    }
  }
}

// Validate and fix TypeScript/JavaScript syntax
function validateAndFixTypeScript(content) {
  // Check for unclosed braces, brackets, parentheses
  const openBraces = (content.match(/\{/g) || []).length;
  const closeBraces = (content.match(/\}/g) || []).length;
  const openBrackets = (content.match(/\[/g) || []).length;
  const closeBrackets = (content.match(/\]/g) || []).length;
  const openParens = (content.match(/\(/g) || []).length;
  const closeParens = (content.match(/\)/g) || []).length;
  
  let fixedContent = content;
  
  // Fix long lines (break at 80 characters)
  const lines = fixedContent.split('\n');
  const fixedLines = lines.map(line => {
    if (line.length > 80 && line.includes('NodeCard')) {
      // Special handling for NodeCard components with geoConsent
      if (line.includes('geoConsent')) {
        return line.replace(
          /<NodeCard\s+type="internet"\s+data=\{data\.internet\}\s+geoConsent=\{data\.geoConsent\}\s*\/>/g,
          '<NodeCard\n  type="internet"\n  data={data.internet}\n  geoConsent={data.geoConsent}\n/>'
        );
      }
      // General NodeCard handling
      return line.replace(
        /<NodeCard\s+([^>]+)\s*\/>/g,
        (match, props) => {
          if (match.length > 80) {
            return `<NodeCard\n  ${props}\n/>`;
          }
          return match;
        }
      );
    }
    return line;
  });
  fixedContent = fixedLines.join('\n');
  
  // Add missing closing braces
  for (let i = 0; i < openBraces - closeBraces; i++) {
    fixedContent += '}';
  }
  
  // Add missing closing brackets
  for (let i = 0; i < openBrackets - closeBrackets; i++) {
    fixedContent += ']';
  }
  
  // Add missing closing parentheses
  for (let i = 0; i < openParens - closeParens; i++) {
    fixedContent += ')';
  }
  
  // If content ends abruptly, add proper closing
  if (fixedContent.trim().endsWith(',')) {
    fixedContent = fixedContent.slice(0, -1);
  }
  
  // If content ends with incomplete function/component, add proper closing
  if (fixedContent.trim().endsWith('})') || fixedContent.trim().endsWith(');')) {
    // This looks like it might be truncated, add proper closing
    if (openBraces > closeBraces) {
      fixedContent += '}';
    }
  }
  
  // Clean up malformed endings
  if (fixedContent.trim().endsWith('})}')) {
    fixedContent = fixedContent.slice(0, -3) + '}';
  }
  
  // Ensure proper function/component closing
  if (fixedContent.includes('function') || fixedContent.includes('const') || fixedContent.includes('export')) {
    // Check if we have proper closing for React components
    if (fixedContent.includes('return (') && !fixedContent.includes('export default')) {
      fixedContent += '\n\nexport default App;';
    }
  }
  
  return fixedContent;
}

// Validate and fix JavaScript syntax (same as TypeScript)
function validateAndFixJavaScript(content) {
  return validateAndFixTypeScript(content);
}

// Extract key information from files
async function extractKeyFiles(uiFolder) {
  const keyFiles = {};
  
  // Tauri config - validate JSON syntax
  const tauriConfigPath = join(projectRoot, 'netok_desktop', 'src-tauri', 'tauri.conf.json');
  keyFiles['src-tauri/tauri.conf.json'] = await readFileContent(tauriConfigPath, 50, true);
  
  // UI package.json - validate JSON syntax
  const packageJsonPath = join(projectRoot, uiFolder, 'package.json');
  keyFiles[`${uiFolder}/package.json`] = await readFileContent(packageJsonPath, 50, true);
  
  // Tailwind config - validate JavaScript syntax
  const tailwindConfigPath = join(projectRoot, uiFolder, 'tailwind.config.js');
  keyFiles[`${uiFolder}/tailwind.config.js`] = await readFileContent(tailwindConfigPath, 20, true);
  
  // Index.html - no syntax validation needed
  const indexHtmlPath = join(projectRoot, uiFolder, 'index.html');
  keyFiles[`${uiFolder}/index.html`] = await readFileContent(indexHtmlPath, 20);
  
  // Main.tsx - validate TypeScript syntax
  const mainTsxPath = join(projectRoot, uiFolder, 'src', 'main.tsx');
  keyFiles[`${uiFolder}/src/main.tsx`] = await readFileContent(mainTsxPath, 20, true);
  
  // App.tsx - validate TypeScript syntax
  const appTsxPath = join(projectRoot, uiFolder, 'src', 'App.tsx');
  keyFiles[`${uiFolder}/src/App.tsx`] = await readFileContent(appTsxPath, 50, true);
  
  return keyFiles;
}

// Find routes
async function findRoutes(uiFolder) {
  const routes = [];
  
  try {
    const srcPath = join(projectRoot, uiFolder, 'src');
    const entries = await readdir(srcPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name === 'pages') {
        const pagesPath = join(srcPath, 'pages');
        const pageEntries = await readdir(pagesPath, { withFileTypes: true });
        
        for (const pageEntry of pageEntries) {
          if (pageEntry.isFile() && pageEntry.name.endsWith('.tsx')) {
            routes.push(pageEntry.name.replace('.tsx', ''));
          } else if (pageEntry.isDirectory()) {
            routes.push(`${pageEntry.name}/`);
          }
        }
      }
    }
  } catch {
    // No routes found
  }
  
  return routes.length > 0 ? routes : ['НЕ НАЙДЕНО'];
}

// Find i18n locales
async function findI18nLocales(uiFolder) {
  const locales = [];
  
  try {
    const i18nPath = join(projectRoot, uiFolder, 'src', 'i18n');
    const entries = await readdir(i18nPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.json')) {
        locales.push(entry.name.replace('.json', ''));
      }
    }
  } catch {
    // No i18n found
  }
  
  return locales.length > 0 ? locales : ['НЕ НАЙДЕНО'];
}

// Find stores
async function findStores(uiFolder) {
  const stores = [];
  
  try {
    const storePath = join(projectRoot, uiFolder, 'src', 'store');
    const entries = await readdir(storePath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.ts')) {
        stores.push(entry.name.replace('.ts', ''));
      }
    }
  } catch {
    // No stores found
  }
  
  return stores.length > 0 ? stores : ['НЕ НАЙДЕНО'];
}

// Find pages
async function findPages(uiFolder) {
  const pages = [];
  
  try {
    const pagesPath = join(projectRoot, uiFolder, 'src', 'pages');
    const entries = await readdir(pagesPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.tsx')) {
        pages.push(entry.name.replace('.tsx', ''));
      }
    }
  } catch {
    // No pages found
  }
  
  return pages.length > 0 ? pages : ['НЕ НАЙДЕНО'];
}

// Find Settings tabs
async function findSettingsTabs(uiFolder) {
  const tabs = [];
  
  try {
    const settingsPath = join(projectRoot, uiFolder, 'src', 'pages', 'Settings');
    const entries = await readdir(settingsPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.tsx')) {
        tabs.push(entry.name.replace('.tsx', ''));
      }
    }
  } catch {
    // No Settings tabs found
  }
  
  return tabs.length > 0 ? tabs : ['НЕ НАЙДЕНО'];
}

// Extract build commands and paths
async function extractBuildInfo(uiFolder) {
  const buildInfo = {};
  
  try {
    const tauriConfigPath = join(projectRoot, 'netok_desktop', 'src-tauri', 'tauri.conf.json');
    const tauriConfig = JSON.parse(await readFile(tauriConfigPath, 'utf-8'));
    
    buildInfo.devCommand = tauriConfig.build?.beforeDevCommand || 'НЕ НАЙДЕНО';
    buildInfo.buildCommand = tauriConfig.build?.beforeBuildCommand || 'НЕ НАЙДЕНО';
    buildInfo.devPath = tauriConfig.build?.devUrl || 'НЕ НАЙДЕНО';
    buildInfo.distDir = tauriConfig.build?.frontendDist || 'НЕ НАЙДЕНО';
    
    if (tauriConfig.app?.windows?.[0]) {
      const window = tauriConfig.app.windows[0];
      buildInfo.windowTitle = window.title || 'НЕ НАЙДЕНО';
      buildInfo.windowSize = `${window.width || '?'}×${window.height || '?'}`;
    }
  } catch {
    buildInfo.devCommand = 'НЕ НАЙДЕНО';
    buildInfo.buildCommand = 'НЕ НАЙДЕНО';
    buildInfo.devPath = 'НЕ НАЙДЕНО';
    buildInfo.distDir = 'НЕ НАЙДЕНО';
    buildInfo.windowTitle = 'НЕ НАЙДЕНО';
    buildInfo.windowSize = 'НЕ НАЙДЕНО';
  }
  
  return buildInfo;
}

// Check Sources of Truth
function checkSourcesOfTruth(uiFolder, buildInfo) {
  const checks = [
    {
      name: 'Tauri config exists',
      result: buildInfo.devCommand !== 'НЕ НАЙДЕНО' ? '✅' : '❌',
      details: buildInfo.devCommand !== 'НЕ НАЙДЕНО' ? 'tauri.conf.json найден' : 'tauri.conf.json не найден'
    },
    {
      name: 'UI folder found',
      result: uiFolder ? '✅' : '❌',
      details: uiFolder ? `Папка фронта: ${uiFolder}` : 'Папка фронта не найдена'
    },
    {
      name: 'Package.json exists',
      result: uiFolder ? '✅' : '❌',
      details: uiFolder ? `${uiFolder}/package.json найден` : 'package.json не найден'
    },
    {
      name: 'Tailwind configured',
      result: uiFolder ? '✅' : '❌',
      details: uiFolder ? `${uiFolder}/tailwind.config.js найден` : 'tailwind.config.js не найден'
    },
    {
      name: 'Build commands configured',
      result: buildInfo.buildCommand !== 'НЕ НАЙДЕНО' ? '✅' : '❌',
      details: buildInfo.buildCommand !== 'НЕ НАЙДЕНО' ? 'beforeBuildCommand настроен' : 'beforeBuildCommand не настроен'
    }
  ];
  
  return checks;
}

// Find obvious mismatches
function findObviousMismatches(uiFolder, buildInfo) {
  const mismatches = [];
  
  if (uiFolder && buildInfo.distDir !== 'НЕ НАЙДЕНО') {
    if (!buildInfo.distDir.includes(uiFolder)) {
      mismatches.push(`distDir (${buildInfo.distDir}) не указывает на папку фронта (${uiFolder})`);
    }
  }
  
  if (buildInfo.devPath && !buildInfo.devPath.includes('5173') && !buildInfo.devPath.includes('3000')) {
    mismatches.push(`devPath (${buildInfo.devPath}) может указывать на неправильный порт`);
  }
  
  if (uiFolder && buildInfo.buildCommand !== 'НЕ НАЙДЕНО') {
    if (!buildInfo.buildCommand.includes(uiFolder)) {
      mismatches.push(`beforeBuildCommand не ссылается на папку фронта (${uiFolder})`);
    }
  }
  
  return mismatches.slice(0, 5); // Limit to 5 items
}

// Validate Markdown syntax
function validateMarkdown(content) {
  const errors = [];
  
  // Check for unclosed code blocks
  const codeBlockMatches = content.match(/```/g);
  if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
    errors.push('Unclosed code block detected');
  }
  
  // Check for unclosed JSON objects/arrays in code blocks
  const jsonBlocks = content.match(/```json\n([\s\S]*?)\n```/g);
  if (jsonBlocks) {
    jsonBlocks.forEach((block, index) => {
      const jsonContent = block.replace(/```json\n/, '').replace(/\n```/, '');
      try {
        JSON.parse(jsonContent);
      } catch (error) {
        errors.push(`Invalid JSON in code block ${index + 1}: ${error.message}`);
      }
    });
  }
  
  // Check for unclosed TypeScript/JavaScript blocks
  const tsBlocks = content.match(/```(?:typescript|javascript)\n([\s\S]*?)\n```/g);
  if (tsBlocks) {
    tsBlocks.forEach((block, index) => {
      const tsContent = block.replace(/```(?:typescript|javascript)\n/, '').replace(/\n```/, '');
      const openBraces = (tsContent.match(/\{/g) || []).length;
      const closeBraces = (tsContent.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        errors.push(`Unclosed braces in TypeScript/JavaScript block ${index + 1}`);
      }
    });
  }
  
  return errors;
}

// Generate PROJECT_MAP.md content
async function generateProjectMap() {
  const uiFolder = await findUIFolder();
  const tree = await generateTree(projectRoot);
  const keyFiles = await extractKeyFiles(uiFolder);
  const routes = await findRoutes(uiFolder);
  const locales = await findI18nLocales(uiFolder);
  const stores = await findStores(uiFolder);
  const pages = await findPages(uiFolder);
  const settingsTabs = await findSettingsTabs(uiFolder);
  const buildInfo = await extractBuildInfo(uiFolder);
  const sotChecks = checkSourcesOfTruth(uiFolder, buildInfo);
  const mismatches = findObviousMismatches(uiFolder, buildInfo);
  
  const content = `# Project Map - Netok

Generated: ${new Date().toISOString().split('T')[0]}

## TREE (ASCII)

\`\`\`text
${tree}
\`\`\`

## KEY FILES

### src-tauri/tauri.conf.json

\`\`\`json
${keyFiles['src-tauri/tauri.conf.json']}
\`\`\`

### ${uiFolder}/package.json

\`\`\`json
${keyFiles[`${uiFolder}/package.json`]}
\`\`\`

### ${uiFolder}/tailwind.config.js

\`\`\`javascript
${keyFiles[`${uiFolder}/tailwind.config.js`]}
\`\`\`

### ${uiFolder}/index.html

\`\`\`html
${keyFiles[`${uiFolder}/index.html`]}
\`\`\`

### ${uiFolder}/src/main.tsx

\`\`\`typescript
${keyFiles[`${uiFolder}/src/main.tsx`]}
\`\`\`

### ${uiFolder}/src/App.tsx

\`\`\`typescript
${keyFiles[`${uiFolder}/src/App.tsx`]}
\`\`\`

## MAP

### Build Commands

- **Dev Command**: ${buildInfo.devCommand}
- **Build Command**: ${buildInfo.buildCommand}
- **Dev Path**: <${buildInfo.devPath}>
- **Dist Dir**: ${buildInfo.distDir}
- **Window Title**: ${buildInfo.windowTitle}
- **Window Size**: ${buildInfo.windowSize}

### Routes

${routes.map(route => `- ${route}`).join('\n')}

### i18n Locales

${locales.map(locale => `- ${locale}`).join('\n')}

### Stores

${stores.map(store => `- ${store}`).join('\n')}

### Pages

${pages.map(page => `- ${page}`).join('\n')}

### Settings Tabs

${settingsTabs.map(tab => `- ${tab}`).join('\n')}

## SOT CHECK

${sotChecks.map(check => `- ${check.result} **${check.name}**: ${check.details}`).join('\n')}

## Obvious SoT Mismatches

${mismatches.length > 0 ? mismatches.map(mismatch => `- ⚠️ ${mismatch}`).join('\n') : '- ✅ No obvious mismatches found'}

---

*This file is auto-generated. Do not edit manually.*
`;

  // Validate the generated Markdown
  const markdownErrors = validateMarkdown(content);
  if (markdownErrors.length > 0) {
    console.warn('⚠️ Markdown validation warnings:');
    markdownErrors.forEach(error => console.warn(`  - ${error}`));
  }

  return content;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const isCheckMode = args.includes('--check');
  
  try {
    const content = await generateProjectMap();
    
    if (isCheckMode) {
      // Check mode: compare with existing PROJECT_MAP.md
      try {
        const existingContent = await readFile(join(projectRoot, 'PROJECT_MAP.md'), 'utf-8');
        if (existingContent === content) {
          console.log('✅ PROJECT_MAP.md is up to date');
          process.exit(0);
        } else {
          console.log('❌ PROJECT_MAP.md is outdated');
          process.exit(1);
        }
      } catch {
        console.log('❌ PROJECT_MAP.md not found');
        process.exit(1);
      }
    } else {
      // Generate mode: write PROJECT_MAP.md
      await writeFile(join(projectRoot, 'PROJECT_MAP.md'), content);
      console.log('✅ PROJECT_MAP.md generated successfully');
      
      // Print summary
      const uiFolder = await findUIFolder();
      const buildInfo = await extractBuildInfo(uiFolder);
      const routes = await findRoutes(uiFolder);
      const sotChecks = checkSourcesOfTruth(uiFolder, buildInfo);
      
      console.log('\n📊 SUMMARY:');
      console.log(`- UI Folder: ${uiFolder || 'НЕ НАЙДЕНО'}`);
      console.log(`- Dist Dir: ${buildInfo.distDir}`);
      console.log(`- Dev Path: ${buildInfo.devPath}`);
      console.log(`- Routes: ${routes.join(', ')}`);
      console.log(`- SOT Checks: ${sotChecks.filter(c => c.result === '✅').length}/${sotChecks.length} passed`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Import writeFile for Node.js compatibility
import { writeFile } from 'fs/promises';

main();
