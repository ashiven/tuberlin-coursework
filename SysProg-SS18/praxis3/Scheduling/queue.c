#include "queue.h"
#include "../Tasks/Task.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Source: modified stack, Algorithmen und Datenstrukturen Folien SoSe18 TU Berlin
struct q_elem 
{
    struct q_elem *next; // next element in queue
    Task *task; // Task at this element of the queue
};

struct Queue{
    int size;
    q_elem *root; 
};



Queue *queue_new()
{
    Queue *buffer = malloc(sizeof(Queue));
	if (buffer == NULL){
		printf("Memory could not be allocated (buffer allocation failed).\n");
        exit(-1);
	}	
	// Initially everything is set to 0.
	memset(buffer, 0, sizeof(*buffer));
	// New head initialized to NULL Pointer:
	buffer->root = NULL;
	// This is a new stack hence size = 0
	buffer->size = 0;

	return buffer; // Return the pointer of the new queue 
}

q_elem* q_elem_new(Task *newTask)
{
    q_elem *new_element;
    new_element = malloc(sizeof(q_elem));
    if (new_element == NULL){
        exit(-1);
    }
	// Set next to NULL:
	new_element->next = NULL;
    // Set task:
    new_element->task = newTask;	
	return new_element;
}

void queue_free(Queue *queue){
    q_elem *delete;
	q_elem *current;

	current = queue->root;

	while(current != NULL){
		delete = current;
		current = current->next;

		free(delete);
	}
	free(queue);
}

void queue_add(Queue *queue, q_elem *newElem) {
    newElem->next = NULL; // already done while init...
    q_elem *current;

    if(queue->root != NULL) {
        current = queue->root;

        while(current->next != NULL) {
            current = current->next;
        }

        current->next = newElem;
    }
    else {
        queue->root = newElem;
    }
    queue->size += 1;
}

Task* queue_peek(Queue *queue){
	// If there exists an element in the queue:
	if (NULL != queue->root){
		return (queue->root->task);
	}
	else{ // There is no existing element in this queue:
		return NULL;
	}
}
    
Task* queue_poll(Queue *queue) {
    Task *poll;
    q_elem *tmp;
    if(queue->root == NULL) {
        return NULL;
    }

    poll = queue->root->task;
    tmp = queue->root;
    queue->root = queue->root->next;
    queue->size = queue->size -1;
    free(tmp);

    return poll;
}

int queue_size(Queue *queue){
    return queue->size;
}
