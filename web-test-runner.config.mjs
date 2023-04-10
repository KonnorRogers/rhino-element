import { playwrightLauncher } from '@web/test-runner-playwright';
// import { esbuildPlugin } from '@web/dev-server-esbuild';

/** @type {import("@web/test-runner").TestRunnerConfig} */
export default {
  rootDir: '.',
  nodeResolve: true,
  files: 'src/**/*.test.js', // "default" group
  concurrentBrowsers: 3,
  nodeResolve: true,
  testFramework: {
    config: {
      ui: 'tdd',
      timeout: 3000,
      retries: 1
    }
  },
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
    playwrightLauncher({ product: 'webkit' })
  ],
  // plugins: [
  //   esbuildPlugin({
  //     target: 'auto'
  //   })
  // ],
  // groups: [
  //   {
  //     name: 'polyfills-a',
  //     testRunnerHtml: testFramework =>
  //       `<html>
  //         <body>
  //           <script src="./polyfills-a.js"></script>
  //           <script type="module" src="${testFramework}"></script>
  //         </body>
  //       </html>`,
  //   },
  //   {
  //     name: 'polyfills-b',
  //     testRunnerHtml: testFramework =>
  //       `<html>
  //         <body>
  //           <script src="./polyfills-b.js"></script>
  //           <script type="module" src="${testFramework}"></script>
  //         </body>
  //       </html>`,
  //   },
  // ],
}
