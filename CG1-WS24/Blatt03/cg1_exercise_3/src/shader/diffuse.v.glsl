uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

in vec3 position;
in vec3 normal;

out vec3 vNormal;
out vec3 vViewPosition;

void main() {
    // normal in camera space
    vNormal = normalize(normalMatrix * normal);

    // position in camera space
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // negative position in camera space
    vViewPosition = -mvPosition.xyz;

    gl_Position = projectionMatrix * mvPosition;
}