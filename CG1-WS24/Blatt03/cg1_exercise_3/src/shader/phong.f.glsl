precision highp float;

in vec3 fragNormal;
in vec3 vertexPosition; 
in vec3 viewVector;

out vec4 fragColor;

uniform vec3 ambientColor;
uniform float ambientReflectance;
uniform vec3 diffuseColor;
uniform float diffuseReflectance;
uniform vec3 specularColor;
uniform float specularReflectance;

uniform vec3 lightPosition;
uniform float roughness;
uniform float magnitude;


void main() {
  vec3 normalDirection = normalize(fragNormal);
  vec3 lightDirection = normalize(lightPosition - vertexPosition);
  vec3 viewDirection = normalize(viewVector);
  vec3 reflectionDirection = normalize(-lightDirection + 2.0 * dot(normalDirection, lightDirection) * normalDirection);

  float diffuseTerm = diffuseReflectance * max(dot(lightDirection, normalDirection), 0.0);
  float specularTerm = specularReflectance * pow(max(dot(reflectionDirection, viewDirection), 0.0), magnitude);

  fragColor = vec4(ambientReflectance * ambientColor + diffuseTerm * diffuseColor + specularTerm * specularColor, 1.0);
}