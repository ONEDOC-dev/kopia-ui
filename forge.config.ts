import { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { VitePlugin } from '@electron-forge/plugin-vite';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: 'public/oneCLOUD.icns',
    extraResource: [
      'resources',
      'public'
    ]
  },
  makers: [
    new MakerSquirrel({
      name: 'oneCLOUD',
      setupExe: '${productName}-${version}-setup.exe',
      setupIcon: 'public/oneCLOUD_1024.png',
    }),
    new MakerZIP({}, ['darwin'])
  ],
  publishers: [],
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
  ],
}

export default config;