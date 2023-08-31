#include <stdio.h>
#include <string.h>
#include <unistd.h>

#include "hash_table.h"
#include "neighbour.h"
#include "packet.h"
#include "requests.h"
#include "server.h"
#include "util.h"
#include <errno.h>

#define UNUSED(x) (void)(x)

// actual underlying hash table
htable **ht = NULL;
rtable **rt = NULL;

// Initialize Fingertable
typedef struct ftable {
    size_t key;
    peer* value;
    UT_hash_handle hh; // implementation specific
} ftable;

ftable **ft = NULL;

size_t m = 16; //waehlen m=16, da hash_id vom typ uint16_t ist und somit werte von 0 bis (2^16-1) halten kann
                //ausserdem hat die DHT insgesamt 2^m = 2^16 = 65536 ID's

// chord peers
peer *self = NULL;
peer *pred = NULL;
peer *succ = NULL;

/**
 * @brief Forward a packet to a peer.
 *
 * @param peer The peer to forward the request to
 * @param pack The packet to forward
 * @return int The status of the sending procedure
 */
int forward(peer *p, packet *pack) {
    // check whether we can connect to the peer
    if (peer_connect(p) != 0) {
        fprintf(stderr, "Failed to connect to peer %s:%d\n", p->hostname,
                p->port);
        return -1;
    }

    size_t data_len;
    unsigned char *raw = packet_serialize(pack, &data_len);
    int status = sendall(p->socket, raw, data_len);
    free(raw);
    raw = NULL;

    peer_disconnect(p);
    return status;
}

/**
 * @brief Forward a request to the successor.
 *
 * @param srv The server
 * @param csocket The scokent of the client
 * @param p The packet to forward
 * @param n The peer to forward to
 * @return int The callback status
 */
int proxy_request(server *srv, int csocket, packet *p, peer *n) {
    UNUSED(srv);
    // check whether we can connect to the peer
    if (peer_connect(n) != 0) {
        fprintf(stderr,
                "Could not connect to peer %s:%d to proxy request for client!",
                n->hostname, n->port);
        return CB_REMOVE_CLIENT;
    }

    size_t data_len;
    unsigned char *raw = packet_serialize(p, &data_len);
    sendall(n->socket, raw, data_len);
    free(raw);
    raw = NULL;

    size_t rsp_len = 0;
    unsigned char *rsp = recvall(n->socket, &rsp_len);

    // Just pipe everything through unfiltered. Yolo!
    sendall(csocket, rsp, rsp_len);
    free(rsp);

    return CB_REMOVE_CLIENT;
}

/**
 * @brief Lookup the peer responsible for a hash_id.
 *
 * @param hash_id The hash to lookup
 * @return int The callback status
 */
int lookup_peer(uint32_t nodeIP, uint16_t nodePort, uint16_t nodeID, uint16_t hash_id) {

    // build a new packet for the lookup 
    packet *lkp = packet_new();
    lkp->flags = PKT_FLAG_CTRL | PKT_FLAG_LKUP;
    lkp->hash_id = hash_id;
    lkp->node_id = nodeID;
    lkp->node_port = nodePort;
    lkp->node_ip = nodeIP;

    //if fingertable not empty, use it for lookup
    if(HASH_COUNT(*ft) > 0) {
        size_t min = 1<<m; //2^m
        size_t corr, dist;
        ftable* current;
        ftable* tmp;
        HASH_ITER(hh, *ft, current, tmp) {
            if(current->key < hash_id) {
                dist = hash_id - current->key;
            }
            else if(current->key > hash_id) {
                dist = hash_id + (1<<m) - current->key;
            }
            if(0 < dist && dist < min) {
                min = dist;
                corr = current->key;
            }
        }
        ftable* correct;
        HASH_FIND(hh, *ft, &corr, sizeof(size_t), correct);
        if(correct != NULL) {
            fprintf(stderr, "[!]Match found in my Fingertable!\n[!]Forwarding Lookup(%u) to Node %u!\n",hash_id, correct->value->node_id);
            forward(correct->value, lkp);
            free(lkp);
            return 0;
        }
    }

    forward(succ, lkp);
    free(lkp);
    return 0;
}

