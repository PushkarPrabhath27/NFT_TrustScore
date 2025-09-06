#!/usr/bin/env node

/**
 * MUI Icons Import Validator
 * Checks that all @mui/icons-material imports reference valid icon names
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the project root directory
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');

// Check if @mui/icons-material is installed
let availableIcons = [];
try {
  const iconsDir = path.join(projectRoot, 'node_modules', '@mui', 'icons-material');
  if (fs.existsSync(iconsDir)) {
    availableIcons = fs.readdirSync(iconsDir)
      .filter(file => file.endsWith('.js'))
      .map(file => file.replace('.js', ''));
  } else {
    console.error('❌ @mui/icons-material package not found in node_modules');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error reading @mui/icons-material directory:', error.message);
  process.exit(1);
}

// Function to find all JS/TS files recursively
function findSourceFiles(dir, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  let files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files = files.concat(findSourceFiles(fullPath, extensions));
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Ignore permission errors
  }
  
  return files;
}

// Function to extract MUI icon imports from file content
function extractMuiIconImports(content, filePath) {
  const issues = [];
  
  // Pattern 1: Named imports from package root
  // import { IconName, IconName2 as Alias } from '@mui/icons-material';
  const namedImportPattern = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@mui\/icons-material['"]/g;
  let match;
  
  while ((match = namedImportPattern.exec(content)) !== null) {
    const imports = match[1].split(',').map(imp => imp.trim());
    
    for (const imp of imports) {
      const iconName = imp.includes(' as ') ? imp.split(' as ')[0].trim() : imp.trim();
      
      if (!availableIcons.includes(iconName)) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        issues.push({
          file: filePath,
          line: lineNumber,
          type: 'named_import',
          iconName,
          suggestion: findSimilarIcon(iconName)
        });
      }
    }
  }
  
  // Pattern 2: Default imports from specific icon path
  // import IconName from '@mui/icons-material/IconName';
  const defaultImportPattern = /import\s+(\w+)\s+from\s*['"]@mui\/icons-material\/([^'"]+)['"]/g;
  
  while ((match = defaultImportPattern.exec(content)) !== null) {
    const iconName = match[2];
    
    if (!availableIcons.includes(iconName)) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      issues.push({
        file: filePath,
        line: lineNumber,
        type: 'default_import',
        iconName,
        suggestion: findSimilarIcon(iconName)
      });
    }
  }
  
  return issues;
}

// Function to find similar icon names
function findSimilarIcon(iconName) {
  const suggestions = availableIcons.filter(icon => 
    icon.toLowerCase().includes(iconName.toLowerCase()) ||
    iconName.toLowerCase().includes(icon.toLowerCase())
  );
  
  return suggestions.slice(0, 3); // Return top 3 suggestions
}

// Main validation function
function validateMuiIconImports() {
  console.log('🔍 Checking MUI icon imports...\n');
  
  const sourceFiles = findSourceFiles(srcDir);
  let totalIssues = 0;
  const allIssues = [];
  
  for (const filePath of sourceFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const issues = extractMuiIconImports(content, path.relative(projectRoot, filePath));
      
      if (issues.length > 0) {
        allIssues.push(...issues);
        totalIssues += issues.length;
      }
    } catch (error) {
      console.warn(`⚠️  Could not read file ${filePath}: ${error.message}`);
    }
  }
  
  if (totalIssues === 0) {
    console.log('✅ All MUI icon imports are valid!');
    return true;
  }
  
  console.log(`❌ Found ${totalIssues} invalid MUI icon import(s):\n`);
  
  // Group issues by file
  const issuesByFile = {};
  for (const issue of allIssues) {
    if (!issuesByFile[issue.file]) {
      issuesByFile[issue.file] = [];
    }
    issuesByFile[issue.file].push(issue);
  }
  
  // Display issues
  for (const [file, issues] of Object.entries(issuesByFile)) {
    console.log(`📁 ${file}:`);
    for (const issue of issues) {
      console.log(`   Line ${issue.line}: ${issue.type} - "${issue.iconName}" not found`);
      if (issue.suggestion.length > 0) {
        console.log(`   💡 Suggestions: ${issue.suggestion.join(', ')}`);
      }
    }
    console.log('');
  }
  
  console.log('🔧 To fix these issues:');
  console.log('   1. Replace invalid icon names with valid ones from the suggestions above');
  console.log('   2. Use single-file default imports: import IconName from "@mui/icons-material/IconName"');
  console.log('   3. Check available icons: ls node_modules/@mui/icons-material/ | grep -i <iconname>');
  
  return false;
}

// Run the validation
if (require.main === module) {
  const isValid = validateMuiIconImports();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateMuiIconImports };

