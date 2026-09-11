import fs from 'fs';
import path from 'path';

import yaml from 'js-yaml';

const readYaml = (filePath) => yaml.load(fs.readFileSync(filePath, 'utf-8'));

export const getTopbarData = () => {
  try {
    const topbar = readYaml(path.join(process.cwd(), 'content/config/topbar.yaml'));

    if (!topbar || typeof topbar !== 'object') return null;

    return topbar;
  } catch (_e) {
    return null;
  }
};
