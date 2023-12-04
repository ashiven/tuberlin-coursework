precision highp float;

in vec3 fragNormal;

out vec4 fragColor;

void main() {
    vec3 color = 0.5 * (fragNormal + 1.0); 

    fragColor = vec4(color, 1.0);
}
