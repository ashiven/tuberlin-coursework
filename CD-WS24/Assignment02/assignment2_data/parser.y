/* Types that are used in %union should be defined in this code block. */
%code requires {
#include <stdbool.h>
}

/* Everything else can go in this code block. */
%code {
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

extern int line_number;
extern FILE *yyin;
extern int yylex();
static void yyerror(const char *s);

// define a global variable to store the current class name state 
char* current_class = NULL;

// declare arrays of methods and states for each interface
static const char **interface_methods[];
static const char **interface_states[];

// declare functions used for semantic checks
void set_class(char* class_name);
int is_interface_method(char* method_name, char** interface_methods[]);
int allowed_method(char* method_name, char* allowed_methods[]);
int allowed_state(char* state_name, char* allowed_states[]);
int method_allowed_in(char* class_name, char* method_name);
int state_allowed_in(char* class_name, char* state_name);
}

/* Enable verbose error messages. */
%define parse.error verbose

/* Declare type for semantic value. You may need to extend this. */
%union {
    bool bval;
    int ival;
    double fval;
    char *str;
};

/* Declare tokens with semantic values */
%token<bval> BOOL
%token<ival> INT
%token<fval> FLOAT
%token<str> TYPE STATE IDENTIFIER ERROR

/* Declare tokens without semantic values */
%token BREAK CONTINUE DO FOR WHILE SWITCH CASE DEFAULT IF ELSE RETURN STRUCT
%token ATTRIBUTE CONST UNIFORM VARYING BUFFER SHARED COHERENT VOLATILE RESTRICT
%token READONLY WRITEONLY LAYOUT CENTROID FLAT SMOOTH NOPERSPECTIVE PATCH SAMPLE
%token SUBROUTINE IN OUT INOUT INVARIANT PRECISE DISCARD LOWP MEDIUMP HIGHP PRECISION

%token CLASS ILLUMINANCE AMBIENT PUBLIC PRIVATE SCRATCH
%token RT_PRIMITIVE RT_CAMERA RT_MATERIAL RT_TEXTURE RT_LIGHT

%token LEFT_OP RIGHT_OP INC_OP DEC_OP LE_OP GE_OP EQ_OP NE_OP AND_OP OR_OP XOR_OP

%token MUL_ASSIGN DIV_ASSIGN ADD_ASSIGN MOD_ASSIGN LEFT_ASSIGN RIGHT_ASSIGN
%token AND_ASSIGN XOR_ASSIGN OR_ASSIGN SUB_ASSIGN

/* You can specify the type for a production using %type.
 * For example, if "function_header" should have a "str" value, use:
 * %type<str> function_header
 */

%type <str> class_name
%type <str> function_declarator function_header function_definition function_prototype function_header_with_parameters
%type <str> declaration_statement declaration init_declarator_list single_declaration
%type <str> fully_specified_type type_specifier type_specifier_nonarray type_qualifier

/* Start production. */
%start translation_unit

%%


/* ================= EXPRESSION RULES ================= */


variable_identifier
    : IDENTIFIER 
    ;

state_identifier
    : STATE { 
                char* state = strdup($1);
                memmove(state, state + 3, strlen(state)); // remove "rt_" prefix
                if (state_allowed_in(current_class, state) != 0) {
                    fprintf(stderr, "State variable %s not allowed in %s\n", state, current_class);
                }
            }
    ;

primary_expression
    : variable_identifier
    | state_identifier
    | INT
    | FLOAT
    | BOOL
    | '(' expression ')'
    ;

postfix_expression
    : primary_expression
    | postfix_expression '[' integer_expression ']'
    | function_call
    | postfix_expression '.' IDENTIFIER
    | postfix_expression INC_OP
    | postfix_expression DEC_OP
    ;

integer_expression
    : expression
    ;

function_call
    : function_call_or_method
    ;

function_call_or_method
    : function_call_generic
    ;

function_call_generic
    : function_call_header_with_parameters ')'
    | function_call_header_no_parameters ')'
    ;

function_call_header_no_parameters
    : function_call_header
    ;

function_call_header_with_parameters
    : function_call_header assignment_expression
    | function_call_header_with_parameters ',' assignment_expression
    ;

function_call_header
    : function_identifier '('
    ;

function_identifier
    : type_specifier
    | postfix_expression
    ;

