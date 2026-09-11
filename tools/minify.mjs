import * as esbuild from 'esbuild';
import fs from 'node:fs';

const files = [
  { in: 'css/style.css', out: 'css/style.min.css' },
  { in: 'js/script.js', out: 'js/script.min.js' },
  { in: 'js/pokemon-data.js', out: 'js/pokemon-data.min.js' }
];

async function minifyFiles() {
  console.log('⚡ Minifying static assets...');
  let totalOrigBytes = 0;
  let totalMinBytes = 0;

  for (const file of files) {
    if (!fs.existsSync(file.in)) {
      console.warn(`⚠️ Warning: ${file.in} does not exist. Skipping.`);
      continue;
    }

    const origStats = fs.statSync(file.in);
    totalOrigBytes += origStats.size;

    await esbuild.build({
      entryPoints: [file.in],
      outfile: file.out,
      minify: true,
      legalComments: 'none',
      sourcemap: false
    });

    const minStats = fs.statSync(file.out);
    totalMinBytes += minStats.size;

    const savedPercent = (((origStats.size - minStats.size) / origStats.size) * 100).toFixed(1);
    console.log(`  ✓ ${file.in} (${(origStats.size / 1024).toFixed(1)} KB) -> ${file.out} (${(minStats.size / 1024).toFixed(1)} KB) [-${savedPercent}%]`);
  }

  const totalSavedPercent = (((totalOrigBytes - totalMinBytes) / totalOrigBytes) * 100).toFixed(1);
  console.log(`✨ Done! Total size reduced from ${(totalOrigBytes / 1024).toFixed(1)} KB to ${(totalMinBytes / 1024).toFixed(1)} KB (-${totalSavedPercent}%)\n`);
}

minifyFiles().catch((err) => {
  console.error('❌ Error minifying assets:', err);
  process.exit(1);
});
