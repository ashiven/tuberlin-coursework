
precision highp float;

uniform sampler2D textureImg;

in vec2 vUv;

out vec4 fragColor;

void main() {
    fragColor = texture(textureImg, vUv);
}
