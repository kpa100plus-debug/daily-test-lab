import { execFile as execFileCallback } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);
const { stdout } = await execFile(
  'git',
  ['ls-files', '-co', '--exclude-standard', '-z'],
  { encoding: 'buffer' }
);
const files = stdout.toString('utf8').split('\0').filter(Boolean);
const signatures = [
  ['private-key', new RegExp(['-----BEGIN ', '(?:RSA |EC |OPENSSH )?', 'PRIVATE KEY-----'].join(''), 'i')],
  ['service-account', new RegExp(['["\\\']type["\\\']\\s*:\\s*["\\\']', 'service_', 'account["\\\']'].join(''), 'i')],
  ['service-account-private-key', new RegExp(['["\\\']private_', 'key["\\\']\\s*:'].join(''), 'i')],
  ['github-token', new RegExp(['gh', '[oprsu]_[A-Za-z0-9_]{30,}'].join(''))],
  ['google-oauth-token', new RegExp(['ya', '29\\.[A-Za-z0-9_-]{30,}'].join(''))],
  ['aws-access-key', new RegExp(['AK', 'IA[0-9A-Z]{16}'].join(''))]
];
const findings = [];

for (const file of files) {
  if (/^(?:dist|node_modules)\//.test(file) || file === 'scripts/scan-secrets.mjs') continue;
  const contents = await readFile(file).catch(() => null);
  if (!contents || contents.includes(0)) continue;
  const text = contents.toString('utf8');
  for (const [name, pattern] of signatures) {
    if (pattern.test(text)) findings.push(`${file}: ${name}`);
  }
}

if (findings.length) {
  console.error(`Potential secrets detected:\n${findings.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Secret scan complete: ${files.length} repository files checked`);
}
