/* Includes --------------------------------------------------------------*/
#include <stdlib.h>
#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>
#include <unistd.h>
#include <errno.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>
#include <arpa/inet.h>
#include <netinet/in.h>
#include <string.h>
#include <sys/wait.h>
#include <signal.h>

/* Defines ---------------------------------------------------------------*/
#define BACKLOG 10
#define MAX_REQUEST_LENGTH 10000
#define MAX_RECEIVE_BUF 10000
#define MAX_FILES 1000
#define MAX_FILE_NAME 256

/* Structures ------------------------------------------------------------*/
typedef struct {
    char *request;
    char *headerEnd;
    int headerLength;
    int contentLength;
} request_t;

typedef struct {
    char name[MAX_FILE_NAME];
    char *content;
    unsigned int contentLength;
} file_t;

typedef enum {
    FILE_CREATED,
    FILE_OVERWRITTEN,
    FILE_NO_SPACE,
    DELETE_NOT_FOUND,
    DELETE_SUCCESSFUL,
} file_statusCodes;

typedef enum {
    METHOD_GET,
    METHOD_PUT,
    METHOD_DELETE,
    METHOD_HEAD,
    METHOD_UNKNOWN,
} http_method;

typedef enum {
    HTTP_OK,
    HTTP_NOT_FOUND,
    HTTP_BAD_REQ,
    HTTP_NOT_IMPL,
    HTTP_CREATED,
    HTTP_NO_CONTENT,
} http_response;


/* Function Prototypes ---------------------------------------------------*/
void startserver(const char *port);
int respond(void);

// http functions
int count_requests(void);
void getRequestsAsArray(request_t *array, int nrOfRequests);
http_method getHTTPMethodByString(char *methodAsString);
int getHTTPContentLengthHeader(char *request);
void sendHTTPResponse(int socket, http_response code , char *payload);
//end http functions

// file functions
int file_searchIndex(char *name);
file_statusCodes file_create(char *name, char *content, unsigned int contentLength);
file_statusCodes file_delete(char *name);
void file_subCreateFile(char *content, unsigned int contentLengthForStr, int index);
// end file functions

/* Global Variables ------------------------------------------------------*/
char recvbuf[MAX_RECEIVE_BUF] = {0};
char *currentRecv = recvbuf;
int slisten;
int client;
file_t files[MAX_FILES];

/* Main Function ---------------------------------------------------------*/
int main(int argc, char** argv) {

    if (argc != 2) {
        printf("Usage: %s <Port> \n" \
                "       where <port> is the port to open the webserver on.\n" \
                "Example: %s 1234\n", argv[0], argv[0]);
        exit(1);
    }

    char *port_number = argv[1];
    startserver(port_number);

    struct sockaddr_in clientinfo;
    int clientinfolen = sizeof(clientinfo);

    memset(&files, 0, sizeof(file_t) * MAX_FILES);
    
    file_create("static/foo", "Foo", strlen("Foo") + 1);
    file_create("static/bar", "Bar", strlen("Bar") + 1);
    file_create("static/baz", "Baz", strlen("Baz") + 1);

    printf("Current Files: %s, %s, %s\n", files[0].name, files[1].name, files[2].name);
    
    while(1)
    {
        printf("waiting for incoming connections...\n");
        client = accept(slisten, (struct sockaddr*)&clientinfo, &clientinfolen);
        if(client != -1) {
            printf("client accepted: %s:%hu\n", inet_ntoa(clientinfo.sin_addr), ntohs(clientinfo.sin_port));
        }
        while(respond() == 0) {}
        close(client);
    }

    return EXIT_SUCCESS;
}


/* Function Definitions --------------------------------------------------*/

// FILE FUNCTIONS START
int file_searchIndex(char *name) {
    printf("File searched: %s\n", name);
    if (strlen(name) == 0) {
        return -1;
    }
    for (int i = 0; i < MAX_FILES; i++) {
        if (strcmp(files[i].name, name) == 0) {
            return i;
        }
    }

    return -1;
}

file_statusCodes file_create(char *name, char* content, unsigned int contentLength) {
    int index = file_searchIndex(name);
    if (index != -1) { // search was successful, file exists already
        // name already exists, does not need to be updated
        file_subCreateFile(content, contentLength + 1, index);
        return FILE_OVERWRITTEN;
    }

    for(int i = 0; i < MAX_FILES; i++) {
        if (strlen(files[i].name) == 0) {
            strcpy(files[i].name, name);
            file_subCreateFile(content, contentLength + 1, i);
            return FILE_CREATED;
        }
    }

    return FILE_NO_SPACE;
}

void file_subCreateFile(char *content, unsigned int contentLengthForStr, int index) {
    files[index].contentLength = contentLengthForStr;
    files[index].content = calloc(contentLengthForStr, sizeof(char));
    memcpy(files[index].content, content, contentLengthForStr - 1);
    files[index].content[contentLengthForStr - 1] = '\0'; // make sure file content is \0 terminated to use str functions
}

