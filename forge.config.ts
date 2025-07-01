import { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: process.platform === 'win32' ? 'public/oneCLOUD.ico' : 'public/oneCLOUD.icns',
    extraResource: [
      'resources',
      'public'
    ]
  },
  makers: [
    new MakerSquirrel({
      name: 'oneCLOUD',
      setupExe: '${productName}-${version}-setup.exe',
      setupIcon: 'public/oneCLOUD.ico',
      description: 'oneCLOUD - Cloud Backup and Storage Solution',
      authors: 'oneDOC',
      version: '${version}',
    }),
    new MakerZIP({}, ['darwin'])
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-s3',
        config: {
          bucket: 'my-bucket',
          public: true
        }
    }
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'electron/main/main.ts',
          config: 'vite.electron.config.ts',
        },
        {
          entry: 'electron/ipc/preload.ts',
          config: 'vite.electron.config.ts',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.config.js',
        },
      ],
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
}

export default config;