/**
 * @brief Handle a client request we are resonspible for.
 *
 * @param c The client
 * @param p The packet
 * @return int The callback status
 */
int handle_own_request(server* srv, client *c, packet *p) {
    UNUSED(srv);
    // build a new packet for the request
    packet *rsp = packet_new();

    if (p->flags & PKT_FLAG_GET) {
        // this is a GET request
        htable *entry = htable_get(ht, p->key, p->key_len);
        if (entry != NULL) {
            rsp->flags = PKT_FLAG_GET | PKT_FLAG_ACK;

            rsp->key = (unsigned char *)malloc(entry->key_len);
            rsp->key_len = entry->key_len;
            memcpy(rsp->key, entry->key, entry->key_len);

            rsp->value = (unsigned char *)malloc(entry->value_len);
            rsp->value_len = entry->value_len;
            memcpy(rsp->value, entry->value, entry->value_len);
        } else {
            rsp->flags = PKT_FLAG_GET;
            rsp->key = (unsigned char *)malloc(p->key_len);
            rsp->key_len = p->key_len;
            memcpy(rsp->key, p->key, p->key_len);
        }
    } else if (p->flags & PKT_FLAG_SET) {
        // this is a SET request
        rsp->flags = PKT_FLAG_SET | PKT_FLAG_ACK;
        htable_set(ht, p->key, p->key_len, p->value, p->value_len);
    } else if (p->flags & PKT_FLAG_DEL) {
        // this is a DELETE request
        int status = htable_delete(ht, p->key, p->key_len);

        if (status == 0) {
            rsp->flags = PKT_FLAG_DEL | PKT_FLAG_ACK;
        } else {
            rsp->flags = PKT_FLAG_DEL;
        }
    } else {
        // send some default data
        rsp->flags = p->flags | PKT_FLAG_ACK;
        rsp->key = (unsigned char *)strdup("Rick Astley");
        rsp->key_len = strlen((char *)rsp->key);
        rsp->value = (unsigned char *)strdup("Never Gonna Give You Up!\n");
        rsp->value_len = strlen((char *)rsp->value);
    }

    size_t data_len;
    unsigned char *raw = packet_serialize(rsp, &data_len);
    free(rsp);
    sendall(c->socket, raw, data_len);
    free(raw);
    raw = NULL;

    return CB_REMOVE_CLIENT;
}

/**
 * @brief Answer a lookup request from a peer.
 *
 * @param p The packet
 * @param n The peer
 * @return int The callback status
 */
int answer_lookup(packet *p, peer *n) {
    peer *questioner = peer_from_packet(p);

    // check whether we can connect to the peer
    if (peer_connect(questioner) != 0) {
        fprintf(stderr, "Could not connect to questioner of lookup at %s:%d\n!",
                questioner->hostname, questioner->port);
        peer_free(questioner);
        return CB_REMOVE_CLIENT;
    }

    // build a new packet for the response
    packet *rsp = packet_new();
    rsp->flags = PKT_FLAG_CTRL | PKT_FLAG_RPLY;
    rsp->hash_id = p->hash_id; //key
    rsp->node_id = n->node_id; //value
    rsp->node_port = n->port;
    rsp->node_ip = peer_get_ip(n);

    // Finger-Reply Packet
    if(p->flags & PKT_FLAG_FNGR) {
        rsp->flags = (rsp->flags) | PKT_FLAG_FNGR;
        fprintf(stderr, "[!]Sending Finger-Reply(%u)!\n", rsp->node_id);
    }

    size_t data_len;
    unsigned char *raw = packet_serialize(rsp, &data_len);
    free(rsp);
    sendall(questioner->socket, raw, data_len);
    free(raw);
    raw = NULL;
    peer_disconnect(questioner);
    peer_free(questioner);
    return CB_REMOVE_CLIENT;
}

