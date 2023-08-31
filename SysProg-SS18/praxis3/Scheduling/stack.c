#include "stack.h"
#include "../Tasks/Task.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Source: Hausaufgabenblatt 1
struct Stack //
{
	int size;
	s_elem *head;	// Why is this not initialized with NULL? STRUCT! no init here
};

/* Beginning of assignment -------------------------------------------------------------------------- */
struct s_elem 	
{
	s_elem *predecessor;
    // Tasks are elements:
    Task *task;

};

Stack* stack_new()
{		
	//TODO
	Stack *buffer = malloc(sizeof(Stack)); // Pointer for allocating  
										   // Allocate memory of size of Stack

	if (buffer == NULL){
		printf("Memory could not be allocated (buffer allocation failed).\n");
        exit(-1);
	}	
	// Initially everything is set to 0.
	memset(buffer, 0, sizeof(*buffer));
	// New head initialized to NULL Pointer:
	buffer->head = NULL;
	// This is a new stack hence size = 0
	buffer->size = 0;

	return buffer; // Return the pointer of the new Stack (Stored in stack-variable in main.c)
}

s_elem* s_elem_new(Task *newTask)
{	
	s_elem *new_element; // Memory is not yet allocoated
	new_element = malloc(sizeof(s_elem)); // Memory allocated for new element
    if (new_element == NULL){
        exit(-1);
    }
	// Set predecessor to NULL:
	new_element->predecessor = NULL;
    // Set task:
    new_element->task = newTask;	
	return new_element;
}

void stack_free(Stack *stack)
{
	//TODO
	s_elem *delete;
	s_elem *current;

	current = stack->head;

	while(current != NULL){
		delete = current;
		current = current->predecessor;

		free(delete);

	}
	free(stack);

}

Task* stack_push(Stack *stack, s_elem* newElem)
{
	
	// This is not the first element of the stack
    	
    newElem->predecessor = stack->head;
	stack->head = newElem;
	stack->size = (stack->size) + 1; // -> already dereferenced size, value is incremented

	return newElem->task;
}

Task* stack_peek(Stack *stack)
{
	//TODO
	// If there exists an element on the stack return the name
	if (NULL != stack->head){
		return (stack->head->task);
	}
	else{ // There is no existing element on this stack
		return NULL;
	}
}

Task* stack_pop(Stack *stack)
{
	//TODO
	s_elem *pop;
	s_elem *current_top;
    Task *tmp;

	current_top = stack->head;

	if (stack->head != NULL){
		// There is atleast one element to pop

		pop = current_top;
        // This will probably not work:
        tmp = pop->task;
		// Decrease size:
		stack->size = stack->size -1;

		// Set new head
		stack->head = current_top->predecessor; 

		free(pop);	
        return tmp;
	}else{
        return NULL;	
	}
}

int stack_size(Stack *stack){
	//TODO
	return stack->size;
}

/* End of assignment -------------------------------------------------------------------------- */
