import * as THREE from 'three';
import * as dat from 'dat.gui';

import * as utils from './lib/utils';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

import elephant from './data/elephant.obj?raw';

export type Animation = {
    restpose: Array<Array<number>>,
    frames: Array<Array<Array<number>>>
}

export enum Animations { jump = "Jump", swing_dance = "Swing Dance", swimming = "Swimming" }

export enum SolverTypes {
    Euler = "Euler",
    Trapezoid = "Trapezoid",
    Midpoint = "Midpoint",
    RungeKutta = "Runge-Kutta"
}

export enum Exercise {
    LBS = "LBS",
    pendulum = "Pendulum"
}
export class Settings extends utils.Callbackable {
    exercise: Exercise = Exercise.LBS;

    // lbs
    animation: Animations = Animations.jump;
    mesh: boolean = false;
    skeleton: boolean = true;
    restpose: boolean = true;
    // pendulum
    mass: number = 1;
    stiffness: number = 1.0;
    step: number = 0.08;
    radius: number = 50;
    solverType: SolverTypes = SolverTypes.Euler;
    double: boolean = false;
    reset: () => void = function () { };
}

export function createGUI(params: Settings): dat.GUI {
    var gui: dat.GUI = new dat.GUI();



    let exController = gui.add(params, 'exercise', utils.enumOptions(Exercise)).name('Exercise');

    // lbs
    const lbsFolder = gui.addFolder('Linear Blend Skinning');
    lbsFolder.add(params, 'animation', utils.enumOptions(Animations)).name('Animation')
    lbsFolder.add(params, 'mesh').name('Show Mesh');
    lbsFolder.add(params, 'skeleton').name('Show Skeleton');
    lbsFolder.add(params, 'restpose').name('Show Rest Pose');

    // pendulum
    const pendulumFolder = gui.addFolder('Pendulum');
    pendulumFolder.add(params, 'mass', 0, 5, 0.1).name('Mass');
    pendulumFolder.add(params, 'stiffness', 0, 5, 0.1).name('Spring Stiffness');
    pendulumFolder.add(params, 'step', 0, 5, 0.001).name('Step Size');
    pendulumFolder.add(params, 'radius', 5, 100, 5).name('Radius');
    pendulumFolder.add(params, 'solverType', utils.enumOptions(SolverTypes)).name('Solver');
    pendulumFolder.add(params, 'double').name('Double pendulum');
    pendulumFolder.add(params, 'reset').name('Reset');

    // if (params.exercise === Exercise.LBS) {
    //     lbsFolder.open();
    //     pendulumFolder.hide();
    // } else if (params.exercise === Exercise.pendulum) {
    //     pendulumFolder.open();
    //     lbsFolder.hide();
    // }

    const updateExercise = () => {
        if (params.exercise === Exercise.LBS) {
            lbsFolder.show();
            lbsFolder.open();
            pendulumFolder.hide();
        } else if (params.exercise === Exercise.pendulum) {
            pendulumFolder.show();
            pendulumFolder.open();
            lbsFolder.hide();
        }
    }

    updateExercise();

    exController.onChange(updateExercise);

    return gui;
}

export function setupCamera(camera: THREE.PerspectiveCamera) {
    // https://threejs.org/docs/#api/cameras/PerspectiveCamera
    camera.near = 0.01;
    camera.far = 1000;
    camera.fov = 75;
    camera.position.z = 200;
    camera.position.y = 100;
    camera.updateProjectionMatrix()
    return camera
}

export function getElephant() {
    const loader = new OBJLoader();
    const mesh = loader.parse(elephant).children[0] as THREE.Mesh;
    mesh.material = new THREE.MeshNormalMaterial;
    return mesh;
}

export function getBox(size: number = 10) {
    const boxGeometry = new THREE.BoxGeometry(size, size, size);
    const box = new THREE.Mesh(boxGeometry, new THREE.MeshNormalMaterial);

    return box;
}

export function getSphere(size: number = 5) {
    const sphereGeometry = new THREE.SphereGeometry(size, 32, 16);
    const sphere = new THREE.Mesh(sphereGeometry, new THREE.MeshNormalMaterial);

    return sphere;
}

export function getLine(length: number = 2) {
    const points = [];
    for (let i = 0; i < length; i++) {
        points.push(new THREE.Vector3(0, i, 0));
    }

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({
        color: 0x000000,
        linewidth: 5
    }));

    return line;
}
