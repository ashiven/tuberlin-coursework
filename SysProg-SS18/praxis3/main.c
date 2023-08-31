#include "Scheduling/Scheduling.h"
#include <stdlib.h>

int main(int argc, char *argv[]) {
    if (argc < 2) {
        printf("Usage: %s <JSON_FILE>\n", argv[0]);
        return 1;
    }

    TaskPool *task_pool;
    uint16_t RR_args, MLF_args;
    task_pool = newTaskPool_JSON(argv[1], 1024, &RR_args, &MLF_args);
    if (task_pool == NULL) {
        return 1;
    }

    printf("Time:   ");
    for (uint16_t i = 0; i < task_pool->total_duration; i++) {
        printf(" %2d|", i);
    }
    printf("\n        ");
    for (uint16_t i = 0; i < task_pool->total_duration; i++) {
        printf("---+");
    }
    printf("\n");

    //NOTE: You can uncomment this line, to see what the ouput should look like.
    //printf("Monkey: ");
    //schedule(task_pool, MONKEY, 0);

    allReset(task_pool);
    printf("LCFS:   ");
    schedule(task_pool, LCFS, 0);

    allReset(task_pool);
    printf("LCFS_PR:    ");
    schedule(task_pool, LCFS_PR, 0);

    allReset(task_pool);
    printf("SRTN:     ");
    schedule(task_pool, SRTN, 0);
    
    allReset(task_pool);
    printf("HRRN:     ");
    schedule(task_pool, HRRN, 0);

    allReset(task_pool);
    printf("MLF:    ");
    schedule(task_pool, MLF, MLF_args);

    freeTaskPool(task_pool);

    return 0;
}
