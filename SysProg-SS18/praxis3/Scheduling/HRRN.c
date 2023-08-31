#include "HRRN.h"

double priority_calc(Task *task, uint16_t cur_tick);

void schedule_HRRN(const TaskPool *task_pool) 
{
    //Task on CPU:
    Task *CPU = NULL;
    
    //Tick:
    uint16_t tick = 0;

    // incoming task:
    Task *incoming;
    Task *task; // used for refreshing
    // prioque of processes:
    PrioQueue  *proc_queue_cur;
    proc_queue_cur = prio_queue_new();
    // Use queue to allow refreshing:
    Queue *queue_prev;
    queue_prev = queue_new(); 

    double rr;
    
    // Use queue. Incoming process will be exec directly
    while (!allDone(task_pool)){
        /* Check for incoming process:*/
        incoming = checkArrivals(task_pool, tick);
        // Refresh PrioQueue if it exists:
        if (queue_prev != NULL){
            while (queue_size(queue_prev) > 0){
                // Get first element from old queue:
                task = queue_poll(queue_prev);
                // Add element to new queue with new prio:
                rr = priority_calc(task, tick);
                
                prio_queue_offer(proc_queue_cur, pq_elem_new(task, rr));
            }
        }// else this is the first task arriving
        if (incoming != NULL){
            // HRRN is not preemptiv:
            // Add incoming process to prio_queue:
            // calculate prio:
            rr = priority_calc(incoming, tick);
            prio_queue_offer(proc_queue_cur, pq_elem_new(incoming, rr));
            
       }
        // Check if running task finished:
        if (CPU == NULL || isDone(CPU)){
            CPU = prio_queue_poll(proc_queue_cur); 
        }
        if (execTask(CPU, 1)<0){

           printf("%sERROR:%s No Task selected to be executed.\n", COLOR_RED, COLOR_RESET);
        }
        // current procqueue is prev for next tick:
        while(prio_queue_size(proc_queue_cur) > 0){
            // Copy elements:
            queue_add(queue_prev, q_elem_new(prio_queue_poll(proc_queue_cur)));
        } 
        tick++;   
    } 
    // Free used datastructures:
    queue_free(queue_prev);
    prio_queue_free(proc_queue_cur);
    printf("\n");
}

double priority_calc(Task *task, uint16_t cur_tick){
    double wz = (double) cur_tick - (double) task->arrival_tick;
    double bz = (double) task->total_ticks;
    return 1/((wz+bz)/bz);
}
