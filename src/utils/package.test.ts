import { describe, it, expect } from 'vitest';
import { getVersion } from './package.js';

describe('utils', () => {
	describe('getVersion', () => {
		it('should return a valid semver version', () => {
			const version = getVersion();
			expect(version).toMatch(/^\d+\.\d+\.\d+/);
		});

		it('should return 0.0.1 as the initial version', () => {
			const version = getVersion();
			expect(version).toBe('0.0.1');
		});
	});
});
