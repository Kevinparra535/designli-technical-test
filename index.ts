// reflect-metadata MUST be the FIRST import: it installs the Reflect polyfill
// that Inversify reads at decorator-evaluation time. This file is exempt from
// import-sort (see eslint.config.js) so the polyfill always stays on top.
import 'reflect-metadata';

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
