const fs = require('fs');
const path = require('path');

// Load the music genres JSON
const genreData = JSON.parse(fs.readFileSync(path.join(__dirname, '../music_genres.json'), 'utf8'));

function testGenreDuplicates() {
  const seen = new Map();
  const duplicates = [];
  
  function checkGenre(genre, parentContext = '') {
    const key = genre.id;
    const fullContext = parentContext ? `${parentContext}/${key}` : key;
    
    if (seen.has(key)) {
      duplicates.push({ id: key, name: genre.name, contexts: [seen.get(key), fullContext] });
    } else {
      seen.set(key, fullContext);
    }
    
    if (genre.subgenres) {
      genre.subgenres.forEach(sub => checkGenre(sub, fullContext));
    }
    
    if (genre.microgenres) {
      genre.microgenres.forEach(micro => {
        checkGenre(micro, fullContext);
        
        // Check nested microgenres
        if (micro.microgenres) {
          micro.microgenres.forEach(nested => checkGenre(nested, `${fullContext}/${micro.id}`));
        }
      });
    }
  }
  
  genreData.genres.forEach(genre => checkGenre(genre));
  
  return duplicates;
}

function countGenres() {
  let counts = {
    mainGenres: 0,
    subgenres: 0,
    microgenres: 0,
    nestedMicrogenres: 0,
    total: 0
  };
  
  function countRecursive(genres, level = 'main') {
    genres.forEach(genre => {
      if (level === 'main') counts.mainGenres++;
      else if (level === 'sub') counts.subgenres++;
      else if (level === 'micro') counts.microgenres++;
      else if (level === 'nested') counts.nestedMicrogenres++;
      
      counts.total++;
      
      if (genre.subgenres && genre.subgenres.length > 0) {
        countRecursive(genre.subgenres, 'sub');
      }
      
      if (genre.microgenres && genre.microgenres.length > 0) {
        countRecursive(genre.microgenres, 'micro');
        
        // Count nested microgenres
        genre.microgenres.forEach(micro => {
          if (micro.microgenres && micro.microgenres.length > 0) {
            countRecursive(micro.microgenres, 'nested');
          }
        });
      }
    });
  }
  
  countRecursive(genreData.genres);
  return counts;
}

function findPhonkInstances() {
  const instances = [];
  
  function searchGenre(genre, parentContext = []) {
    if (genre.name.toLowerCase().includes('phonk')) {
      instances.push({
        id: genre.id,
        name: genre.name,
        path: [...parentContext, genre.name].join(' > ')
      });
    }
    
    if (genre.subgenres) {
      genre.subgenres.forEach(sub => 
        searchGenre(sub, [...parentContext, genre.name])
      );
    }
    
    if (genre.microgenres) {
      genre.microgenres.forEach(micro => {
        searchGenre(micro, [...parentContext, genre.name]);
        
        if (micro.microgenres) {
          micro.microgenres.forEach(nested => 
            searchGenre(nested, [...parentContext, genre.name, micro.name])
          );
        }
      });
    }
  }
  
  genreData.genres.forEach(genre => searchGenre(genre));
  return instances;
}

function findHipHopSubgenres() {
  const hipHop = genreData.genres.find(g => g.id === 'hip-hop-rap');
  if (!hipHop) return [];
  
  return hipHop.subgenres.map(sub => ({
    id: sub.id,
    name: sub.name,
    microgenreCount: sub.microgenres ? sub.microgenres.length : 0
  }));
}

function findTrapMicrogenres() {
  const hipHop = genreData.genres.find(g => g.id === 'hip-hop-rap');
  if (!hipHop) return [];
  
  const trap = hipHop.subgenres.find(s => s.id === 'trap');
  if (!trap) return [];
  
  const microgenres = [];
  
  trap.microgenres.forEach(micro => {
    microgenres.push({
      id: micro.id,
      name: micro.name,
      hasNested: !!(micro.microgenres && micro.microgenres.length > 0)
    });
    
    // Add nested microgenres (like drill variants)
    if (micro.microgenres) {
      micro.microgenres.forEach(nested => {
        microgenres.push({
          id: nested.id,
          name: nested.name,
          parent: micro.name,
          hasNested: false
        });
      });
    }
  });
  
  return microgenres;
}

// Run tests
console.log('🎵 Genre Database Test Results\n');

console.log('📊 Genre Counts:');
const counts = countGenres();
console.log(`  Main Genres: ${counts.mainGenres}`);
console.log(`  Subgenres: ${counts.subgenres}`);  
console.log(`  Microgenres: ${counts.microgenres}`);
console.log(`  Nested Microgenres: ${counts.nestedMicrogenres}`);
console.log(`  Total: ${counts.total}\n`);

console.log('🔍 Phonk Instances:');
const phonkInstances = findPhonkInstances();
phonkInstances.forEach(p => {
  console.log(`  ${p.name} (${p.id}) - Path: ${p.path}`);
});
console.log(`  Found ${phonkInstances.length} Phonk instances\n`);

console.log('🎤 Hip-Hop/Rap Subgenres:');
const hipHopSubs = findHipHopSubgenres();
hipHopSubs.forEach(sub => {
  console.log(`  ${sub.name} (${sub.microgenreCount} microgenres)`);
});
console.log(`  Found ${hipHopSubs.length} Hip-Hop subgenres\n`);

console.log('🔥 Trap Microgenres:');
const trapMicros = findTrapMicrogenres();
trapMicros.forEach(micro => {
  const parent = micro.parent ? ` [under ${micro.parent}]` : '';
  console.log(`  ${micro.name}${parent}`);
});
console.log(`  Found ${trapMicros.length} Trap microgenres\n`);

console.log('🚨 Duplicate ID Check:');
const duplicates = testGenreDuplicates();
if (duplicates.length > 0) {
  console.log('  ❌ Found duplicate IDs:');
  duplicates.forEach(dup => {
    console.log(`    ${dup.name} (${dup.id}) appears in multiple contexts`);
  });
} else {
  console.log('  ✅ No duplicate IDs found (good for React keys)');
}

console.log('\n🎯 Test Summary:');
console.log(`  Total genres available: ${counts.total}`);
console.log(`  Phonk duplicates: ${phonkInstances.length} (expected: 2)`);
console.log(`  Hip-Hop subgenres: ${hipHopSubs.length} (expected: 10+)`);
console.log(`  Trap microgenres: ${trapMicros.length} (expected: 15+)`);
console.log(`  Duplicate issues: ${duplicates.length > 0 ? '❌ YES' : '✅ NO'}`);