/**
 * @brief Handle a key request request from a client.
 *
 * @param srv The server
 * @param c The client
 * @param p The packet
 * @return int The callback status
 */
int handle_packet_data(server *srv, client *c, packet *p) {
    // Hash the key of the <key, value> pair to use for the hash table
    uint16_t hash_id = pseudo_hash(p->key, p->key_len);
    fprintf(stderr, "Hash id: %d\n", hash_id);

    // Forward the packet to the correct peer
    if (peer_is_responsible(pred->node_id, self->node_id, hash_id)) {
        // We are responsible for this key
        fprintf(stderr, "We are responsible.\n");
        return handle_own_request(srv, c, p);
    } else if (peer_is_responsible(self->node_id, succ->node_id, hash_id)) {
        // Our successor is responsible for this key
        fprintf(stderr, "Successor's business.\n");
        return proxy_request(srv, c->socket, p, succ);
    } else {
        // We need to find the peer responsible for this key
        fprintf(stderr, "No idea! Just looking it up!.\n");
        add_request(rt, hash_id, c->socket, p);
        lookup_peer(peer_get_ip(self), self->port, self->node_id, hash_id);
        return CB_OK;
    }
}

/**
 * @brief Handle a control packet from another peer.
 * Lookup vs. Proxy Reply
 *
 * @param srv The server
 * @param c The client
 * @param p The packet
 * @return int The callback status
 */
