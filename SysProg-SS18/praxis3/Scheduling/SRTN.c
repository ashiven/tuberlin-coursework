#include "SRTN.h"

double rt_calc(Task *task);


void schedule_SRTN(const TaskPool *task_pool) 
{   
    // Task on CPU:
    Task *CPU = NULL;
    
    //Tick:
    uint16_t tick = 0;

    // incoming task:
    Task *incoming;
    Task *task;

    // prioque of processes:
    PrioQueue  *proc_queue_cur;
    proc_queue_cur = prio_queue_new();

    // Use queue to allow refreshing:
    Queue *queue_prev;
    queue_prev = queue_new(); 

    double rt;

    while (!allDone(task_pool)){
        // Check for incoming proc:
        incoming = checkArrivals(task_pool, tick);

        // Add to queue for refreshing:
        if (incoming != NULL){
            queue_add(queue_prev, q_elem_new(incoming));
        }

        // Refresh PrioQueue if it exists:
        if (queue_prev != NULL){
            while (queue_size(queue_prev) > 0){
                // Get first element from old queue:
                task = queue_poll(queue_prev);
                // Add element to new queue with new prio:
                rt = rt_calc(task);
                
                prio_queue_offer(proc_queue_cur, pq_elem_new(task, rt));
            }
        }// else this is the first task arriving

        // SRTN is preemptiv:a
        // Use the process of highest prio:
        CPU = prio_queue_poll(proc_queue_cur);

        // Exec the selected task:
        if (execTask(CPU, 1)<0){
           printf("%sERROR:%s No Task selected to be executed.\n", COLOR_RED, COLOR_RESET);
        }

        // current procqueue is prev for next tick:
        while(prio_queue_size(proc_queue_cur) > 0){
            // Copy elements:
            queue_add(queue_prev, q_elem_new(prio_queue_poll(proc_queue_cur)));
        } 
        if (!isDone(CPU)){
            // CPU has unfinished proc add this too:
            // Calc new rt:
            queue_add(queue_prev, q_elem_new(CPU));
        }   
        tick++; 
    }  
    // Free used datastruct:
    queue_free(queue_prev);
    prio_queue_free(proc_queue_cur);
    printf("\n");
}

double rt_calc(Task *task){
    if (isDone(task)){
        printf("Task is already done and should not be in the queue!");
        exit(-1);
    }
    return (task->total_ticks - task->exec_ticks);
}
