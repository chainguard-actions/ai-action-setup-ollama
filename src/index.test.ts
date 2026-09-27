import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as tc from '@actions/tool-cache';
import { type ChildProcess, spawn } from 'child_process';
import os from 'os';

import { run } from '.';

jest.mock('@actions/core');
jest.mock('@actions/exec');
jest.mock('@actions/tool-cache');
jest.mock('child_process');
jest.mock('os');

const mockedCore = jest.mocked(core);
const mockedExec = jest.mocked(exec);
const mockedOs = jest.mocked(os);
const mockedSpawn = jest.mocked(spawn);
const mockedTc = jest.mocked(tc);

beforeEach(() => {
  jest.resetAllMocks();
});

const cliName = 'cli-name';
const cliVersion = '1.2.3';
const pathToTarball = 'path/to/tarball';
const pathToCLI = 'path/to/cli';
const platforms = ['darwin', 'win32', 'linux'];

describe.each(platforms)('when platform is %p', (platform) => {
  beforeEach(() => {
    mockedOs.platform.mockReturnValue(platform as NodeJS.Platform);
    mockedOs.arch.mockReturnValue('arm64');

    mockedCore.getInput.mockImplementation((input) => {
      switch (input) {
        case 'version':
          return cliVersion;
        case 'name':
          return cliName;
        default:
          // eslint-disable-next-line no-console
          console.error(`Invalid input: ${input}`);
          return '';
      }
    });
  });

  const binPath = platform === 'linux' ? `${pathToCLI}/bin` : pathToCLI;
  const cliPath = `${binPath}/${cliName}`;

  it('downloads, extracts, and adds CLI to PATH', async () => {
    mockedTc.downloadTool.mockResolvedValueOnce(pathToTarball);
    const isWin32 = platform === 'win32';
    const extract = isWin32 ? mockedTc.extractZip : mockedTc.extractTar;
    extract.mockResolvedValueOnce(pathToCLI);
    const unref = jest.fn();
    mockedSpawn.mockReturnValueOnce({ unref } as unknown as ChildProcess);

    await run();

    expect(mockedTc.downloadTool).toHaveBeenCalledWith(
      expect.stringContaining('https://ollama.com/download/ollama-'),
    );

    expect(extract).toHaveBeenCalledWith(pathToTarball);

    const extension = isWin32 ? '.exe' : '';
    expect(mockedExec.exec).toHaveBeenCalledWith('mv', [
      `${binPath}/ollama${extension}`,
      cliPath + extension,
    ]);

    expect(mockedTc.cacheFile).toHaveBeenCalledWith(
      cliPath + extension,
      cliName + extension,
      cliName,
      cliVersion,
    );

    expect(mockedCore.addPath).toHaveBeenCalledWith(binPath);

    expect(mockedSpawn).toHaveBeenCalledWith(cliName, ['serve'], {
      detached: true,
      stdio: 'ignore',
    });
    expect(unref).toHaveBeenCalledTimes(1);
  });
});

describe('error', () => {
  it('throws error', async () => {
    const message = 'error';
    mockedCore.getInput.mockImplementationOnce(() => {
      throw new Error(message);
    });
    await run();
    expect(mockedCore.setFailed).toHaveBeenCalledWith(message);
  });
});