unary_expression
    : postfix_expression
    | INC_OP unary_expression 
    | DEC_OP unary_expression 
    | unary_operator unary_expression 
    ;

unary_operator
    : '+' 
    | '-' 
    | '!' 
    | '~'
    ;

multiplicative_expression
    : unary_expression
    | multiplicative_expression '*' unary_expression
    | multiplicative_expression '/' unary_expression
    | multiplicative_expression '%' unary_expression
    ;

additive_expression
    : multiplicative_expression 
    | additive_expression '+' multiplicative_expression 
    | additive_expression '-' multiplicative_expression 
    ;

shift_expression
    : additive_expression 
    | shift_expression LEFT_OP additive_expression
    | shift_expression RIGHT_OP additive_expression
    ;

relational_expression
    : shift_expression
    | relational_expression '<' shift_expression
    | relational_expression '>' shift_expression
    | relational_expression LE_OP shift_expression
    | relational_expression GE_OP shift_expression
    ;

equality_expression
    : relational_expression 
    | equality_expression EQ_OP relational_expression 
    | equality_expression NE_OP relational_expression 
    ;

and_expression
    : equality_expression 
    | and_expression '&' equality_expression
    ;

exclusive_or_expression
    : and_expression 
    | exclusive_or_expression XOR_OP and_expression
    ;

inclusive_or_expression
    : exclusive_or_expression 
    | inclusive_or_expression '|' exclusive_or_expression
    ;

logical_and_expression
    : inclusive_or_expression 
    | logical_and_expression AND_OP inclusive_or_expression 
    ;

logical_or_expression
    : logical_and_expression 
    | logical_or_expression OR_OP logical_and_expression 
    ;

conditional_expression
    : logical_or_expression 
    | logical_or_expression '?' expression ':' assignment_expression 
    ;

assignment_expression
    : conditional_expression
    | unary_expression assignment_operator assignment_expression
    ;

assignment_operator
    : '='
    | MUL_ASSIGN
    | DIV_ASSIGN
    | MOD_ASSIGN
    | ADD_ASSIGN
    | SUB_ASSIGN
    | LEFT_ASSIGN
    | RIGHT_ASSIGN
    | AND_ASSIGN
    | XOR_ASSIGN
    | OR_ASSIGN
    ;

expression
    : assignment_expression
    | expression ',' assignment_expression
    ;

constant_expression
    : conditional_expression
    ;    


/* ================= DECLARATION RULES ================= */


declaration
    : function_prototype ';' { $$ = $1; }
    | init_declarator_list ';' { $$ = $1; }
    | PRECISION precision_qualifier type_specifier ';' { $$ = $3; }
    | type_qualifier IDENTIFIER '{' struct_declaration_list '}' ';' 
    | type_qualifier IDENTIFIER '{' struct_declaration_list '}' IDENTIFIER ';'
    | type_qualifier IDENTIFIER '{' struct_declaration_list '}' IDENTIFIER array_specifier ';'
    | type_qualifier ';' { $$ = $1; }
    | type_qualifier IDENTIFIER ';' { $$ = $2; }
    | type_qualifier IDENTIFIER identifier_list ';' { $$ = $2; }
    ;

identifier_list
    : ',' IDENTIFIER
    | identifier_list ',' IDENTIFIER
    ;

function_prototype
    : function_declarator ')' { $$ = $1; }
    ;

function_declarator
    : function_header { $$ = $1; }
    | function_header_with_parameters { $$ = $1; }
    ;

function_header_with_parameters
    : function_header parameter_declaration
    | function_header_with_parameters ',' parameter_declaration
    ;

function_header
    : fully_specified_type IDENTIFIER '('   { 
                                                $$ = $2; 
                                                if (is_interface_method($2, interface_methods) == 0 && method_allowed_in(current_class, $2) != 0) {
                                                    fprintf(stderr, "Interface method %s() not allowed in %s\n", $2, current_class);
                                                }
                                            }
    ;

parameter_declarator
    : type_specifier IDENTIFIER
    | type_specifier IDENTIFIER array_specifier
    ;

parameter_declaration
    : type_qualifier parameter_declarator
    | parameter_declarator
    | type_qualifier parameter_type_specifier
    | parameter_type_specifier
    ;
    
