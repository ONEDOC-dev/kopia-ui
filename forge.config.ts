module.exports = {
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        // `build` can specify multiple entry builds, which can be
        // Main process, Preload scripts, Worker process, etc.
        build: [
          {
            // `entry` is an alias for `build.lib.entry`
            // in the corresponding file of `config`.
            entry: 'electron/main/main.ts',
            config: 'vite.electron.config.ts'
          },
          {
            entry: 'electron/ipc/preload.ts',
            config: 'vite.electron.config.ts'
          }
        ],
        renderer: [
          // {
          //   entry: 'src/index.jsx',
          //   name: 'main_window',
          //   config: 'vite.config.js',
          //   template: 'index.html',
          // }
        ]
      }
    }
  ]
}