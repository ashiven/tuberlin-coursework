#include <stdio.h>
#include <string.h>
#include <unistd.h>

#include "hash_table.h"
#include "neighbour.h"
#include "packet.h"
#include "requests.h"
#include "server.h"
#include "util.h"

// actual underlying hash table
htable **ht = NULL;
rtable **rt = NULL;

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
    //takes a package and forwards it to peer p
    //returns 0 if sent succesfully otherwise returns -1
    size_t buf_len;
    packet *new_pack;
    int send_res;
    //connect to (p->hostname::p->port) and save socket descriptor in p->socket
    int con_res = peer_connect(p); 
    if(con_res == 0) {
        new_pack = packet_dup(pack); 
        unsigned char* tmp = packet_serialize(new_pack, &buf_len);
        packet_free(new_pack);
        send_res = sendall(p->socket, tmp, buf_len);
        if(send_res != -1) {
            peer_disconnect(p);
            return 0;
        }
        peer_disconnect(p);
        return -1;
    }
    else {
        if(p->socket != -1) {
            close(p->socket);
            p->socket = -1;
        }
        return -1;
    }
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
    //we convert csocket and p into the proper request-package represented by it and send that package to n
    //in other words we create a package that will be handled by handle_own_request implemented on node n
    //have to make sure that the response to that packet will be sent to csocket instead of us
    peer_connect(n);
    //send the packet to the responsible node
    packet *new_pack = packet_dup(p);

    size_t buf_len;
    unsigned char *tmp = packet_serialize(new_pack, &buf_len); 
    
    //fprintf(stderr,"Proxying the following packet:\n");
    //packet *snd = packet_decode(tmp, buf_len);
    //fprintf(stderr, "%d,%s,%d,%s,%d\n",snd->flags,snd->key,snd->key_len,snd->value,snd->value_len);
    
    packet_free(new_pack);
    sendall(n->socket, tmp, buf_len);
    free(tmp);
    //receive their response
    size_t rsp_len;
    unsigned char *rsp = recvall(n->socket, &rsp_len);
    
    //fprintf(stderr, "Got response from proxy server:\n");
    //packet *resp = packet_decode(rsp, rsp_len);
    //fprintf(stderr, "%d,%s,%d,%s,%d\n",resp->flags,resp->key,resp->key_len,resp->value,resp->value_len);
    
    peer_disconnect(n);
    //forward the response to the client
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
int lookup_peer(uint16_t hash_id) {
    //sends a lookup package to our succesor 
    //eventually once the right node is found it will send a reply back to us via answer_lookup()
    packet* pack = packet_new();
    pack->flags = ((0 | PKT_FLAG_CTRL) | PKT_FLAG_LKUP);
    pack->node_ip = peer_get_ip(self);
    pack->node_port = self->port;
    pack->hash_id = hash_id;
    pack->node_id = self->node_id;
    return forward(succ, pack);
}

/**
 * @brief Handle a client request we are resonspible for.
 *
 * @param srv The server
 * @param c The client
 * @param p The packet
 * @return int The callback status
 */
