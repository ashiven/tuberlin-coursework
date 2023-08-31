#include "prio_queue.h"
#include "../Tasks/Task.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
// Modified queue, Source: Algorithmen und Datenstrukturen SoSe18 Tu Berlin Folien
struct pq_elem{
	double priority; // Priority: high value -> low priority
    Task *task; // Task at this queue element. 
	struct pq_elem *next;
};


struct PrioQueue{
	int size;
	pq_elem *root;
};



PrioQueue* prio_queue_new() {

	PrioQueue *buffer = malloc(sizeof(PrioQueue));

	if(buffer == NULL) {
		printf("Memory could not be allocated (buffer allocation failed).\n");
		exit(-1);
	}
    // Initially everything is set to 0.
	memset(buffer, 0, sizeof(*buffer));
	// New head initialized to NULL Pointer:
	buffer->root = NULL;
	// This is a new queue hence size = 0
	buffer->size = 0;

	return buffer; // Return the pointer of the new queue 
}

pq_elem* pq_elem_new(Task *newTask, double prio)
{    
    pq_elem *new_element;
    new_element = malloc(sizeof(pq_elem));
    if (new_element == NULL){
        exit(-1);
    }
	// Set next to NULL:
	new_element->next = NULL;
    // Set task:
    new_element->task = newTask;
    // Set_prio:
    new_element->priority = prio;	
	return new_element;
}

void prio_queue_free(PrioQueue *queue) {
    pq_elem *delete;
	pq_elem *current;

	current = queue->root;

	while(current != NULL){
		delete = current;
		current = current->next;

		free(delete);
	}
	free(queue);
}

	
void prio_queue_offer(PrioQueue *queue, pq_elem *newElem) {

	pq_elem *current;
    // Set current to leading element:
    current = queue->root;
	

    if(queue->size == 0) {
        // Queue empty:
		queue->root = newElem;
	}
	else {
        // Check if new elem is new root: 
		if(current->priority > newElem->priority) {
			newElem->next = current;
			queue->root = newElem;
		}
		else {
		    // walk trough queue and find correct pos:	
            while((current->next != NULL) && (current->next->priority <=newElem->priority)) {
				current = current->next;
			}
            // exit from loop when right pos is found
		    // Fix links:	
            newElem->next = current->next;
			current->next = newElem;
		}
	}
    // Check:
	queue->size += 1;
}

Task* prio_queue_peek(PrioQueue *queue){
	// If there exists an element in the queue:
	if (NULL != queue->root){
		return (queue->root->task);
	}
	return NULL;
}

Task* prio_queue_poll(PrioQueue *queue) {
    Task *poll;
    pq_elem *tmp;
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

int prio_queue_size(PrioQueue *queue) {
    // Check if queue exists:
	if(queue == NULL) {
		printf("Given queue does not exist.");
		return EXIT_FAILURE;
	}
	return queue->size;
}


void prio_queue_print(PrioQueue *queue) {

	pq_elem *current = queue->root;
    // Walk trough queue
	while(current != NULL) {
		printf("(%f, %s) ", current->priority, current->task->name);
		current = current->next;
	}
	printf("\n");
}