parameter_type_specifier
    : type_specifier
    ;

init_declarator_list
    : single_declaration { $$ = $1; }
    | init_declarator_list ',' IDENTIFIER
    | init_declarator_list ',' IDENTIFIER array_specifier
    | init_declarator_list ',' IDENTIFIER array_specifier '=' initializer
    | init_declarator_list ',' IDENTIFIER '=' initializer
    ;

single_declaration
    : fully_specified_type
    | fully_specified_type IDENTIFIER   { printf("DECLARATION [%s] , Type: %s\n", $2, $1); }  
    | fully_specified_type IDENTIFIER array_specifier { printf("DECLARATION [%s] , Type: %s\n", $2, $1); }
    | fully_specified_type IDENTIFIER array_specifier '=' initializer { printf("DECLARATION [%s] , Type: %s , Initialized\n", $2, $1); }                                      
    | fully_specified_type IDENTIFIER '=' initializer { printf("DECLARATION [%s] , Type: %s , Initialized\n", $2, $1); }
    | fully_specified_type IDENTIFIER ':' class_name { printf("%s [%s] %s\n",$1, $2, $4); }
    ;


/* ================= TYPE RULES ================= */


fully_specified_type
    : type_specifier { $$ = $1; }
    | type_qualifier type_specifier { $$ = $2; }
    ;

invariant_qualifier
    : INVARIANT
    ;

interpolation_qualifier
    : SMOOTH
    | FLAT
    | NOPERSPECTIVE
    ;

layout_qualifier
    : LAYOUT '(' layout_qualifier_id_list ')'
    ;

layout_qualifier_id_list
    : layout_qualifier_id
    | layout_qualifier_id_list ',' layout_qualifier_id
    ;

layout_qualifier_id
    : IDENTIFIER
    | IDENTIFIER '=' constant_expression
    | SHARED
    ;

precise_qualifier
    : PRECISE
    ;

visibility_qualifier
    : PUBLIC
    | PRIVATE
    ;

type_qualifier
    : single_type_qualifier
    | type_qualifier single_type_qualifier
    ;

single_type_qualifier
    : storage_qualifier
    | layout_qualifier
    | precision_qualifier
    | interpolation_qualifier
    | invariant_qualifier
    | precise_qualifier
    | visibility_qualifier
    ;

storage_qualifier
    : CONST 
    | INOUT
    | IN
    | OUT
    | CENTROID
    | PATCH
    | SAMPLE
    | UNIFORM 
    | BUFFER
    | SHARED
    | COHERENT
    | VOLATILE
    | RESTRICT
    | READONLY
    | WRITEONLY
    | SUBROUTINE 
    ;

type_specifier
    : type_specifier_nonarray { $$ = $1; }
    | type_specifier_nonarray array_specifier { $$ = $1; }
    ;

array_specifier
    : '[' ']'
    | '[' constant_expression ']'
    | array_specifier '[' ']'
    | array_specifier '[' constant_expression ']'
    ;

type_specifier_nonarray
    : TYPE { $$ = $1; }
    | CLASS { $$ = "CLASS"; }
    | struct_specifier { /* skip for now */ }
    ;

precision_qualifier
    : LOWP
    | MEDIUMP
    | HIGHP
    ;

struct_specifier
    : STRUCT IDENTIFIER '{' struct_declaration_list '}' 
    | STRUCT '{' struct_declaration_list '}' 
    ;

struct_declaration_list
    : struct_declaration 
    | struct_declaration_list struct_declaration 
    ;

struct_declaration
    : type_specifier struct_declarator_list ';' 
    | type_qualifier type_specifier struct_declarator_list ';'
    ;

struct_declarator_list
    : struct_declarator 
    | struct_declarator_list ',' struct_declarator 
    ;

struct_declarator
    : IDENTIFIER 
    | IDENTIFIER array_specifier
    ;    

initializer
    : assignment_expression 
    | '{' initializer_list '}'
    | '{' initializer_list ',' '}'
    ;

initializer_list
    : initializer
    | initializer_list ',' initializer
    ;

