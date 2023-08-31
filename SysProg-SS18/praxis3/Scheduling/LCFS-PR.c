#include "LCFS-PR.h"

void schedule_LCFS_PR(const TaskPool *task_pool) 
{    //Task on CPU:
    Task *CPU = NULL;
    
    //Tick:
    uint16_t tick = 0;

    // incoming task:
    Task *incoming;

    // Stack of processes:
    Queue  *proc_queue;
    
    proc_queue = queue_new();
    
    // Use queue. Incoming process will be exec directly
    while (!allDone(task_pool)){
    /* Check for incoming task at this tick: */
        incoming = checkArrivals(task_pool, tick);

        if(incoming != NULL){
            // If there is already a process running, add to queue:
            if (CPU!=NULL){
                // There is already a running task
                // Add this task to the queue:
                queue_add(proc_queue, q_elem_new(CPU));
            }
            CPU = incoming;
        }
        else{
            // No task arrived:
            if (isDone(CPU)){
                // give new task to CPU
                CPU = queue_poll(proc_queue);
            }
            // else CPU remains at task
        }        

        if (execTask(CPU, 1)<0){
           printf("%sERROR:%s No Task selected to be executed.\n", COLOR_RED, COLOR_RESET);
        }
       
        tick++;       
    }
    // Free queue:
    queue_free(proc_queue);
    printf("\n");
}

