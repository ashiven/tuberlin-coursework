precision highp float;

in vec3 vertexNormal;

out vec4 fragColor;

void main() {
    fragColor = vec4(0.5 * (vertexNormal + 1.0), 1.0);
}
