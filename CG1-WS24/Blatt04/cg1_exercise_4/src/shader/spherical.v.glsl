
precision highp float;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

in vec2 uv;
in vec3 position;

out vec2 vUv;

void main() {
    float u = (3.14 + atan(position.y, position.x)) / 2.0 * 3.14;
    float v = atan(sqrt(position.x * position.x + position.y * position.y), position.z) / 3.14;

    vUv = vec2(u, v);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
