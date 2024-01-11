precision highp float;

#define PI 3.14159265

uniform mat4 projectionMatrix, modelViewMatrix, modelMatrix;

in vec3 position;

out vec2 vUv;

void main() {
    float u = (PI + atan(-position.z, position.x)) / 2.0 * PI;
    float v = atan(sqrt(position.x * position.x + position.z * position.z), -position.y) / PI;

    u = u / 10.0;

    vUv = vec2(u, v);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
