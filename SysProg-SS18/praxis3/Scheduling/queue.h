#ifndef QUEUE_H
#define QUEUE_H
#include "../Tasks/Task.h"

// Need to be here and not in .c (deref-problem)

typedef struct Queue Queue;
typedef struct q_elem q_elem;

Queue* queue_new();
q_elem* q_elem_new();
void queue_free(Queue *queue);
void queue_add(Queue *queue, q_elem *newElem);
Task* queue_peek(Queue *queue);
Task* queue_poll(Queue *queue);
int queue_size(Queue *queue);
#endif 
