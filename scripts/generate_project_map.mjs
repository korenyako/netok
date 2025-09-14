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
  '.pnpm-store', '.cache', 'build', 'out', '.vscode', '.idea'
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

// Read file content with line limit
async function readFileContent(filePath, maxLines = MAX_FILE_LINES) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    return lines.slice(0, maxLines).join('\n');
  } catch {
    return 'НЕ НАЙДЕНО';
  }
}

// Extract key information from files
async function extractKeyFiles(uiFolder) {
  const keyFiles = {};
  
  // Tauri config
  const tauriConfigPath = join(projectRoot, 'netok_desktop', 'src-tauri', 'tauri.conf.json');
  keyFiles['src-tauri/tauri.conf.json'] = await readFileContent(tauriConfigPath, 30);
  
  // UI package.json
  const packageJsonPath = join(projectRoot, uiFolder, 'package.json');
  keyFiles[`${uiFolder}/package.json`] = await readFileContent(packageJsonPath, 30);
  
  // Tailwind config
  const tailwindConfigPath = join(projectRoot, uiFolder, 'tailwind.config.js');
  keyFiles[`${uiFolder}/tailwind.config.js`] = await readFileContent(tailwindConfigPath, 20);
  
  // Index.html
  const indexHtmlPath = join(projectRoot, uiFolder, 'index.html');
  keyFiles[`${uiFolder}/index.html`] = await readFileContent(indexHtmlPath, 20);
  
  // Main.tsx
  const mainTsxPath = join(projectRoot, uiFolder, 'src', 'main.tsx');
  keyFiles[`${uiFolder}/src/main.tsx`] = await readFileContent(mainTsxPath, 20);
  
  // App.tsx
  const appTsxPath = join(projectRoot, uiFolder, 'src', 'App.tsx');
  keyFiles[`${uiFolder}/src/App.tsx`] = await readFileContent(appTsxPath, 30);
  
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

\`\`\`
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
- **Dev Path**: ${buildInfo.devPath}
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
