import * as RODIN from 'rodin/core';
import { MainContainer } from './container/mainContainer.js';
RODIN.start();

/**
 * MainContainer class draws and renders everything
 * @type {MainContainer}
 */
let mainContainer = new MainContainer();
mainContainer.run();