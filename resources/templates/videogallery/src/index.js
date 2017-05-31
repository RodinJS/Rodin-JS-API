import * as RODIN from 'rodin/core';
import { MainContainer } from './container/mainContainer.js';
RODIN.start();

let mainContainer = new MainContainer();

mainContainer.run();