class_name
    : RT_MATERIAL { $$ = strdup(", Type: material"); set_class("material");}
    | RT_TEXTURE { $$ = strdup(", Type: texture"); set_class("texture");}
    | RT_CAMERA { $$ = strdup(", Type: camera"); set_class("camera");}
    | RT_LIGHT { $$ = strdup(", Type: light"); set_class("light");}
    | RT_PRIMITIVE { $$ = strdup(", Type: primitive"); set_class("primitive");}
    ;


/* ================= STATEMENT RULES ================= */


declaration_statement
    : declaration { $$ = $1;}
    ;

statement
    : compound_statement { printf("COMPOUND_STATEMENT\n"); }
    | simple_statement
    ;

simple_statement
    : declaration_statement { /* printed at single_declaration */ }
    | expression_statement { printf("EXPRESSION_STATEMENT\n"); }
    | selection_statement { /* printed at selection_statement */ }
    | switch_statement 
    | case_label
    | iteration_statement { /* printed at iteration_statement */ }
    | jump_statement { printf("RETURN_STATEMENT\n"); }
    ;

compound_statement
    : '{' '}'
    | '{' statement_list '}'
    ;

statement_no_new_scope
    : compound_statement_no_new_scope { printf("COMPOUND_STATEMENT\n"); }
    | simple_statement
    ;

compound_statement_no_new_scope
    : '{' '}'
    | '{' statement_list '}'
    ;

statement_list
    : statement
    | statement_list statement
    ;

expression_statement
    : ';'
    | expression ';'
    ;

selection_statement
    : IF '(' expression ')' selection_rest_statement
    ;

selection_rest_statement
    : statement ELSE statement { printf("IF_ELSE_STATEMENT\n"); }
    | statement { printf("IF_STATEMENT\n");}
    ;

condition
    : expression
    | fully_specified_type IDENTIFIER '=' initializer
    ;

switch_statement
    : SWITCH '(' expression ')' '{' switch_statement_list '}'
    ;

switch_statement_list
    : /* nothing */
    | statement_list
    ;

case_label
    : CASE expression ':'
    | DEFAULT ':'
    ;

iteration_statement
    : WHILE '(' condition ')' statement_no_new_scope { printf("WHILE_STATEMENT\n"); }
    | DO statement WHILE '(' expression ')' ';' { printf("DO_WHILE_STATEMENT\n"); }
    | FOR '(' for_init_statement for_rest_statement ')' statement_no_new_scope { printf("FOR_STATEMENT\n"); }
    ;

for_init_statement
    : expression_statement
    | declaration_statement
    ;

conditionopt
    : condition
    | /* empty */
    ;

for_rest_statement
    : conditionopt ';'
    | conditionopt ';' expression
    ;

jump_statement
    : CONTINUE ';'
    | BREAK ';'
    | RETURN ';'
    | RETURN expression ';'
    | DISCARD ';'
    ;


/* ================= TOP LEVEL RULES ================= */


translation_unit 
    : external_declaration
    | translation_unit external_declaration
    ;

external_declaration
    : function_definition
    | declaration
    ;

function_definition
    : function_prototype compound_statement_no_new_scope { printf("FUNCTION_DEFINITION [%s]\n", $1); }
    ;

%%

 
/* ================= INTERFACE METHODS ================= */


static const char *camera_methods[] = {
    "constructor",
    "generateRay",
    NULL
};

static const char *primitive_methods[] = {
    "constructor",
    "intersect",
    "computeBounds",
    "computeNormal",
    "computeTextureCoordinates",
    "computeDerivatives",
    "generateSample",
    "samplePDF",
    NULL
};

static const char *texture_methods[] = {
    "constructor",
    "lookup",
    NULL
};

static const char *material_methods[] = {
    "constructor",
    "shade",
    "BSDF",
    "sampleBSDF",
    "evaluatePDF",
    "emission",
    NULL
};

static const char *light_methods[] = {
    "constructor",
    "illumination",
    NULL
};

static const char **interface_methods[] = {
    primitive_methods, camera_methods, material_methods, texture_methods, light_methods, NULL
};


/* ================= INTERFACE STATES ================= */


static const char *camera_states[] = {
    "RayOrigin",
    "RayDirection",
    "InverseRayDirection",
    "Epsilon",
    "HitDistance",
    "ScreenCoord",
    "LensCoord",
    "du",
    "dv",
    "TimeSeed",
    NULL
};

