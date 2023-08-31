#include "MLF.h"

void schedule_MLF(const TaskPool *task_pool, uint16_t num_levels) {
    // MLF 
    // Task on CPU:
    Task *CPU = NULL;
    // use array of queues of size num_levels
    Queue *time_slots[num_levels];

    // Incoming task:
    Task *incoming;
    
    uint16_t time_s, slot_cur, tick, duration;
    slot_cur = 0;
    time_s = 1;
    tick = 0;
    duration = 0;

    // Init time_slots:
    for (uint16_t j=0; j<num_levels; j++){
        time_slots[j] = queue_new();
    }
    
    while (!allDone(task_pool)){
        // Check for incoming task:

        incoming = checkArrivals(task_pool, tick);
        // Check if running task could not finish:

        if (CPU != NULL && (duration >= time_s && !isDone(CPU))){
            if (slot_cur == num_levels-1){
                duration = 0;
                // CPU stays the same 
            }
            else{
                // CPU is free again 
                // Put CPU task in queue one timelevel higher:
                queue_add(time_slots[slot_cur+1], q_elem_new(CPU));
                CPU = NULL;
            }
        } 

        if (incoming != NULL){
            // Add to queue in first time-slot:
            queue_add(time_slots[0], q_elem_new(incoming));
        }
        
        // check if time slot is done:
        if (CPU == NULL || isDone(CPU)){
            // Get element of lowest time_slot:
            
            for (uint16_t i=0; i < num_levels; i++){
                if (time_slots[i] != NULL && queue_size(time_slots[i]) != 0){
                    // Found non-empty time slot queue:
                    CPU = queue_poll(time_slots[i]);
                    time_s = pow(2,i);
                    slot_cur = i;
                    break;
                }
            }
            duration = 0;
        }      

        // Chose a task to execute:
        if (execTask(CPU, 1)<0){
           printf("%sERROR:%s No Task selected to be executed.\n", COLOR_RED, COLOR_RESET);
        }    
        duration++;
        tick++;
    }
    // Free used datastructures:
    for (uint16_t k=0; k<num_levels; k++){
        queue_free(time_slots[k]);
    }  
    printf("\n");
}
