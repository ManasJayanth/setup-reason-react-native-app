import React from "react";
import {
  AppRegistry
} from 'react-native';
import { app as App } from './src/App';
import { displayName } from './app.json';

AppRegistry.registerComponent(displayName, () => App);
