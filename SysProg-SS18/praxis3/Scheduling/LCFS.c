#include "LCFS.h"

void schedule_LCFS(const TaskPool *task_pool) 
{   
    //Task on CPU:
    Task *CPU = NULL;
    
    //Tick:
    uint16_t tick = 0;

    // incoming task:
    Task *incoming;

    // Stack of processes:
    Stack *proc_stack;
    
    proc_stack = stack_new();
    //TODO
    // LCFS uses simple stack since there is
    // no preemptive resume each task will 
    // be executed until it is done:
    
    while (!allDone(task_pool)){
    /* Check for incoming task at this tick: */
        incoming = checkArrivals(task_pool, tick);

        if(incoming != NULL){
            // add to stack:
            stack_push(proc_stack, s_elem_new(incoming));
        }
        
        // Check if task could be finished:     
        if (CPU == NULL || isDone(CPU)){
            // select new task: 
            CPU = stack_pop(proc_stack);
        } 
        // 
        // LCFS will exectute till the end of task
        if (execTask(CPU, 1)<0){
           printf("%sERROR:%s No Task selected to be executed.\n", COLOR_RED, COLOR_RESET);
        }

        // If we do more than one tick, incomings will not be checked at each tick... exec_ticks are incremented in Task.c      
        
        tick++;       
    }
    // All tasks scheduled, free used data structure:
    stack_free(proc_stack);
    printf("\n");
}
