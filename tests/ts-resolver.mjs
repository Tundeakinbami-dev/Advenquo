import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

export async function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith('.js') && (specifier.startsWith('./') || specifier.startsWith('../'))) {
    const parentDir = context.parentURL ? path.dirname(fileURLToPath(context.parentURL)) : process.cwd();
    const candidatePath = path.resolve(parentDir, specifier.replace(/\.js$/, '.ts'));
    if (fs.existsSync(candidatePath)) {
      return nextResolve(pathToFileURL(candidatePath).href, context);
    }
  }
  return nextResolve(specifier, context);
}
