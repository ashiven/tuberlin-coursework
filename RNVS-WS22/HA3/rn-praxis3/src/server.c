#include "server.h"

#include <arpa/inet.h>
#include <netdb.h>
#include <poll.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <unistd.h>
#include <pthread.h>
#include <errno.h>

#include "packet.h"

void server_close_socket(server *srv, int socket) {
    for (client *c = srv->clients; c != NULL; c = c->next) {
        if (c->socket == socket) {
            c->state = REMOVE;
            break;
        }
    }
}

void server_remove_client(server *srv, client *c) {

    if (c == NULL) {
        fprintf(stderr, "Error! Cannot remove NULL from list!\n");
        return;
    }

    client *p;
    client *prev = NULL;
    bool found = false;
    for (p = srv->clients; p != NULL; prev = p, p = p->next) {
        if (p == c) {
            found = true;
            break;
        }
    }

    if (!found) {
        fprintf(stderr, "Error! Client not found in list!\n");
        return;
    }

    if (prev == NULL) {
        srv->clients = p->next;
    } else {
        prev->next = p->next;
    }

    close(p->socket);
    rb_free(c->header_buf);
    rb_free(c->pkt_buf);
    packet_free(c->pack);
    free(p);

    srv->n_clients--;
}

void client_decode_hdr(client *c) {
    c->state = HDR_RECVD;
    unsigned char hdr[PKT_HEADER_LEN];
    rb_read(c->header_buf, hdr, PKT_HEADER_LEN);
    c->pack = packet_decode_hdr(hdr, PKT_HEADER_LEN);

    c->pkt_buf = rb_new(packet_body_size(c->pack));
}

void client_decode_body(client *c) {
    size_t avail = rb_can_read(c->pkt_buf);
    unsigned char buffer[avail];

    rb_read(c->pkt_buf, buffer, avail);
    c->pack = packet_decode_body(c->pack, buffer, avail);

    c->state = IDLE;
    rb_free(c->pkt_buf);
    c->pkt_buf = NULL;
}

void server_deliver_packet(server *srv, client *c) {

    if (srv->packet_cb != NULL) {
        int rsp = srv->packet_cb(srv, c, c->pack);
        if (rsp == CB_REMOVE_CLIENT) {
            server_remove_client(srv, c);
        }
    }
}

void server_add_client(server *srv) {
    // accept connections
    client *new_client = (client *)malloc(sizeof(client));
    new_client->socket =
        accept(srv->socket, (struct sockaddr *)&(new_client->addr),
               &(new_client->addr_len));

    new_client->state = IDLE;
    new_client->header_buf = rb_new(PKT_HEADER_LEN);
    new_client->pkt_buf = NULL;
    new_client->pack = NULL;

    // Append to front
    new_client->next = srv->clients;
    srv->clients = new_client;
    srv->n_clients++;
}

void server_stop(server *srv) {
    fprintf(stderr, "Shutting down server...\n");
    client *c;
    client *next;
    for (c = srv->clients; c != NULL; c = next) {
        next = c->next;
        server_remove_client(srv, c);
    }
}

void* stabilizer(void* arg) {
    struct _server* srv = (struct _server*) arg;
    while(1) {
        if(srv->succ != NULL) {
            packet* stab = packet_new();
            stab->flags = PKT_FLAG_CTRL | PKT_FLAG_STAB;
            stab->node_id = srv->self->node_id;
            stab->node_ip = peer_get_ip(srv->self);
            stab->node_port = srv->self->port;
            //send packet
            if (peer_connect(srv->succ) != 0) {
                fprintf(stderr, "Failed to connect to peer %s:%d\n", srv->succ->hostname, srv->succ->port);
            }
            size_t data_len;
            unsigned char *raw = packet_serialize(stab, &data_len);
            sendall(srv->succ->socket, raw, data_len);
            free(raw);
            raw = NULL;
            peer_disconnect(srv->succ);
            fprintf(stderr, "[!]Stabilize() sent to %u\n", srv->succ->node_id);
            }
        /*else {
            fprintf(stderr, "Stabilize : No Successor!\n");
        }*/
        sleep(2);
    }
    return NULL;
}

