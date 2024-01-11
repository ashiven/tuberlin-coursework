precision highp float;

#define PI 3.14159265

uniform sampler2D textureImg;

in vec3 vPosition;

out vec4 fragColor;

void main() {
    float u = (PI + atan(vPosition.x, vPosition.z)) / 2.0 * PI;
    float v = atan(sqrt(vPosition.z * vPosition.z + vPosition.x * vPosition.x), -vPosition.y) / PI;

    u = u / 10.0;

    vec2 vUv = vec2(u, v);

    fragColor = texture(textureImg, vUv);
}