int handle_packet_ctrl(server *srv, client *c, packet *p) {

    fprintf(stderr, "Handling control packet...\n");

    if (p->flags & PKT_FLAG_LKUP) {
        // we received a lookup request
        if (peer_is_responsible(pred->node_id, self->node_id, p->hash_id)) {
            // Our business
            //fprintf(stderr, "Lol! This should not happen!\n");
            return answer_lookup(p, self);
        } else if (peer_is_responsible(self->node_id, succ->node_id,
                                       p->hash_id)) {
            return answer_lookup(p, succ);
        } else if(p->flags & PKT_FLAG_FNGR) {
            // Only need this for finger lookups 
            forward(succ, p);
        }
        else {
            lookup_peer(p->node_ip, p->node_port, p->node_id, p->hash_id);
        }
    } else if (p->flags & PKT_FLAG_RPLY) {
        // Finger-Reply Packet
        if(p->flags & PKT_FLAG_FNGR) {
            size_t key = p->hash_id;
            ftable *res;
            fprintf(stderr, "[!]Received Finger-Reply!\n");
            HASH_FIND(hh, *ft, &key, sizeof(size_t), res);
            if (res != NULL) {
                free(res->value);
                res->value = (peer*)malloc(sizeof(peer));
                res->value = peer_from_packet(p);
                res->value->node_id = p->node_id;
                fprintf(stderr, "[!]Refreshed Finger-Entry(%lu->%u)!\n", key, res->value->node_id);
            } else {
                ftable *new = malloc(sizeof(ftable));
                memset(new, 0, sizeof(ftable));
                new->key = key;
                new->value = (peer*)malloc(sizeof(peer));
                new->value = peer_from_packet(p);
                new->value->node_id = p->node_id;
                HASH_ADD(hh, *ft, key, sizeof(size_t), new);
                fprintf(stderr, "[!]Added Finger-Entry(%lu->%u)!\n", key, new->value->node_id);
            }
            fprintf(stderr, "[!]Current Finger-Table:\n");
            ftable* current;
            ftable* tmp;
            HASH_ITER(hh, *ft, current, tmp) {
                fprintf(stderr, "(%lu:%u)\n", current->key, current->value->node_id);
            }
        }
        else {
            // Look for open requests and proxy them
            peer *n = peer_from_packet(p);
            for (request *r = get_requests(rt, p->hash_id); r != NULL;
             r = r->next) {
            proxy_request(srv, r->socket, r->packet, n);
            server_close_socket(srv, r->socket);
        }
        clear_requests(rt, p->hash_id);
        }
    } else {
        // Stabilize Packet
        if(p->flags & PKT_FLAG_STAB) { 
            fprintf(stderr, "[!]Received a Stabilize() from Node %u!\n", p->node_id);
            if(pred == NULL) {
                pred = peer_from_packet(p);
                pred->node_id = p->node_id; 
            }
            if(succ == NULL) {
                fprintf(stderr, "[!]Self = %u, Succ = NULL, Pred = %u\n",self->node_id, pred->node_id);
            }
            else {
                fprintf(stderr, "[!]Self = %u, Succ = %u, Pred = %u\n",self->node_id, succ->node_id, pred->node_id);
            }
            // Send Notify Packet with Predecessor ID
            packet* notify = packet_new();
            notify->flags = PKT_FLAG_CTRL | PKT_FLAG_NTFY;
            notify->node_id = pred->node_id; 
            notify->node_port = pred->port;
            notify->node_ip = peer_get_ip(pred);
            fprintf(stderr, "[!]Sending back Notify(%u)!\n", notify->node_id);
            // Slightly different way of sending back the notify because the tests require it
            size_t data_len;
            unsigned char *raw = packet_serialize(notify, &data_len);
            sendall(c->socket, raw, data_len);
            free(raw);
            raw = NULL;
        }
        // Notify Packet
        else if(p->flags & PKT_FLAG_NTFY) {
            fprintf(stderr, "[!]Received Notify(%u)\n", p->node_id);
            if(succ == NULL) {
                succ = peer_from_packet(p); 
                succ->node_id = p->node_id;
                srv->succ = succ;
            }
            // ID is inbetween Self and Successor
            if(p->node_id != succ->node_id && peer_is_responsible(self->node_id, succ->node_id, p->node_id)) {
                if(succ != NULL) {
                    peer_free(succ);
                    succ = NULL;
                }
                succ = peer_from_packet(p);
                succ->node_id = p->node_id; 
                srv->succ = succ;

                packet* stab = packet_new();
                stab->flags = PKT_FLAG_CTRL | PKT_FLAG_STAB;
                stab->node_id = self->node_id;
                stab->node_port = self->port;
                stab->node_ip = peer_get_ip(self);

                if (peer_connect(succ) != 0) {
                    fprintf(stderr, "Failed to connect to peer %s:%d\n", srv->succ->hostname, srv->succ->port);
                }
                size_t data_len;
                unsigned char *raw = packet_serialize(stab, &data_len);
                sendall(succ->socket, raw, data_len);
                free(raw);
                raw = NULL;
                peer_disconnect(succ);
                fprintf(stderr, "[!]Stabilize() sent to %u\n", succ->node_id);
            }

            if(pred == NULL) {
                fprintf(stderr, "[!]Self = %u, Succ = %u, Pred = NULL\n",self->node_id, succ->node_id);
            }
            else {
                fprintf(stderr, "[!]Self = %u, Succ = %u, Pred = %u\n",self->node_id, succ->node_id, pred->node_id);
            }
        }
        // Join Packet
        else if(p->flags & PKT_FLAG_JOIN) {

            // I'm alone in the DHT and therefore responsible 
            if(pred == NULL && succ == NULL) {
                fprintf(stderr, "[!]Oh. Someone(%u) wants to join my lonely self!\n", p->node_id);

                succ = peer_from_packet(p);
                succ->node_id = p->node_id; 
                srv->succ = succ;

                pred = peer_from_packet(p);
                pred->node_id = p->node_id;
                
                fprintf(stderr, "[!]Self = %u, Succ = %u, Pred = %u\n",self->node_id, succ->node_id, pred->node_id);

                // Create Notify Packet
                packet* notify = packet_new();
                notify->flags = PKT_FLAG_CTRL | PKT_FLAG_NTFY;
                notify->node_id = self->node_id;
                notify->node_port = self->port;
                notify->node_ip = peer_get_ip(self);

                // Create Stabilize Packet
                packet* stab = packet_dup(notify);
                stab->flags = PKT_FLAG_CTRL | PKT_FLAG_STAB;

                // Send Notify Packet and Stabilize Packet
                fprintf(stderr, "[!]Sending back Notify(%u) and Stabilize()!\n", notify->node_id);

                if (peer_connect(succ) != 0) {
                    fprintf(stderr, "Failed to connect to peer %s:%d\n", srv->succ->hostname, srv->succ->port);
                }
                size_t data_len;
                unsigned char *raw = packet_serialize(notify, &data_len);
                sendall(succ->socket, raw, data_len);
                free(raw);
                raw = NULL;
                raw = packet_serialize(stab, &data_len);
                sendall(succ->socket, raw, data_len);
                free(raw);
                raw = NULL;
                peer_disconnect(succ);

                //forward(peer_from_packet(p), notify);
                free(notify);
                free(stab);
                // Leave the DHT some time to integrate the new Node 
                sleep(1);
            }
            // I am responsible
            else if(peer_is_responsible(pred->node_id, self->node_id, p->node_id)) {
                fprintf(stderr, "[!]Handling Join(%u) Request!\n", p->node_id);

                // Joining Node
                peer* joiner = peer_from_packet(p);
                joiner->node_id = p->node_id;

                if(pred != NULL) {
                    // Send Notify to current Predecessor
                    packet* notify = packet_new();
                    notify->flags = PKT_FLAG_CTRL | PKT_FLAG_NTFY;
                    notify->node_id = joiner->node_id;
                    notify->node_port = joiner->port;
                    notify->node_ip = peer_get_ip(joiner);
                    fprintf(stderr, "[!]Sending Notify(%u) to Node %u!\n", notify->node_id, pred->node_id);
                    forward(pred, notify);
                    free(notify);

                    peer_free(pred);
                    pred = NULL;
                }
                pred = joiner;

                if(pred != NULL && succ != NULL) {
                    fprintf(stderr, "[!]Self = %u, Succ = %u, Pred = %u\n",self->node_id, succ->node_id, pred->node_id);
                }

                // Create Notify Packet
                packet* notify = packet_new();
                notify->flags = PKT_FLAG_CTRL | PKT_FLAG_NTFY;
                notify->node_id = self->node_id;
                notify->node_port = self->port;
                notify->node_ip = peer_get_ip(self);

                // Send Notify Packet
                fprintf(stderr, "[!]Sending Notify(%u) to Node %u!\n", notify->node_id, p->node_id);
                forward(peer_from_packet(p), notify);
                free(notify);
                // Leave the DHT some time to integrate the new Node 
                sleep(1);
            }
            // Not me! Maybe my successor.
            else {
                fprintf(stderr, "[!]Forwarding Join(%u) Request to Successor!\n", p->node_id);
                sleep(1);
                forward(succ, p);
            }
        }
        // Finger Packet 
        else if(p->flags & PKT_FLAG_FNGR) {
            fprintf(stderr, "[!]Received Finger Packet!\n");
            //DHT has more than two nodes
            if( !((pred == NULL && succ == NULL) || (pred->node_id == succ->node_id)) ) {
                fprintf(stderr, "[!]Building Finger Table...\n");
                for(size_t i = 0; i < m; i++) {
                    //Create Key (selfID + 2^i) mod 2^m
                    size_t key = (self->node_id + (1<<i)) % (1<<m); 
                    //Send Finger-Lookup Packet
                    packet *lkp = packet_new();
                    lkp->flags = (PKT_FLAG_CTRL | PKT_FLAG_LKUP) | PKT_FLAG_FNGR;
                    lkp->hash_id = key;
                    lkp->node_id = self->node_id;
                    lkp->node_port = self->port;
                    lkp->node_ip = peer_get_ip(self);
                    forward(succ, lkp);
                }
            }

            //Send Finger-Acknowledge Packet
            packet* fack = packet_dup(p);
            fack->flags = (fack->flags) | PKT_FLAG_FACK;
            size_t data_len;
            unsigned char *raw = packet_serialize(fack, &data_len);
            free(fack);
            sendall(c->socket, raw, data_len);
            free(raw);
            raw = NULL;
        }
    }
    return CB_REMOVE_CLIENT;
}

