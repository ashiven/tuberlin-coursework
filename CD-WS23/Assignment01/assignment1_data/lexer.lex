%option noyywrap noinput nounput
%x IN_COMMENT

%{
/* ================ SECTION 1 - DECLARATIONS ================ */

#include <stdio.h>
#include <stdbool.h>
#include <string.h>
#include <math.h>


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


IDENT [a-zA-Z][a-zA-Z0-9_]*

SPACES [ \t\v\r\f]+

SYMBOLS [\(\)\[\]\{\}\.\,\;\+\-\~\!\*\/\%\<\>\&\^\|\?\:\=]

BOOL true|false

INT [0-9]+|0[xX][0-9a-fA-F]+|0[0-7]+

FLOAT [0-9]+\.[0-9]+|[0-9]+\.|[0-9]+[eE][+-]?[0-9]+|[0-9]+\.[0-9]+[eE][+-]?[0-9]+

COMMENT [/][*][^*]*[*]+([^*/][^*]*[*]+)*[/]

COMMENT_LINE [/][/].*

 /* ================ SECTION 2 - RULES ================ */
%%

\n                      { line_number++; }

{SPACES}                { /* ignore */ }

{COMMENT_LINE}          { /* ignore */ }

{COMMENT}               {   
                            char* comment_string = yytext;
                            int newlines = 0;
                            char *newline_pointer = strchr(comment_string, '\n');
                            while (newline_pointer != NULL) {
                                newlines++;
                                newline_pointer = strchr(newline_pointer + 1, '\n');
                            }
                            line_number += newlines;
                        }



void                    { yylval.str = strdup(yytext); return TYPE; }

bool                    { yylval.str = strdup(yytext); return TYPE; }

int                     { yylval.str = strdup(yytext); return TYPE; }

uint                    { yylval.str = strdup(yytext); return TYPE; }

float                   { yylval.str = strdup(yytext); return TYPE; }

double                  { yylval.str = strdup(yytext); return TYPE; }



vec[2-4]                { yylval.str = strdup(yytext); return TYPE; }

dvec[2-4]               { yylval.str = strdup(yytext); return TYPE; }

bvec[2-4]               { yylval.str = strdup(yytext); return TYPE; }

ivec[2-4]               { yylval.str = strdup(yytext); return TYPE; }



mat[2-4]                { yylval.str = strdup(yytext); return TYPE; }

mat[2-4]x[2-4]          { yylval.str = strdup(yytext); return TYPE; }

dmat[2-4]               { yylval.str = strdup(yytext); return TYPE; }

dmat[2-4]x[2-4]         { yylval.str = strdup(yytext); return TYPE; }



color                   { yylval.str = strdup(yytext); return TYPE; }



break                   return BREAK;

continue                return CONTINUE;

do                      return DO;

for                     return FOR;

while                   return WHILE;

switch                  return SWITCH;

case                    return CASE;

default                 return DEFAULT;

if                      return IF;

else                    return ELSE;

return                  return RETURN;

struct                  return STRUCT;



attribute               return ATTRIBUTE;

const                   return CONST;

uniform                 return UNIFORM;

varying                 return VARYING;

buffer                  return BUFFER;

shared                  return SHARED;

coherent                return COHERENT;

volatile                return VOLATILE;

restrict                return RESTRICT;

readonly                return READONLY;

writeonly               return WRITEONLY;

layout                  return LAYOUT;

centroid                return CENTROID;

flat                    return FLAT;

smooth                  return SMOOTH;

noperspective           return NOPERSPECTIVE;

patch                   return PATCH;

sample                  return SAMPLE;

subroutine              return SUBROUTINE;

in                      return IN;

out                     return OUT;

inout                   return INOUT;

invariant               return INVARIANT;

precise                 return PRECISE;

discard                 return DISCARD;

lowp                    return LOWP;

mediump                 return MEDIUMP;

highp                   return HIGHP;

precision               return PRECISION;



class                   return CLASS;

illuminance             return ILLUMINANCE;

ambient                 return AMBIENT;

public                  return PUBLIC;

private                 return PRIVATE;

scratch                 return SCRATCH;



rt_Primitive            return RT_PRIMITIVE;

rt_Camera               return RT_CAMERA;

rt_Material             return RT_MATERIAL;

rt_Texture              return RT_TEXTURE;

rt_Light                return RT_LIGHT;



rt_[a-zA-Z]+            { yylval.str = strdup(yytext); return STATE;}



"<<"                    return LEFT_OP;

">>"                    return RIGHT_OP;

"++"                    return INC_OP;

"--"                    return DEC_OP;

"<="                    return LE_OP;

">="                    return GE_OP;

"=="                    return EQ_OP;

"!="                    return NE_OP;

"&&"                    return AND_OP;

"||"                    return OR_OP;

"^"                     return XOR_OP;

"*="                    return MUL_ASSIGN;

"/="                    return DIV_ASSIGN;

"+="                    return ADD_ASSIGN;

"%="                    return MOD_ASSIGN;

"<<="                   return LEFT_ASSIGN;

">>="                   return RIGHT_ASSIGN;

"&="                    return AND_ASSIGN;

"^="                    return XOR_ASSIGN;

"|="                    return OR_ASSIGN;

"-="                    return SUB_ASSIGN;



{SYMBOLS}               { return yytext[0]; }

{BOOL}                  { yylval.bval = (strcmp(yytext, "true") == 0); return BOOL; }

{INT}                   { yylval.ival = atoi(yytext); return INT; }

{FLOAT}                 { yylval.fval = atof(yytext); return FLOAT; }

{IDENT}                 { yylval.str = strdup(yytext); return IDENTIFIER; }



.                       { yylval.str = strdup(yytext); return ERROR; }


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