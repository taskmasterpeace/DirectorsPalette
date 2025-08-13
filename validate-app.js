// Validation script to check if all components are working
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating ImgPromptGen Application\n');
console.log('=====================================\n');

let errors = [];
let warnings = [];

// Check 1: Required files exist
console.log('📁 Checking required files...');
const requiredFiles = [
  'app/page.tsx',
  'app/actions/story/index.ts',
  'app/actions/story/breakdown.ts',
  'app/actions/story/references.ts',
  'app/actions/music-video/index.ts',
  'app/actions/music-video/breakdown.ts',
  'components/containers/StoryContainer.tsx',
  'components/containers/MusicVideoContainer.tsx',
  'stores/story-store.ts',
  'stores/music-video-store.ts',
  'lib/error-handling.ts',
  'lib/curated-directors.ts'
];

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing file: ${file}`);
  }
});

console.log(errors.length === 0 ? '✅ All required files present' : `❌ ${errors.length} files missing`);

// Check 2: Check for common issues in key files
console.log('\n🔎 Checking for common issues...');

// Check localStorage usage in server files
const serverFiles = [
  'app/actions/story/breakdown.ts',
  'app/actions/story/references.ts',
  'app/actions/music-video/breakdown.ts'
];

serverFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Check for direct localStorage usage
    if (content.includes('localStorage.') && !content.includes('typeof window')) {
      warnings.push(`${file} may have unsafe localStorage usage`);
    }
  }
});

// Check 3: Verify imports
console.log('\n📦 Checking critical imports...');

const storyContainerPath = path.join(process.cwd(), 'components/containers/StoryContainer.tsx');
if (fs.existsSync(storyContainerPath)) {
  const content = fs.readFileSync(storyContainerPath, 'utf-8');
  if (!content.includes("import { curatedFilmDirectors }")) {
    errors.push('StoryContainer missing curatedFilmDirectors import');
  }
}

// Check 4: Verify store reset functions
console.log('\n🔄 Checking store reset functions...');

const storyWorkflowStore = path.join(process.cwd(), 'stores/story-workflow-store.ts');
if (fs.existsSync(storyWorkflowStore)) {
  const content = fs.readFileSync(storyWorkflowStore, 'utf-8');
  if (!content.includes('resetWorkflow')) {
    warnings.push('story-workflow-store missing resetWorkflow function');
  }
}

// Check 5: Verify error handling
console.log('\n⚠️ Checking error handling...');

const errorHandlingPath = path.join(process.cwd(), 'lib/error-handling.ts');
if (fs.existsSync(errorHandlingPath)) {
  const content = fs.readFileSync(errorHandlingPath, 'utf-8');
  if (!content.includes('typeof window')) {
    errors.push('error-handling.ts missing window checks for localStorage');
  }
}

// Report results
console.log('\n=====================================');
console.log('📊 Validation Results:\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All checks passed! The application should be working correctly.');
} else {
  if (errors.length > 0) {
    console.log(`❌ ${errors.length} Errors found:`);
    errors.forEach(err => console.log(`   - ${err}`));
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️ ${warnings.length} Warnings found:`);
    warnings.forEach(warn => console.log(`   - ${warn}`));
  }
}

console.log('\n🌐 Server should be running at: http://localhost:3004');
console.log('\n📝 To test the app:');
console.log('1. Open http://localhost:3004 in your browser');
console.log('2. Enter a story in Story Mode');
console.log('3. Click "Extract Story References"');
console.log('4. Configure the references if needed');
console.log('5. Click "Generate Final Breakdown"');
console.log('\nFor Music Video Mode:');
console.log('1. Switch to Music Video Mode');
console.log('2. Enter song lyrics');
console.log('3. Follow similar steps');

process.exit(errors.length > 0 ? 1 : 0);