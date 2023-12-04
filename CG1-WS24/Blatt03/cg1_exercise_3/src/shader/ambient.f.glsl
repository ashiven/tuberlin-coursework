precision highp float;

uniform vec3 ambientColor;
uniform float ambientReflectance;

out vec4 fragColor;

void main() {
    vec3 ambient = ambientReflectance * ambientColor;
    fragColor = vec4(ambient, 1.0);
}