void server_run(server *srv, packet* join, peer *tmp) {
    //listen(srv->socket, 10);
    srv->active = true;
    fprintf(stderr, "Starting server. Press any key to exit.\n");

    // Create a thread on which the stabilize packets are sent out every two seconds
    pthread_t thread;
    int status = pthread_create(&thread, NULL, stabilizer, srv);
    if(status != 0) {
        fprintf(stderr, "Failed to create Stabilizing-Thread!");
    }
    // Give the first node some time to start it's server
    // sleep(1);

    if(tmp != NULL) {
        if (peer_connect(tmp) != 0) {
            fprintf(stderr, "Failed to connect to peer %s:%d\n", tmp->hostname, tmp->port);
        }
        size_t data_len;
        unsigned char *raw = packet_serialize(join, &data_len);
        sendall(tmp->socket, raw, data_len);
        free(raw);
        raw = NULL;
        peer_disconnect(tmp);
    }

    struct pollfd *fds = NULL;
    int i, ready;
    while (srv->active) {
        fds = (struct pollfd *)realloc(fds, (srv->n_clients + 2) *
                                                sizeof(struct pollfd));
        memset(fds, 0, (srv->n_clients + 2) * sizeof(struct pollfd));
        fds[0].fd = fileno(stdin);
        fds[0].events = POLLIN;

        fds[1].fd = srv->socket;
        fds[1].events = POLLIN;

        client *c;
        for (i = 2, c = srv->clients; (i < srv->n_clients + 2) && (c != NULL);
             i++, c = c->next) {
            fds[i].fd = c->socket;
            fds[i].events = POLLIN;
        }

        ready = poll(fds, srv->n_clients + 2, 5000);
        if (ready < 0) {
            perror("Poll:");
            break;
        }

        if (ready > 0) {
            if (fds[0].revents == POLLIN) {
                break;
            }

            client *next;
            for (i = 2, c = srv->clients;
                 (i < srv->n_clients + 2) && (c != NULL); i++, c = next) {
                next = c->next;
                if (fds[i].revents == POLLIN) {
                    // receive
                    if (c->state == IDLE) {
                        int bytes_needed = rb_can_write(c->header_buf);
                        unsigned char buffer[bytes_needed];
                        int nbytes = recv(fds[i].fd, buffer, bytes_needed, 0);

                        if (nbytes > 0) {
                            rb_write(c->header_buf, buffer, nbytes);

                            if (rb_can_read(c->header_buf) == PKT_HEADER_LEN) {
                                client_decode_hdr(c);
                            }

                        } else if (nbytes == 0) {
                            char addr[INET6_ADDRSTRLEN];
                            get_ip_str((struct sockaddr *)&(c->addr), addr,
                                       INET6_ADDRSTRLEN);
                            fprintf(stderr, "%s: Connection closed.\n", addr);
                            server_remove_client(srv, c);
                        }
                    } else {
                        int bytes_needed = rb_can_write(c->pkt_buf);
                        unsigned char buffer[bytes_needed];
                        int nbytes = recv(fds[i].fd, buffer, bytes_needed, 0);

                        if (nbytes > 0) {
                            rb_write(c->pkt_buf, buffer, nbytes);
                            if (rb_can_write(c->pkt_buf) == 0) {
                                // FULL PACKET RECEIVED
                                client_decode_body(c);
                                server_deliver_packet(srv, c);
                            }

                        } else if (nbytes == 0) {
                            char addr[INET6_ADDRSTRLEN];
                            get_ip_str((struct sockaddr *)&(c->addr), addr,
                                       INET6_ADDRSTRLEN);
                            fprintf(stderr, "%s: Connection closed.\n", addr);
                            server_remove_client(srv, c);
                        }
                    }
                }
            }

            c = srv->clients;
            while (c != NULL) {
                client *next = c->next;
                if (c->state == REMOVE) {
                    fprintf(stderr, "Connection marked for removal\n");
                    server_remove_client(srv, c);
                }
                c = next;
            }

            if (fds[1].revents == POLLIN) {
                server_add_client(srv);
            }

        } else {
            fprintf(stderr, "Nothing is happening...\n");
        }
    }
    //pthread_cancel(thread);

    free(fds);
    server_stop(srv);
}

server *server_setup(char* host, char *port) {
    struct addrinfo hints;
    struct addrinfo *res;
    struct addrinfo *r;

    int optval = 1;

    memset(&hints, 0, sizeof(struct addrinfo));
    hints.ai_family = AF_UNSPEC;
    hints.ai_flags = AI_PASSIVE;
    hints.ai_socktype = SOCK_STREAM;

    //fprintf(stderr, "[Debug]Errno before getaddrinfo(): %s\n", strerror(errno));
    //fprintf(stderr, "[Debug]Calling getaddrinfo(host=%s, port=%s, &hints, &res)\n",host, port);
    int status = getaddrinfo(host, port, &hints, &res);
    if (status != 0) {
        perror("getaddrinfo");
    }
    //fprintf(stderr, "[Debug]Errno after getaddrinfo(): %s\n", strerror(errno));
    int s = -1;
    for (r = res; r != NULL; r = r->ai_next) {
        //fprintf(stderr, "errno before socket(): %s\n", strerror(errno));
        //fprintf(stderr, "calling socket(r->ai_family=%d, r->ai_socktype=%d, res->ai_protocol=%d\n)", r->ai_family, r->ai_socktype, res->ai_protocol);
        s = socket(r->ai_family, r->ai_socktype, res->ai_protocol);
        if (s < 0) {
            perror("socket");
            return NULL;
        }
        //fprintf(stderr, "errno after socket(): %s\n", strerror(errno));
        setsockopt(s, SOL_SOCKET, SO_REUSEADDR, &optval, sizeof optval);
        //fprintf(stderr, "errno after setsockopt() / before bind(): %s\n", strerror(errno));
        //fprintf(stderr, "calling bind(s=%d, r->ai_addr=%s, r->ai_addrlen)\n", s, r->ai_addr->sa_data);
        status = bind(s, r->ai_addr, r->ai_addrlen);
        if (status < 0) {
            perror("bind");
            close(s);
            continue;
        }
        //fprintf(stderr, "errno after bind(): %s\n", strerror(errno));
        break;
    }
    freeaddrinfo(res);

    if (status < 0) {
        return NULL;
    }

    server *serv = malloc(sizeof(server));
    if (serv == NULL) {
        fprintf(stderr, "Malloc error!\n");
        return NULL;
    }
    serv->succ = NULL;
    serv->self = NULL;
    
    //int optval = 1;
    //setsockopt(s, SOL_SOCKET, SO_REUSEADDR, &optval, sizeof optval);
    serv->socket = s;
    serv->clients = NULL;
    serv->n_clients = 0;
    serv->active = false;
    serv->packet_cb = NULL;
    return serv;
}
