import { defineConfig } from 'tsup';

export default defineConfig({
	entry: {
		cli: 'src/cli.ts',
		index: 'src/index.ts'
	},
	format: ['esm'],
	target: 'node18',
	clean: true,
	dts: true,
	sourcemap: true,
	splitting: false,
	shims: true,
	banner: {
		js: '#!/usr/bin/env node'
	}
});
