precision highp float;

uniform sampler2D textureImg;
uniform sampler2D normalMap;

in vec3 vertexNormal;
in vec3 vertexPosition; 
in vec3 viewVector;

out vec4 fragColor;

void main() {
    vec3 ambientColor;
    float ambientReflectance = 0.2;
    vec3 diffuseColor;
    float diffuseReflectance = 1.0;
    vec3 specularColor = vec3(1.0, 1.0, 1.0);
    float specularReflectance = 0.25;

    vec3 lightColor;
    vec3 lightPosition = vec3(2.0, 2.0, 3.0);
    float lightIntensity = 1.0;

    float magnitude = 50.0;

    vec3 normalDirection = normalize(vertexNormal);
    vec3 lightDirection = normalize(lightPosition - vertexPosition);
    vec3 viewDirection = normalize(viewVector);
    vec3 reflectionDirection = normalize(2.0 * dot(normalDirection, lightDirection) * normalDirection - lightDirection);

    float diffuseTerm = diffuseReflectance * lightIntensity * max(dot(lightDirection, normalDirection), 0.0);
    float specularTerm = specularReflectance * lightIntensity * pow(max(dot(viewDirection, reflectionDirection), 0.0), magnitude);

    fragColor = vec4(ambientReflectance * ambientColor + diffuseTerm * diffuseColor * lightColor + specularTerm * specularColor * lightColor, 1.0);
}