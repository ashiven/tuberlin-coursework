#include "../Tasks/Task.h"

typedef struct Stack Stack;
typedef struct s_elem s_elem;
/**
 * Creates an empty stack.
 *
 * returns: an empty stack.
 */
Stack* stack_new();
/**
 * Creates a new stack element.
 * name: the elements name
 *
 * returns the new element
 */
s_elem* s_elem_new(Task* newTask);

/**
 * Deletes the stack and frees all allocated memory.
 */
void stack_free(Stack *stack);

/*
 * Inserts an element to the stack and sets its index.
 *
 * newElem: new element to be inserted
 *
 * returns : the name of the element or NULL when an error occurred.
 */
Task* stack_push(Stack *stack, s_elem* newElem);

/**
 * Retrieves the top element from the stack.
 *
 * returns: the name or NULL if stack is empty..
 */
Task* stack_peek(Stack *stack);

/**
 * Retrieves and REMOVES the top element from the stack.
 * Memory for the name should be allocated in the function.
 * Returns the name (or NULL if stack is empty) using the **name argument.
 */
Task* stack_pop(Stack *stack);
/**
 * The current size of the stack.
 *
 * returns: the current size of the stack (number of elements)
 */
int stack_size(Stack *stack);

/**
 * Prints the current elements on the stack to stdout.
 *
 * The elements get printed in the following form:
 *
 * (<index>,<name>)
 * (<index>,<name>)
 * (<index>,<name>) ...
 *
 * with the head of the stack as first element.
 */
