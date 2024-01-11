precision highp float;

#define PI 3.14159265

uniform mat4 projectionMatrix, modelViewMatrix, modelMatrix;

in vec3 position;

out vec2 vUv;

void main() {
    float u = (PI + atan(position.x, position.z)) / 2.0 * PI;
    float v = atan(sqrt(position.z * position.z + position.x * position.x), position.y) / PI;

    vUv = vec2(u, v);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
