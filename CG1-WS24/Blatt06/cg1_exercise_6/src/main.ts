// external dependencies
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// local from us provided utilities
import type * as utils from './lib/utils';
import RenderWidget from './lib/rendererWidget';
import { Application, createWindow } from './lib/window';

// helper lib, provides exercise dependent prewritten Code
import * as helper from './helper';

/*******************************************************************************
 * Linear Blend Skinning.
 ******************************************************************************/

import indices from './data/indices.json';
import weights from './data/weights.json';

import jump from './data/jump.json';
import swimming from './data/swimming.json';
import swing_dance from './data/swing_dance.json';

function initAnimation() {
    console.log("Intializing animation.");
}

function stepAnimation() {
    console.log("Step animation.");
}

/*******************************************************************************
 * Pendulum.
 ******************************************************************************/

function initPendulum() {
    console.log("Intializing pendulum.");
}

function stepPendulum() {
    console.log("Step pendulum.");
}

/*******************************************************************************
 * The main application.
 ******************************************************************************/

function callback(changed: utils.KeyValuePair<helper.Settings>) {
    if (changed.key == 'exercise') {
        switch (changed.value) {
            case helper.Exercise.LBS:
                wid.preRenderHook = stepAnimation;
                initAnimation();
                break;
            case helper.Exercise.pendulum:
                wid.preRenderHook = stepPendulum;
                initPendulum();
                break;
        }
    } 
}

/*******************************************************************************
 * Main entrypoint.
 ******************************************************************************/

var settings: helper.Settings;
var scene: THREE.Scene;
let wid: RenderWidget;

function main() {
    var root = Application("Animation & Simulation");
    root.setLayout([["renderer"]]);
    root.setLayoutColumns(["100%"]);
    root.setLayoutRows(["100%"]);

    // -------------------------------------------------------------------------
    // create Settings and create GUI settings
    settings = new helper.Settings();
    helper.createGUI(settings);
    settings.addCallback(callback);

    // create RenderDiv
    var rendererDiv = createWindow("renderer");
    root.appendChild(rendererDiv);

    // create renderer
    var renderer = new THREE.WebGLRenderer({ antialias: true });

    // create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // create camera
    const camera = new THREE.PerspectiveCamera();
    helper.setupCamera(camera);

    // create camera controls
    var controls = new OrbitControls(camera, rendererDiv);
    controls.target.set(0, 50, 0);

    // -------------------------------------------------------------------------
    // create render widget
    wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls);
    // initializes the default exercise
    callback({ key: "exercise", value: settings.exercise });
    wid.animate();
}

// call main entrypoint
main();
