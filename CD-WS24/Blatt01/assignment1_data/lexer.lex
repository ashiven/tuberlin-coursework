%option noyywrap noinput nounput
%x IN_COMMENT

%{

#include <stdio.h>
#include <stdbool.h>
#include <string.h>
#include <math.h>


/* ================ SECTION 1 - DECLARATIONS ================ */

// Global variable for the line number
int line_number = 1;

// If we're using bison (2nd assignment), include the generated header.
// Otherwise, manually define a couple of things that bison would usually
// handle for us.
#ifdef FOR_PARSER
# include "parser.h"
#else

// Declare type for semantic value
typedef union {
    bool bval;
    int ival;
    double fval;
    char *str;
} lex_val;
lex_val yylval;

// Declare tokens
#define TOKENS \
 X(BOOL) \
 X(INT) \
 X(FLOAT) \
 X(TYPE) \
 X(STATE) \
 X(IDENTIFIER) \
 X(ERROR) \
 X(BREAK) \
 X(CONTINUE) \
 X(DO) \
 X(FOR) \
 X(WHILE) \
 X(SWITCH) \
 X(CASE) \
 X(DEFAULT) \
 X(IF) \
 X(ELSE) \
 X(RETURN) \
 X(STRUCT) \
 X(ATTRIBUTE) \
 X(CONST) \
 X(UNIFORM) \
 X(VARYING) \
 X(BUFFER) \
 X(SHARED) \
 X(COHERENT) \
 X(VOLATILE) \
 X(RESTRICT) \
 X(READONLY) \
 X(WRITEONLY) \
 X(LAYOUT) \
 X(CENTROID) \
 X(FLAT) \
 X(SMOOTH) \
 X(NOPERSPECTIVE) \
 X(PATCH) \
 X(SAMPLE) \
 X(SUBROUTINE) \
 X(IN) \
 X(OUT) \
 X(INOUT) \
 X(INVARIANT) \
 X(PRECISE) \
 X(DISCARD) \
 X(LOWP) \
 X(MEDIUMP) \
 X(HIGHP) \
 X(PRECISION) \
 X(CLASS) \
 X(ILLUMINANCE) \
 X(AMBIENT) \
 X(PUBLIC) \
 X(PRIVATE) \
 X(SCRATCH) \
 X(RT_PRIMITIVE) \
 X(RT_CAMERA) \
 X(RT_MATERIAL) \
 X(RT_TEXTURE) \
 X(RT_LIGHT) \
 X(LEFT_OP) \
 X(RIGHT_OP) \
 X(INC_OP) \
 X(DEC_OP) \
 X(LE_OP) \
 X(GE_OP) \
 X(EQ_OP) \
 X(NE_OP) \
 X(AND_OP) \
 X(OR_OP) \
 X(XOR_OP) \
 X(MUL_ASSIGN) \
 X(DIV_ASSIGN) \
 X(ADD_ASSIGN) \
 X(MOD_ASSIGN) \
 X(LEFT_ASSIGN) \
 X(RIGHT_ASSIGN) \
 X(AND_ASSIGN) \
 X(XOR_ASSIGN) \
 X(OR_ASSIGN) \
 X(SUB_ASSIGN)

enum {
    _MAXCHAR = 255,
#define X(token) token,
    TOKENS
#undef X
} token;

#endif /* FOR_PARSER */

%}


IDENT [a-zA-Z][a-zA-Z0-9]*

BRACKETS [\[\]\{\}\(\)]

MATH_OP [+-/*]

COMPARISON [<>]

SPACES [ \t\n]+

FLOAT [0-9]+\.[0-9]+

COMMENT [/][*][^*]*[*]+([^*/][^*]*[*]+)*[/]

 /* ================ SECTION 2 - RULES ================ */
%%

{SPACES}                { /* ignore */ }

{COMMENT}               { /* ignore */ }

class                   return CLASS;

public                  return PUBLIC;

if                      return IF;

else                    return ELSE;

rt_Primitive            return RT_PRIMITIVE;

rt_RayOrigin            { yylval.str = "rt_RayOrigin"; return STATE;}

rt_RayDirection         { yylval.str = "rt_RayDirection"; return STATE;}

rt_Epsilon              { yylval.str = "rt_Epsilon"; return STATE;}

rt_GeometricNormal      { yylval.str = "rt_GeometricNormal"; return STATE;}

rt_HitPoint             { yylval.str = "rt_HitPoint"; return STATE;}

rt_BoundMin             { yylval.str = "rt_BoundMin"; return STATE;}

rt_BoundMax             { yylval.str = "rt_BoundMax"; return STATE;}

vec3                    { yylval.str = "vec3"; return TYPE; }

void                    { yylval.str = "void"; return TYPE; }

float                   { yylval.str = "float"; return TYPE; }

{IDENT}                 { yylval.str = strdup(yytext); return IDENTIFIER; }

{BRACKETS}              { return yytext[0]; }

{MATH_OP}               { return yytext[0]; }

{COMPARISON}            { return yytext[0]; }

{FLOAT}                 { yylval.fval = atof(yytext); return FLOAT; }

"="                     { return '='; }

";"                     { return ';'; }

","                     { return ','; }

"."                     { return '.'; }

":"                     { return ':'; }

%%
/* ================ SECTION 3 - USER CODE ================ */

// Generate main code only for standalone compilation,
// but not if we're using bison (2nd assignment)
#ifndef FOR_PARSER
static const char *token_name(int token) {
    switch (token) {
#define X(token) \
        case token: \
            return #token;
TOKENS
#undef X
    }
    return NULL;
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

    int token;
    while ((token = yylex())) {
		printf("Line%3d:    ", line_number);
        if (token < 256) {
            printf("\"%c\"\n", token);
        } else {
            const char *name = token_name(token);
            if (!name) {
                printf("???\n");
            } else {
                switch (token) {
                    default:
                        printf("%s\n", name);
                        break;
                    case BOOL:
                        printf("%s [%s]\n", name, yylval.bval ? "true" : "false");
                        break;
                    case INT:
                        printf("%s [%d]\n", name, yylval.ival);
                        break;
                    case FLOAT:
                        printf("%s [%f]\n", name, yylval.fval);
                        break;
                    case TYPE:
                    case STATE:
                    case IDENTIFIER:
                    case ERROR:
                        printf("%s [%s]\n", name, yylval.str);
                        free(yylval.str);
                        break;
                }
            }
        }
    }

    return 0;
}
#endif /* FOR_PARSER */