file_statusCodes file_delete(char *name) {
    int index = file_searchIndex(name);
    if (index != -1) {
        memset(files[index].name, 0, MAX_FILE_NAME);
        files[index].contentLength = 0;
        free(files[index].content);
        return DELETE_SUCCESSFUL;
    }

    return DELETE_NOT_FOUND;
}
// FILE FUNCTIONS END

int getHTTPContentLengthHeader(char *request) {
    char *startOfHeader = strstr(request, "Content-Length: ");
    if (startOfHeader == NULL) {
        return -1;
    }
    char *startOfNumber = startOfHeader + 16;
    char *endOfHeader = strchr(startOfNumber, '\r');
    if (endOfHeader == NULL) {
        return -1;
    }
    *endOfHeader = '\0';
    int contentLength = strtol(startOfNumber, NULL, 10);
    //printf("ContentLength as decimal: %d, as string: %s\n", contentLength, startOfNumber);
    *endOfHeader = '\r';
    return contentLength;
}

http_method getHTTPMethodByString(char *methodAsString) {
    if (strncmp(methodAsString, "GET", 3) == 0) {
        return METHOD_GET;
    }

    if (strncmp(methodAsString, "PUT", 3) == 0) {
        return METHOD_PUT;
    }

    if (strncmp(methodAsString, "DELETE", 6) == 0) {
        return METHOD_DELETE;
    }
    if (strncmp(methodAsString, "HEAD", 4) == 0) {
        return METHOD_HEAD;
    }

    return METHOD_UNKNOWN;
}

void sendHTTPResponse(int socket, http_response code, char *payload) {
    char msg[2048] = {0};
    switch (code) {
        case HTTP_OK: {
            strcpy(msg, "HTTP/1.1 200 OK\r\n\r\n");
            break;
        }
        case HTTP_NOT_FOUND: {
            strcpy(msg, "HTTP/1.1 404 Not Found\r\n\r\n");
            break;
        }
        case HTTP_BAD_REQ: {
            strcpy(msg, "HTTP/1.1 400 Bad Request\r\n\r\n");
            break;
        }
        case HTTP_NOT_IMPL: {
            strcpy(msg, "HTTP/1.1 501 Not Implemented\r\n\r\n");
            break;
        }
        case HTTP_CREATED: {
            strcpy(msg, "HTTP/1.1 201 Created\r\n\r\n");
            break;
        }
        case HTTP_NO_CONTENT: {
            strcpy(msg, "HTTP/1.1 204 No Content\r\n\r\n");
            break;
        }
        default: {
            return;
        }

    }

    if (payload != NULL) {
        strcat(msg, payload);
    }

    send(socket, msg, strlen(msg), 0);
}

void getRequestsAsArray(request_t *array, int nrOfRequests) {
    char *inputStream = recvbuf;
    
    char *start;
    char *end = inputStream;
    for (int i = 0; i < nrOfRequests; i++) {
        start = end;
        end = strstr(start, "\r\n\r\n");

        array[i].request = start;

        end += 4; // move past double CL-RF token

        array[i].headerEnd = end;

        array[i].headerLength = end - start;

        array[i].contentLength = getHTTPContentLengthHeader(array[i].request);
        if (array[i].contentLength != -1) {
            end += array[i].contentLength;
        }

    }
}

void startserver(const char *port) {

    struct addrinfo hints; 
    struct addrinfo *results;
    struct addrinfo *tmp;

    // initialize hints
    memset(&hints, 0, sizeof hints);
    hints.ai_family = AF_UNSPEC;
    hints.ai_socktype = SOCK_STREAM;
    hints.ai_flags = AI_PASSIVE;

    // get own ip address
    if(getaddrinfo(NULL, port, &hints, &results) != 0) {
        perror("getaddrinfo() failed");
        exit(1);
    }

    const int yes = 1; // option for SO_REUSEADDR set to 1

    // iterate through resulting linked list of getaddrinfo call
    for(tmp = results; tmp != NULL; tmp = tmp->ai_next) {
        if( (slisten = socket(tmp->ai_family, tmp->ai_socktype, tmp->ai_protocol)) == -1) {
            perror("server: socket");
            continue;
        }
        
    
        if( setsockopt(slisten, SOL_SOCKET, SO_REUSEADDR, &yes, sizeof(int)) == -1) {
            perror("setsockopt");
            exit(1);
        }

        if( bind(slisten, tmp->ai_addr, tmp->ai_addrlen) == -1) {
            close(slisten);
            perror("server: bind");
            continue;
        }

        break;
    }

    freeaddrinfo(results);

    if(tmp == NULL) {
        fprintf(stderr, "server: failed to bind\n");
        exit(1);
    }

    if( listen(slisten, BACKLOG) == -1) {
        perror("listen");
        exit(1);
    }

}

