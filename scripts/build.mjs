// Programmatic Vite build to avoid shell permission issues on some CI providers
import { build } from 'vite';

async function run() {
  try {
    // Uses vite.config.ts automatically
    await build();
    console.log('Vite build completed successfully.');
  } catch (error) {
    console.error('Vite build failed:');
    console.error(error);
    process.exit(1);
  }
}

run();