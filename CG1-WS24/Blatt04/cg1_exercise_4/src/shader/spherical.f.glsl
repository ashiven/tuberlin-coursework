precision highp float;

uniform sampler2D textureImg;

in vec3 vertexPosition;

out vec4 fragColor;

void main() {
    float u = (3.14 + atan(vertexPosition.y, vertexPosition.x)) / 2.0 * 3.14;
    float v = atan(sqrt(vertexPosition.x * vertexPosition.x + vertexPosition.y * vertexPosition.y), vertexPosition.z) / 3.14;

    vec2 vUv = vec2(u, v);

    fragColor = texture(textureImg, vUv);
}