/**
 * @brief Handle a received packet.
 * This can be a key request received from a client or a control packet from
 * another peer.
 *
 * @param srv The server instance
 * @param c The client instance
 * @param p The packet instance
 * @return int The callback status
 */
int handle_packet(server *srv, client *c, packet *p) {
    if (p->flags & PKT_FLAG_CTRL) {
        return handle_packet_ctrl(srv, c, p);
    } else {
        return handle_packet_data(srv, c, p);
    }
}

/**
 * @brief Main entry for a peer of the chord ring.
 * @param argc The number of arguments
 * @param argv The arguments
 * @return int The exit code
 */
int main(int argc, char **argv) {

    // Optional arguments in square brackets
    if (argc < 3) {
        fprintf(stderr, "Not enough args! I need IP Port [ID] [Peer-IP Peer-Port]\n");
    }

    // Read arguments for self
    char *hostSelf = argv[1];
    char *portSelf = argv[2];

    // If an ID was given to us
    if(argc == 4 || argc > 5) {
        uint16_t idSelf = strtoul(argv[3], NULL, 10);
        self = peer_init(
        idSelf, hostSelf,
        portSelf);
    }
    // If no ID was given to us
    else {
        self = peer_init(
        0, hostSelf,
        portSelf);
    }
    // Initialize outer server for communication with clients
    server *srv = server_setup(hostSelf, portSelf);
    if (srv == NULL) {
        fprintf(stderr, "Server setup failed!\n");
        return -1;
    }
    listen(srv->socket, 10);
    // Initialize hash table
    ht = (htable **)malloc(sizeof(htable *));
    // Initialize request table
    rt = (rtable **)malloc(sizeof(rtable *));
    *ht = NULL;
    *rt = NULL;

    //Initialize finger table and assign srv->self
    ft = (ftable **)malloc(sizeof(ftable *));
    *ft = NULL;

    srv->self = self;
    srv->packet_cb = handle_packet;
    fprintf(stderr, "[!]Self = %u, Succ = NULL, Pred = NULL\n", self->node_id);

    // Send Join to known node
    if(argc > 4) {
        packet* join = packet_new();
        join->flags = PKT_FLAG_CTRL | PKT_FLAG_JOIN;
        join->node_ip = peer_get_ip(self);
        join->node_port = self->port;
        join->node_id = self->node_id; 
        
        if(argc == 5) {
            peer* tmp = peer_init(1 , argv[3], argv[4]); 
            fprintf(stderr, "[!]Joining Peer at %s:%u\n", tmp->hostname, tmp->port);
            server_run(srv, join, tmp);
            peer_free(tmp);
            free(join);
        }
        else if(argc == 6) {
            peer* tmp = peer_init(1 , argv[4], argv[5]); 
            fprintf(stderr, "[!]Joining Peer at %s:%u\n", tmp->hostname, tmp->port);
            server_run(srv, join, tmp);
            peer_free(tmp);
            free(join);
        }
    }
    else {
        fprintf(stderr, "[!]I don't know anyone. Starting new DHT!\n");
        server_run(srv, NULL, NULL);
    }

    close(srv->socket);
}