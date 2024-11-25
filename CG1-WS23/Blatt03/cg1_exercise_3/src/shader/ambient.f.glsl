precision highp float;

uniform vec3 ambientColor;
uniform float ambientReflectance;

out vec4 fragColor;

void main() {
    fragColor = vec4(ambientColor * ambientReflectance, 1.0);
}