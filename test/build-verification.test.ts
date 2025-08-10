// Simple test to verify the build process
import { parseArguments } from '../src/cli';
import { describe, it } from 'node:test';
import * as assert from 'assert';

console.log('Build verification test');

// Simple test to verify that the module can be imported and used
describe('Build Verification', () => {
  it('should be able to parse arguments', () => {
    const args = parseArguments(['/path/to/folder']);
    assert.strictEqual(args.path, '/path/to/folder');
    assert.strictEqual(args.undo, false);
    assert.strictEqual(args.delete, false);
  });

  it('should be able to parse undo flag', () => {
    const args = parseArguments(['--undo', '/path/to/folder']);
    assert.strictEqual(args.path, '/path/to/folder');
    assert.strictEqual(args.undo, true);
    assert.strictEqual(args.delete, false);
  });

  it('should be able to parse delete flag', () => {
    const args = parseArguments(['--delete', '/path/to/folder']);
    assert.strictEqual(args.path, '/path/to/folder');
    assert.strictEqual(args.undo, false);
    assert.strictEqual(args.delete, true);
  });
});