int count_requests(void) {

    int count = 0;
    const char *tmp = recvbuf;
    while(tmp = strstr(tmp, "\r\n\r\n")) {
        count++;
        tmp++;
    }

    return count;
}

int respond(void) {
    int resRecv, requests;
    char *method, *path, *version;
    int count = 0;

    int bufDiff = (currentRecv - recvbuf);

    printf("Buf diff: %d\n", bufDiff);

    char tmpBuf[MAX_RECEIVE_BUF];
    memcpy(tmpBuf, currentRecv, MAX_RECEIVE_BUF - bufDiff);

    memset(recvbuf, 0, MAX_RECEIVE_BUF);
    memcpy(recvbuf, tmpBuf,  MAX_RECEIVE_BUF - bufDiff);

    currentRecv = recvbuf + strlen(recvbuf);

    resRecv = recv(client, currentRecv, MAX_RECEIVE_BUF - bufDiff, 0);

    if(resRecv < 0) {
        printf("recv() error");
        return -1;
    }
    else if(resRecv == 0) {
        printf("Client disconnected");
        return 1;
    }
    else {
        printf("Recv Result: %d\n", resRecv);
        //count how many requests were received 
        requests = count_requests();
        //create array of requests
        request_t request_arr[requests];

        printf("Current Buffer: \n%s\n", recvbuf);
        
        getRequestsAsArray(request_arr, requests);


        while(requests > 0) {

            request_t tmpRequest;
            int tmpLength = request_arr[count].contentLength != -1 ? request_arr[count].contentLength : 0;
            int requestLength = request_arr[count].headerLength + tmpLength;

            memcpy(&tmpRequest, &(request_arr[count]), requestLength);
            
            method = strtok(tmpRequest.request, " \t\n");
            if (getHTTPMethodByString(method) == METHOD_UNKNOWN) {
                version = "Not an HTTP Packet";
            } else {
                path = strtok(NULL, " \t");
                version = strtok(NULL, " \t\n");
            }

            if(strncmp( version, "HTTP/1.0", 8) == 0 || strncmp(version, "HTTP/1.1", 8) == 0 ) {
                if(strncmp( path, "/", 1) != 0){
                    sendHTTPResponse(client, HTTP_BAD_REQ, NULL);
                }
                else {
                    char* tmpPath = path;
                    tmpPath++; // go past the initial '/' of the path
                    int index = file_searchIndex(tmpPath);
                    http_method httpMethod = getHTTPMethodByString(method);
                    switch (httpMethod) {
                        case METHOD_GET: {
                            printf("HTTP GET Request\n");
                            
                            if (index != -1) { // file was found -> send file contents
                                sendHTTPResponse(client, HTTP_OK, files[index].content);
                            } else { // file not found, send error code
                                sendHTTPResponse(client, HTTP_NOT_FOUND, NULL);
                            }
                            break;
                        }
                        case METHOD_PUT: {
                            printf("HTTP PUT Request\n");
                            
                            if (request_arr[count].contentLength != -1) {
                                file_statusCodes result = file_create(tmpPath, (request_arr[count].headerEnd), request_arr[count].contentLength);
                                if (result == FILE_CREATED) {
                                    sendHTTPResponse(client, HTTP_CREATED, NULL);
                                }
                                if (result == FILE_OVERWRITTEN) {
                                    sendHTTPResponse(client, HTTP_NO_CONTENT, NULL);
                                }
                            } else {
                                sendHTTPResponse(client, HTTP_BAD_REQ, NULL);
                            }
                            break;
                        }
                        case METHOD_DELETE: {
                            printf("HTTP DELETE Request\n");
                            file_statusCodes result = file_delete(tmpPath);
                            if (result == DELETE_SUCCESSFUL) {
                                sendHTTPResponse(client, HTTP_NO_CONTENT, NULL);
                            } else {
                                sendHTTPResponse(client, HTTP_NOT_FOUND, NULL);
                            }
                            break;
                        }
                        case METHOD_UNKNOWN: {
                            printf("Unknown HTTP Method: %s\n", method);
                            // fall through to default
                        }
                        default: {   
                            sendHTTPResponse(client, HTTP_NOT_IMPL, NULL);
                            break;
                        }
                    }
                    
                }
            }
            else {
                sendHTTPResponse(client, HTTP_BAD_REQ, NULL);
            }

            requests--;
            count++;            
        }

        if (count > 0) {
            count--;
            int conLen = request_arr[count].contentLength;
            printf("con length: %d\n", conLen);
            char *packetEnd = request_arr[count].headerEnd + (conLen == -1 ? 0 : conLen);
            currentRecv = packetEnd;    
        } else {
            currentRecv = recvbuf;
        }



    }
    return 0;
}
