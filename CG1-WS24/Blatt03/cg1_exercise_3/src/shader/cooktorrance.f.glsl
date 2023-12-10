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
	float cos_theta_half = max(dot(normalDirection, halfwayDirection), 0.0);
	float tan_theta_half = tan(acos(cos_theta_half)); 

	float alpha_squared = roughness * roughness;
	float factor_left = PI * pow(cos_theta_half, 4.0);
	float factor_right = pow(alpha_squared + tan_theta_half * tan_theta_half, 2.0);

	float D = alpha_squared / ( factor_left * factor_right );


	// G: Smiths Masking Function
	float cos_theta_view = max(dot(viewDirection, halfwayDirection), 0.0);
	float cos_theta_light = max(dot(lightDirection, halfwayDirection), 0.0);
	float tan_theta_view = tan(acos(cos_theta_view));
	float tan_theta_light = tan(acos(cos_theta_light));

	float G_1 = 2.0 / (1.0 + sqrt(1.0 + alpha_squared * tan_theta_view * tan_theta_view)); 
	float G_2 = 2.0 / (1.0 + sqrt(1.0 + alpha_squared * tan_theta_light * tan_theta_light));

	G_1 = max(G_1, 0.0);
	G_2 = max(G_2, 0.0);

	float G = G_1 * G_2;


	// F: Schlicks Approximation
	float F0 = 0.8;

	factor_left = (1.0 - F0);
	factor_right = pow(1.0 - cos_theta_view, 5.0);
	
	float F = F0 + factor_left * factor_right;


	// Final DGF Term
	float cos_theta_normal_light = max(dot(normalDirection, lightDirection), 0.0);
	float cos_theta_normal_view = max(dot(normalDirection, viewDirection), 0.0);
	float specularReflectance = (D * G * F) / (4.0 * cos_theta_normal_light * cos_theta_normal_view);

	float specularTerm = (diffuseReflectance / PI + specularReflectance) * cos_theta_normal_light * lightIntensity;
	
	fragColor = vec4(specularTerm * specularColor * lightColor, 1.0);
}