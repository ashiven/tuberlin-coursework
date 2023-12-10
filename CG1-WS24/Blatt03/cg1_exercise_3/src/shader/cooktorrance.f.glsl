precision highp float;

#define PI 3.14159265

uniform vec3 ambientColor;
uniform float ambientReflectance;
uniform vec3 diffuseColor;
uniform float diffuseReflectance;
uniform vec3 specularColor;
uniform float specularReflectance;

uniform float roughness;
uniform vec3 lightPosition;
uniform vec3 lightColor;
uniform float lightIntensity;

in vec3 vertexNormal;
in vec3 vertexPosition; 
in vec3 viewVector;

out vec4 fragColor;

void main()
{
    vec3 normalDirection = normalize(vertexNormal);
	vec3 lightDirection = normalize(lightPosition - vertexPosition);
	vec3 viewDirection = normalize(viewVector);
    vec3 halfwayDirection = normalize(viewDirection + lightDirection);


	// D: GGX Distribution
	float cosNormalHalf = max(dot(normalDirection, halfwayDirection), 0.0);
	float tanNormalHalf = tan(acos(cosNormalHalf)); 

	float alphaSquared = roughness * roughness;
	float factorLeft = PI * pow(cosNormalHalf, 4.0);
	float factorRight = pow(alphaSquared + tanNormalHalf * tanNormalHalf, 2.0);

	float D = alphaSquared / ( factorLeft * factorRight );


	// G: Smiths Masking Function
	float cosViewHalf = max(dot(viewDirection, halfwayDirection), 0.0);
	float cosLightHalf = max(dot(lightDirection, halfwayDirection), 0.0);
	float tanViewHalf = tan(acos(cosViewHalf));
	float tanLightHalf = tan(acos(cosLightHalf));

	float G1 = 2.0 / (1.0 + sqrt(1.0 + alphaSquared * tanViewHalf * tanViewHalf)); 
	float G2 = 2.0 / (1.0 + sqrt(1.0 + alphaSquared * tanLightHalf * tanLightHalf));

	G1 = max(G1, 0.0);
	G2 = max(G2, 0.0);

	float G = G1 * G2;


	// F: Schlicks Approximation
	float F0 = 0.8;

	factorLeft = (1.0 - F0);
	factorRight = pow(1.0 - cosViewHalf, 5.0);
	
	float F = F0 + factorLeft * factorRight;


	// Final DGF Term
	float cosNormalLight = max(dot(normalDirection, lightDirection), 0.0);
	float cosNormalView = max(dot(normalDirection, viewDirection), 0.0);
	float specularReflectanceDGF = specularReflectance * (D * G * F) / (4.0 * cosNormalLight * cosNormalView);

	float specularTerm = specularReflectanceDGF * cosNormalLight * lightIntensity;
	float diffuseTerm = ( diffuseReflectance / PI ) * cosNormalLight * lightIntensity;
	
	fragColor = vec4(diffuseTerm * diffuseColor * lightColor + specularTerm * specularColor * lightColor, 1.0);
}