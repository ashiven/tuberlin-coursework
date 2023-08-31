#include "./shell.h"
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>

int main(){
	int bg;
	char ** args;

	while(1){
		/* next shell prompt */
		print_prompt();

		/* wait for input */
		args = parse_cmd(&bg);

		/* if valid input, execute */
		if(args){
			execute_cmd(args,bg);
		}
		else {
			printf("Invalid input\n");
		}

		/* free args */
		free(args);
	}	
}

/* prints a beautiful prompt */ 
void print_prompt(){
	printf("\x1B[31mss2018\x1B[0m@\x1B[34msysprog\x1B[0m: ");
}

/* parse commands and allocates memory for it */
char ** parse_cmd(int * bg){

	/* check for EOF */
	if(feof(stdin))exit(1);

	/* check input */
	if(!fgets(input,input_size,stdin))return NULL;
	if(strlen(input) <= 1)return NULL;

	/* Setting up args, argc and bg*/
	int argc = 1;
	char ** args = NULL;
	*bg = 0;

	/* parsing arguments */
	char * next = strtok(input," \n");

	/* check for unparsable input */
	if(!next)return NULL;

	/* check if exiting */
	if(!strcmp(next,"exit")){
		shell_exit();
	}

	/* parse */
	args = (char**) malloc(sizeof(char**));
	args[0] = next;
	while( (next = strtok(NULL," \n")) ){
		args = (char **)realloc(args,sizeof(char**) * (argc + 1));
		args[argc] = next;
		argc++;
	}

	/* check if meant to be executed in the background */
	if(!strcmp(args[argc - 1],"&") && argc > 1){
		*bg = 1;
		args[argc-1] = NULL;
	}
	/* more space to terminate with null pointer */
	else {
		args = (char **)realloc(args,sizeof(char**) * (argc + 1));
		args[argc] = NULL;
	}

	return args;
}

/* --- Platz für eigene Hilfsfunktionen --- */




/* ---------------------------------------- */

/* execute command
 * char * args[]: (arguments)
 *	Enthält den Dateinamen des Auszuführenden Programmes und die
 *	 dazu übergebenen Argumente
 *	args[0]	      --> Dateiname des Programmes
 *	args[1 bis n] --> Argumente
 *	args[n+1]     --> NULL (Nicht wichtig für die Aufgabe)
 *	Gleicher Aufgbau wie char * args[] in der main Methode üblich ist
 *
 * int bg: (background)
 *	flag ob der Prozess im Hintergrund ausgeführt werden soll oder die Shell
 *	 auf den Prozess warten soll
 *	0       --> Shell soll auf den Prozess warten
 *	nicht 0 --> Prozess soll im Hintergrund ausgeführt werden
 */
void execute_cmd(char * args[], int bg){
         pid_t pid;
	/* Relevant für Aufgabe 2 */
	/* clean up children and check if space available */
	if(update_children() >= children_amount){
		printf("Too many processes already running\n");
		return;
	}

	/* TODO Your code here -- Aufgabe 1 */
	/* Fork a new process:
	 * - After fork() there exist: 1 Parent 1 Child
	 * - child and parent are both at the same count (i.e. "same line")
	 *
	 *
	 * */
         
	if( (pid = fork()) <0){ // Check if fork()<0: error-case 
            // printf("Could not fork a child process");
	    // use perror("Fork failed") instead:
	    perror("Fork Failed");
	    exit(-1); 
	}	
	
	if (pid == 0){
            // This is the child-process:
	    execvp(args[0], args);
	    printf("%s: Program could not be started.\n", args[0]);
	    abort(); // execl never returns in case of success
	    		// abort child-process if this is the case
	}else{
	    // This is a parent process:
	    
	    // Add child to array children (order irrelevant)
	    // free space has already been checked:
	    for (int i=0; i<children_amount; i++){
                if (children[i] == 0){
		    children[i] = pid;
		    // break after child has been stored
		    break;
		}
	    }

	    if (bg == 0){
                // child process executed in foreground
		// wait for child process to terminate:
		waitpid(pid, NULL, 0);
            }else{
                // prevent parent from blocking (necesarry?):
		waitpid(pid, NULL, WNOHANG); 
	    }	    
	    return;	
	}

}



/* Diese Funktion soll alle Child Prozesse die in dem Array "pid_t children[]"
 *  gespeichert sind darauf überprüfen, ob diese noch laufen oder bereits
 *  beendet sind. Wenn ein Prozess beendet wurde soll der Eintrag in dem Array
 *  gelöscht werden, so dass dieser wieder zur Verfügung steht.
 *
 *  return value:
 *   Diese Funktion soll die Anzahl der momentan im Hintergrund laufenden
 *   Prozesse zurückgeben. Prozesse die beendet wurden zählen nicht dazu
 */
int update_children(){

	/* TODO Your code here -- Aufgabe 2 */
        int status_p;
	int count=0;

	for (int i=0; i<children_amount; i++){
	    // Check status of process with pid children[i]
            if (children[i] != 0){ 
                status_p = waitpid(children[i], NULL, WNOHANG);
	        if (status_p != 0){
	            // waitpid returned pid of process --> process terminated
		    // waitpid returned -1 --> error-case
		    // waitpid did not return 0, process not active
	            children[i] = 0;
                }
                // Count existing processes:
	        if (children[i] != 0){
	            count++;
                }
            }		
	}
	
	return count;
}

/* Diese Funktion wird aufgerufen, falls das Stichwort "exit" in der Shell
 *  eingetippt wird. Diese Funktion beendet die Shell, jedoch soll sie zuerst darauf
 *  warten, dass alle Hintergrundprozesse beendet wurden.
 */
void shell_exit(){

	/* TODO Your code here -- Aufgabe 3 */
        // Check if there are still running processes:
	int proc; // Number of remaining processes
	while ((proc=update_children()) != 0){
	    // Assing return value of update_children to proc to prevent from calling
	    // update_children() again (possibly even with a return val of 0)
            printf("Waiting for running processes...\nNumber of remaining processes: %d \n", proc);
	    // Wait for any process(-1) to terminate:
	    waitpid(-1, NULL, 0);
        }
	printf("Shell exiting\n");
	exit(0);
}


