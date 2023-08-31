#ifndef PRIO_QUEUE_H
#define PRIO_QUEUE_H
#include "../Tasks/Task.h"

typedef struct PrioQueue PrioQueue;
typedef struct pq_elem pq_elem;
PrioQueue* prio_queue_new();
pq_elem* pq_elem_new(Task *newTask, double prio);
void prio_queue_free(PrioQueue *queue);
void prio_queue_offer(PrioQueue *queue, pq_elem *newElem);
Task* prio_queue_peek(PrioQueue *queue);
Task* prio_queue_poll(PrioQueue *queue);
int prio_queue_size(PrioQueue *queue);
void prio_queue_print(PrioQueue *queue);
#endif
