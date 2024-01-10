precision highp float;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

layout(location = 2) in vec2 uv;
in vec3 position;

out vec2 vUv;

void main() {
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
