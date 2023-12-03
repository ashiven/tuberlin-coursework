uniform vec3 ambientColor;
uniform float ambientReflectance;

void main() {
    vec3 ambient = ambientReflectance * ambientColor;
    gl_FragColor = vec4(ambient, 1.0);
}