// external dependencies
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// local from us provided utilities
import type * as utils from './lib/utils';
import RenderWidget from './lib/rendererWidget';
import { Application, createWindow } from './lib/window';

// helper lib, provides exercise dependent prewritten Code
import * as helper from './helper';


function callback(changed: utils.KeyValuePair<helper.Settings>){

}

/*******************************************************************************
 * Main entrypoint.
 ******************************************************************************/

var settings: helper.Settings;

function main(){
  var root = Application("Camera");
  root.setLayout([["world", "canonical", "screen"]]);
  root.setLayoutColumns(["1fr", "1fr", "1fr"]);
  root.setLayoutRows(["100%"]);


  var screenDiv = createWindow("screen");
  root.appendChild(screenDiv);

  // create RenderDiv
  var worldDiv = createWindow("world");
  root.appendChild(worldDiv);

  // create canonicalDiv
  var canonicalDiv = createWindow("canonical");
  root.appendChild(canonicalDiv);

  // ---------------------------------------------------------------------------
  // create Settings and create GUI settings
  settings = new helper.Settings();
  helper.createGUI(settings);
  settings.addCallback(callback);
}

// call main entrypoint
main();
