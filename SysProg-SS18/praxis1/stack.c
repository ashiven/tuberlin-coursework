#include "stack.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX 50
#define PRINT 1

struct Stack //
{
	int size;
	s_elem *head;	
};

/* Beginning of assignment -------------------------------------------------------------------------- */
struct s_elem 	
{
	char name [MAX];
	int index;
	s_elem *predecessor;

};

Stack* stack_new()
{		
	/* 
	* Pointer for allocating  
	* Allocate memory of size of Stack
	*/
	Stack *buffer = (Stack *) malloc(sizeof(Stack)); 

	if (buffer == NULL){
		printf("Memory could not be allocated (buffer allocation failed).\n");
	}	
	// Initially everything is set to 0.
	memset(buffer, 0, sizeof(*buffer));
	// New head initialized to NULL Pointer:
	buffer->head = NULL;
	// This is a new stack hence size = 0
	buffer->size = 0;

	return buffer; // Return the pointer of the new Stack (Stored in stack-variable in main.c)
}

s_elem* s_elem_new(char* name)
{	
	s_elem *new_element; 
	new_element = (s_elem *) malloc(sizeof(s_elem)); 

	if (NULL != new_element){
		// Set name:
		strcpy(new_element->name, name);
		// Set predecessor to NULL:
		new_element->predecessor = NULL;
	}
	else{
		printf("Memory could not be allocated for new element.");
		exit(-1);
	}	
	return new_element;
}

void stack_free(Stack *stack)
{
	s_elem *delete;
	s_elem *current;

	current = stack->head;

	while(current != NULL){
		delete = current;
		current = current->predecessor;

		free(delete);
	}

	free(stack);
	return;
}

char* stack_push(Stack *stack, s_elem* newElem)
{
	// Assuming head = element on top 
	if (stack->head == NULL){
		// Head is not initialized. Lowest element of stack = 1.:
		stack->head = newElem;
		newElem->predecessor = NULL;
		newElem->index = 0;
		if (PRINT == 1)
			printf("Stack was empty. Added: \"%s\". Size of stack: %d.\n\n", newElem->name, stack->size);
	}
	else{ 
		// This is not the first element of the stack
		newElem->predecessor = stack->head;
		stack->head = newElem;
		newElem->index = (newElem->predecessor->index)+1;
		if (PRINT == 1)
			printf("Added: \"%s\". Size of stack: %d.\n\n", newElem->name, stack->size);
	}

	stack->size = (stack->size) + 1;

	return newElem->name;
}

char* stack_peek(Stack *stack)
{
	// If there exists an element on the stack return the name
	if (NULL != stack->head){
		if (PRINT == 1)
			printf("Top element (head) of stack: \"%s\".\n\n", stack->head->name);
		return (stack->head->name);
	}
	else{ 
		// There is no existing element on this stack
		if (PRINT == 1)
			printf("Empty Stack\n");
		return NULL;
	}
}

void stack_pop(Stack *stack, char **name)
{
	// Name is pointer to pointer
	s_elem *pop;
	s_elem *current_top;

	// Current top element:
	current_top = stack->head;

	if (stack->head != NULL){
		// There is atleast one element to pop
		*name = malloc( MAX * sizeof(char));

		pop = current_top;
		strncpy(*name, current_top->name, MAX );

		if (PRINT == 1)
			printf("Popped: \"%s\"\n\n", *name);

		// Decrease size:
		stack->size = stack->size -1;

		// Set new head
		stack->head = current_top->predecessor; 

		free(pop);	

	}else{
		if (PRINT == 1){
			printf("Empty Stack\n");
		}
		exit(-1);
	}
	
}

int stack_size(Stack *stack){
	if (0 != stack->size){
		return stack->size;
	}
	else{
		if (PRINT == 1){
			printf("Size of non existing Stack could not be retrieved.\n");
		}
		exit(-1);
	}	
}

void stack_print(Stack *stack)
{
 	//TODO
	// https://isis.tu-berlin.de/mod/forum/discuss.php?d=182154 
 	// Prints order as stated in stack.h:
 	s_elem *current = stack->head;

 	while (NULL != current){
 		printf("(%d,%s)\n", current->index, current->name);
 		current = current->predecessor;
 	}
  	return;

}
/* End of assignment -------------------------------------------------------------------------- */
