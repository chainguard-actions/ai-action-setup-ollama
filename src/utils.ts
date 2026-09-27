import os from 'os';
import path from 'path';

const ARCHITECTURE = {
  arm64: 'arm64',
  x64: 'amd64',
} as const;

/**
 * Gets the operating system CPU architecture.
 *
 * @see {@link https://nodejs.org/api/os.html#os_os_arch}
 *
 * @param arch - Arch in [arm64, x64...]
 * @returns - Return value in [arm64, amd64]
 */
function getArch(arch: NodeJS.Architecture) {
  return ARCHITECTURE[arch as keyof typeof ARCHITECTURE] || arch;
}

const PLATFORM = {
  darwin: 'darwin',
  linux: 'linux',
  win32: 'windows',
} as const;

/**
 * Gets a string identifying the operating system platform.
 *
 * @see {@link https://nodejs.org/api/os.html#os_os_platform}
 *
 * @param os - OS in [darwin, linux, win32...]
 * @returns - Return value in [darwin, linux, windows]
 */
function getOS(os: NodeJS.Platform) {
  return PLATFORM[os as keyof typeof PLATFORM] || os;
}

/**
 * Gets download object.
 *
 * @see {@link https://github.com/ollama/ollama/releases}
 *
 * @param version - CLI version
 * @returns - URL and binary path
 */
export function getDownloadObject(version: string) {
  const platform = os.platform();
  const arch = os.arch() as NodeJS.Architecture;

  let filename = `ollama-${getOS(platform)}-${getArch(arch)}`;
  let extension = '';

  switch (platform) {
    case 'darwin':
      filename = 'ollama-darwin';
      extension = '.tgz';
      break;

    case 'linux':
      extension = '.tgz';
      break;

    case 'win32':
      extension = '.zip';
      break;
  }

  return {
    binaryDirectory: platform === 'linux' ? 'bin' : '',
    url: `https://ollama.com/download/${filename}${extension}?version=${version}`,
  };
}

/**
 * Gets CLI path.
 *
 * @param directory - Directory
 * @param name - CLI name
 * @returns - Binary path
 */
export function getBinaryPath(directory: string, name: string) {
  return path.join(directory, name + (os.platform() === 'win32' ? '.exe' : ''));
}
