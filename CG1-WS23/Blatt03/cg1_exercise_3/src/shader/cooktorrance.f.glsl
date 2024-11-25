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
	D = cosNormalHalf > 0.0 ? D : 0.0;


	// G: Smiths Masking Function
	float cosViewNormal = max(dot(viewDirection, normalDirection), 0.0);
	float cosLightNormal = max(dot(lightDirection, normalDirection), 0.0);
	float tanViewNormal = tan(acos(cosViewNormal));
	float tanLightNormal = tan(acos(cosLightNormal));

	float G1ViewNormal = 2.0 / (1.0 + sqrt(1.0 + alphaSquared * tanViewNormal * tanViewNormal));
	float G1LightNormal = 2.0 / (1.0 + sqrt(1.0 + alphaSquared * tanLightNormal * tanLightNormal));
	G1ViewNormal = cosViewNormal > 0.0 ? G1ViewNormal : 0.0; 
	G1LightNormal = cosLightNormal > 0.0 ? G1LightNormal : 0.0;

	float G = G1ViewNormal * G1LightNormal;


	// F: Schlicks Approximation
	float cosViewHalf = max(dot(viewDirection, halfwayDirection), 0.0);
	vec3 F0 = specularColor;

	vec3 facLeft = (1.0 - F0);
	float facRight = pow(1.0 - cosViewHalf, 5.0);
	
	vec3 F = F0 + factorLeft * factorRight;


	// Final DGF Term
	float cosNormalLight = max(dot(normalDirection, lightDirection), 0.0);
	float cosNormalView = max(dot(normalDirection, viewDirection), 0.0);
	vec3 specularReflectanceDGF = specularReflectance * (D * G * F) / (4.0 * cosNormalLight * cosNormalView);
	
	
	fragColor = vec4(((diffuseReflectance / PI) * diffuseColor + specularReflectanceDGF) * cosNormalLight * lightIntensity * lightColor, 1.0);
}