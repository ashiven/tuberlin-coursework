precision highp float;

#define PI 3.14159265

uniform sampler2D textureImg;
uniform sampler2D canvasTexture;

in vec3 vPosition;

out vec4 fragColor;

void main() {
    float u = (PI + atan(-vPosition.z, vPosition.x)) / 2.0 * PI;
    float v = atan(sqrt(vPosition.x * vPosition.x + vPosition.z * vPosition.z), -vPosition.y) / PI;

    u = u / 9.85;

    vec2 vUv = vec2(u, v);

    vec4 tex = texture(textureImg, vUv);
    vec4 canv = texture(canvasTexture, vUv);
    
    fragColor = mix(tex, canv, canv.a);
}
