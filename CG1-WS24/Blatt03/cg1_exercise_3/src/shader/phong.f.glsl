precision highp float;

in vec3 vertexNormal;
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
uniform float lightIntensity;
uniform float roughness;
uniform float magnitude;


void main() {
  vec3 normalDirection = normalize(vertexNormal);
  vec3 lightDirection = normalize(lightPosition - vertexPosition);
  vec3 viewDirection = normalize(viewVector);
  vec3 reflectionDirection = normalize(2.0 * dot(normalDirection, lightDirection) * normalDirection - lightDirection);

  float diffuseTerm = diffuseReflectance * lightIntensity * max(dot(lightDirection, normalDirection), 0.0);
  float specularTerm = specularReflectance * lightIntensity * pow(max(dot(viewDirection, reflectionDirection), 0.0), magnitude);

  fragColor = vec4(ambientReflectance * ambientColor + diffuseTerm * diffuseColor + specularTerm * specularColor, 1.0);
}