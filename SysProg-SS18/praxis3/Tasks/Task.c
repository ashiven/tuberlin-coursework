#include "Task.h"
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>

#define SIGNAL_EXEC_ONE_TICK    SIGUSR1
#define SIGNAL_ACKNOWLEDGE      SIGUSR2
#define SIGNAL_COMMIT_SUICIDE   SIGQUIT

// GLOBAL SIGNAL SET
sigset_t global_signal_set;

// Sends a signal to the callee specified in to_ID
void
sendSignal(const pthread_t to_ID, const int sig) {
    pthread_kill(to_ID, sig);
}

// Blocks the callee until Signal is recv'ed
int
recvSignal() {
    int sig;
    sigwait(&global_signal_set, &sig);

    return sig;
}

//-----------------------------------------

void
*mock_task(void *arg) {
    Task *task = (Task *) arg;
    int sig;

    while (1) {
        sig = recvSignal();

        if (sig == SIGNAL_COMMIT_SUICIDE) {
            if (!isDone(task)) {
                printf("%s%s: Killed before done... %s\n", task->color, task->name, COLOR_RESET);
            }
            break;
        }
        if (sig == SIGNAL_EXEC_ONE_TICK) {
            printf(" ");
            printTask(task);
            printf(" |");
            fflush(stdout);
#ifndef NO_FANCY
            usleep(100000);
#endif
            task->exec_ticks++;
        }

        sendSignal(task->scheduler_id, SIGNAL_ACKNOWLEDGE);
    }

    return NULL;
}

//-----------------------------------------

void
__initialize() {
    sigemptyset(&global_signal_set);
    sigaddset(&global_signal_set, SIGNAL_EXEC_ONE_TICK);
    sigaddset(&global_signal_set, SIGNAL_ACKNOWLEDGE);
    sigaddset(&global_signal_set, SIGNAL_COMMIT_SUICIDE);

    pthread_sigmask(SIG_BLOCK, &global_signal_set, NULL);
}

Task *
newTask(const char *name, const uint16_t total_ticks, const uint16_t arrival_tick, const char *color) {
    if (!sigismember(&global_signal_set, SIGNAL_ACKNOWLEDGE)) {
        __initialize();
    }
    Task *new_task;

    new_task = (Task *) malloc(sizeof(Task));

    strncpy(new_task->name, name, MAX_NAME_LEN);
    strncpy(new_task->color, color, MAX_COLOR_LEN);
    new_task->exec_ticks = 0;
    new_task->total_ticks = total_ticks;
    new_task->arrival_tick = arrival_tick;
    new_task->scheduler_id = pthread_self();

    pthread_create(&(new_task->thread_id), NULL, mock_task, new_task);

    return new_task;
}

bool
freeTask(Task *task) {
    if (task == NULL) return FAILURE;

    sendSignal(task->thread_id, SIGNAL_COMMIT_SUICIDE);

    pthread_join(task->thread_id, NULL);
    free(task);

    return SUCCESS;
}

int16_t
execTask(const Task *task, const uint16_t duration) {
    if (task == NULL) {
        return -1;
    }

    uint16_t tick;
    for (tick = 0; tick < duration && !isDone(task); tick++) {
        sendSignal(task->thread_id, SIGNAL_EXEC_ONE_TICK);

        //Block until task is done.
        recvSignal();
    }

    return tick;
}

bool
isDone(const Task *task) {
    if (task == NULL) return true;

    if (task->exec_ticks >= task->total_ticks) {
        return true;
    }
    return false;
}

void
printTask(const Task *task) {
    if (task == NULL) {
        printf("0");
        return;
    }

#ifndef NO_FANCY
    printf("%s%s%s", task->color, task->name, COLOR_RESET);
#else
    printf("%s", task->name);
#endif

    fflush(stdout);

}
