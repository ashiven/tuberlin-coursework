uniform mat4 modelViewMatrix;
uniform mat3 normalMatrix;
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;

in vec3 position;
in vec3 normal;

out vec3 fragNormal;

void main() {
    fragNormal = normalize(transpose(inverse(mat3(modelMatrix))) * normal);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