static const char *primitive_states[] = {
    "RayOrigin",
    "RayDirection",
    "InverseRayDirection",
    "Epsilon",
    "HitDistance",
    "BoundMin",
    "BoundMax",
    "GeometricNormal",
    "dPdu",
    "dPdv",
    "ShadingNormal",
    "TextureUV",
    "TextureUVW",
    "dsdu",
    "dsdv",
    "PDF",
    "TimeSeed",
    "HitPoint", // missing in paper
    NULL
};

static const char *texture_states[] = {
    "TextureUV",
    "TextureUVW",
    "TextureColor",
    "FloatTextureValue",
    "du",
    "dv",
    "dsdu",
    "dtdu",
    "dsdv",
    "dtdv",
    "dPdu",
    "dPdv",
    "TimeSeed",
    NULL
};

static const char *material_states[] = {
    "RayOrigin",
    "RayDirection",
    "InverseRayDirection",
    "HitPoint",
    "dPdu",
    "dPdv",
    "LightDirection",
    "LightDistance",
    "LightColor",
    "EmissionColor",
    "BSDFSeed",
    "TimeSeed",
    "PDF",
    "SampleColor",
    "BSDFValue",
    "du",
    "dv",
    "ShadingNormal", // missing in paper
    "HitDistance", // missing in paper
    NULL
};

static const char *light_states[] = {
    "HitPoint",
    "GeometricNormal",
    "ShadingNormal",
    "LightDirection",
    "TimeSeed",
    NULL
};

static const char **interface_states[] = {
    primitive_states, camera_states, material_states, texture_states, light_states
};


/* ================= SEMANTIC CHECK HELPERS ================= */


void set_class(char* class_name) {
    current_class = strdup(class_name);
}

int is_interface_method(char* method_name, char** interface_methods[]) {
    for (int i = 0; interface_methods[i] != NULL; i++) {
        for (int j = 0; interface_methods[i][j] != NULL; j++) {
            if (strcmp(method_name, interface_methods[i][j]) == 0) {
                return 0;
            }
        }        
    }
    return 1;
}

int allowed_method(char* method_name, char* allowed_methods[]) {
    for (int i = 0; allowed_methods[i] != NULL; i++) {
        if (strcmp(method_name, allowed_methods[i]) == 0) {
            return 0;
        }
    }
    return 1;
}

int allowed_state(char* state_name, char* allowed_states[]) {
    for (int i = 0; allowed_states[i] != NULL; i++) {
        if (strcmp(state_name, allowed_states[i]) == 0) {
            return 0;
        }
    }
    return 1;
}

int method_allowed_in(char* class_name, char* method_name) {
    if (strcmp(class_name, "camera") == 0) {
        return allowed_method(method_name, camera_methods);
    } else if (strcmp(class_name, "primitive") == 0) {
        return allowed_method(method_name, primitive_methods);
    } else if (strcmp(class_name, "material") == 0) {
        return allowed_method(method_name, material_methods);
    } else if (strcmp(class_name, "texture") == 0) {
        return allowed_method(method_name, texture_methods);
    } else if (strcmp(class_name, "light") == 0) {
        return allowed_method(method_name, light_methods);
    }
    printf("Invalid class name: %s\n", class_name);
}

int state_allowed_in(char* class_name, char* state_name) {
    if (strcmp(class_name, "camera") == 0) {
        return allowed_state(state_name, camera_states);
    } else if (strcmp(class_name, "primitive") == 0) {
        return allowed_state(state_name, primitive_states);
    } else if (strcmp(class_name, "material") == 0) {
        return allowed_state(state_name, material_states);
    } else if (strcmp(class_name, "texture") == 0) {
        return allowed_state(state_name, texture_states);
    } else if (strcmp(class_name, "light") == 0) {
        return allowed_state(state_name, light_states);
    }
    printf("Invalid class name: %s\n", class_name);
}


/* ================= USER CODE ================= */


static void yyerror(const char *s) {
    fprintf(stderr, "%s on line %d\n", s, line_number);
    exit(-1);
}

int main(int argc, char **argv) {
    if (argc > 1) {
        yyin = fopen(argv[1], "r");
        if (!yyin) {
            printf("File %s not found.\n", argv[1]);
            return 1;
        }
    } else {
        yyin = stdin;
    }
    
    do {
        yyparse();
    } while (!feof(yyin));
    return 1;
}
