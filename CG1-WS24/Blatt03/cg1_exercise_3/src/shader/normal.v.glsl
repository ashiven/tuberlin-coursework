uniform mat4 modelViewMatrix;
uniform mat3 normalMatrix;
uniform mat4 projectionMatrix;

in vec3 position;
in vec3 normal;

out vec3 fragNormal;

void main() {
    fragNormal = normalMatrix * normal;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
