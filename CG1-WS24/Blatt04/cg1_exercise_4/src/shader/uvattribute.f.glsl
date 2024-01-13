precision highp float;

uniform sampler2D textureImg;
uniform sampler2D canvasTexture;

in vec2 vUv;

out vec4 fragColor;

void main() {
    vec4 tex = texture(textureImg, vUv);
    vec4 canv = texture(canvasTexture, vUv);
    
    fragColor = mix(tex, canv, canv.a);
}
