import type { OpenNextConfig } from '@opennextjs/aws/types/open-next.js';

const config: OpenNextConfig = {
  default: {
    type: 'function',
  },
  buildCommand: 'next build',
};

export default config;