int handle_own_request(server *srv, client *c, packet *p) { 
     
    //fprintf(stderr,"Handling the following packet:\n");
    packet *pack = packet_new();
    pack->flags = p->flags;
    pack->key_len = p->key_len;
    pack->value_len = p->value_len;
    if(p->key_len > 0) {
        pack->key = (unsigned char*)malloc(p->key_len);
        memcpy(pack->key, p->key, p->key_len);
    }
    if(p->value_len > 0) {
        pack->value = (unsigned char*)malloc(p->value_len);
        memcpy(pack->value, p->value, p->value_len);
    }

    //fprintf(stderr, "%d,%s,%d,%s,%d\n",pack->flags,pack->key,pack->key_len,pack->value,pack->value_len);

    size_t pkt_size;
    unsigned char *pkt;
    //DEL Instruction
    if(pack->flags & PKT_FLAG_DEL) {  
        int del_res = htable_delete(ht, pack->key, pack->key_len);
        if(del_res == 0) { 
            packet* del_pack = packet_new();
            del_pack->flags = ((0 | PKT_FLAG_ACK) | PKT_FLAG_DEL);
            del_pack->key = (unsigned char *)malloc(pack->key_len);
            memcpy(del_pack->key, pack->key, pack->key_len);
            del_pack->key_len = pack->key_len;
            pkt = packet_serialize(del_pack, &pkt_size); //marshall the package
            packet_free(del_pack);
            sendall(c->socket, pkt, pkt_size); //send marshalled package to client
        }
        //if operation was unsuccesful just send back the packet without an ACK flag
        else {
            packet *dup_pack = packet_dup(pack);
            pkt = packet_serialize(dup_pack, &pkt_size); 
            packet_free(dup_pack);
            sendall(c->socket, pkt, pkt_size);
        }
    }
    //SET Instruction
    if(p->flags & PKT_FLAG_SET) {  
        htable_set(ht, pack->key, pack->key_len, pack->value, pack->value_len);
        packet* set_pack = packet_new();
        set_pack->flags = ((0 | PKT_FLAG_ACK) | PKT_FLAG_SET); 
        set_pack->key = (unsigned char *)malloc(pack->key_len);
        memcpy(set_pack->key, pack->key, pack->key_len);
        set_pack->key_len = pack->key_len; 
        pkt = packet_serialize(set_pack, &pkt_size); 
        packet_free(set_pack);
        sendall(c->socket, pkt, pkt_size);
    }
    //GET Instruction
    if(p->flags & PKT_FLAG_GET) {  
        htable *result = htable_get(ht, pack->key, pack->key_len); 
        if(result != NULL) {
            packet* get_pack = packet_new();
            get_pack->flags = ((0 | PKT_FLAG_ACK) | PKT_FLAG_GET);
            get_pack->key = (unsigned char *)malloc(pack->key_len);
            memcpy(get_pack->key, pack->key, pack->key_len);  
            get_pack->key_len = pack->key_len;    
            get_pack->value = (unsigned char *)malloc(result->value_len);
            memcpy(get_pack->value, result->value, result->value_len);
            get_pack->value_len = result->value_len;
            pkt = packet_serialize(get_pack, &pkt_size); 
            packet_free(get_pack);
            sendall(c->socket, pkt, pkt_size);
        }
        else {
            packet *dup_pack = packet_dup(pack);
            free(dup_pack->value);
            dup_pack->value = NULL;
            dup_pack->value_len = 0;
            pkt = packet_serialize(dup_pack, &pkt_size); 
            packet_free(dup_pack);
            sendall(c->socket, pkt, pkt_size);
        }
    }
    //Invalid Instruction 
    else { 
        packet *dup_pack = packet_dup(pack);
        pkt = packet_serialize(dup_pack, &pkt_size); 
        packet_free(dup_pack);
        sendall(c->socket, pkt, pkt_size);
    }
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
    //n is the node responsible for the looked up key, therefore we extract the node information out of p
    //then we send a respond packet back to the node specified in p
    //this will trigger the open request on (node specified in p) to be handled 
    //and proxied over to node n, which is the one thats responsible for handling the request
    packet* pack = packet_new();
    pack->flags = ((0 | PKT_FLAG_CTRL) | PKT_FLAG_RPLY); 
    pack->node_ip = peer_get_ip(n); 
    pack->node_port = n->port;
    pack->hash_id = p->hash_id;
    pack->node_id = n->node_id;
    //send (node-info about n) back to the (node that requested the lookup)
    forward(peer_from_packet(p), pack);

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
        lookup_peer(hash_id);
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
            fprintf(stderr, "Lol! This should not happen!\n");
            return answer_lookup(p, self);
        } else if (peer_is_responsible(self->node_id, succ->node_id,
                                       p->hash_id)) {
            return answer_lookup(p, succ);
        } else {
            // Great! Somebody else's job!
            forward(succ, p);
        }
    } else if (p->flags & PKT_FLAG_RPLY) {
        // Look for open requests and proxy them
        peer *n = peer_from_packet(p);
        for (request *r = get_requests(rt, p->hash_id); r != NULL;
             r = r->next) {
            proxy_request(srv, r->socket, r->packet, n);
            server_close_socket(srv, r->socket);
        }
        clear_requests(rt, p->hash_id);
    } else {
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
 *
 * Requires 9 arguments:
 * 1. Id
 * 2. Hostname
 * 3. Port
 * 4. Id of the predecessor
 * 5. Hostname of the predecessor
 * 6. Port of the predecessor
 * 7. Id of the successor
 * 8. Hostname of the successor
 * 9. Port of the successor
 *
 * @param argc The number of arguments
 * @param argv The arguments
 * @return int The exit code
 */
int main(int argc, char **argv) {

    if (argc < 10) {
        fprintf(stderr, "Not enough args! I need ID IP PORT ID_P IP_P PORT_P "
                        "ID_S IP_S PORT_S\n");
    }

    // Read arguments for self
    uint16_t idSelf = strtoul(argv[1], NULL, 10);
    char *hostSelf = argv[2];
    char *portSelf = argv[3];

    // Read arguments for predecessor
    uint16_t idPred = strtoul(argv[4], NULL, 10);
    char *hostPred = argv[5];
    char *portPred = argv[6];

    // Read arguments for successor
    uint16_t idSucc = strtoul(argv[7], NULL, 10);
    char *hostSucc = argv[8];
    char *portSucc = argv[9];

    // Initialize all chord peers
    self = peer_init(
        idSelf, hostSelf,
        portSelf); //  Not really necessary but convenient to store us as a peer
    pred = peer_init(idPred, hostPred, portPred); //

    succ = peer_init(idSucc, hostSucc, portSucc);

    // Initialize outer server for communication with clients
    server *srv = server_setup(portSelf);
    if (srv == NULL) {
        fprintf(stderr, "Server setup failed!\n");
        return -1;
    }
    // Initialize hash table
    ht = (htable **)malloc(sizeof(htable *));
    // Initiale reuqest table
    rt = (rtable **)malloc(sizeof(rtable *));
    *ht = NULL;
    *rt = NULL;

    srv->packet_cb = handle_packet;
    server_run(srv);
    close(srv->socket);
}
