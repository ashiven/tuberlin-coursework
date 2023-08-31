// Implementation by Sedgewick & Wayne, slightly modified
// For their clean implementation, see:
//   https://algs4.cs.princeton.edu/24pq/IndexMinPQ.java
// For background information on IndexPQs see:
//   https://algs4.cs.princeton.edu/24pq

public class IndexPQ<K extends Comparable<K>>
{
    private K[] keys;
    private int[] pq;
    private int[] qp;  // pq[qp[k]] = qp[pq[k]] = k
    private int N;
    private int sign;  // +1 IndexMaxPQ, -1 IndexMinPQ

    public IndexPQ(int capacity, int sign) {
        keys = (K[]) new Comparable[capacity];
        pq = new int[capacity + 1];
        qp = new int[capacity];
        for (int i = 0; i < capacity; i++)
            qp[i] = -1;
        this.sign = sign;
    }

    public IndexPQ(int capacity) {
        this(capacity, 1);
    }

    public int size() {
        return N;
    }

    public boolean isEmpty() {
        return N == 0;
    }

    public boolean contains(int i) {
        return qp[i] != -1;
    }

    public void add(int i, K key) {
        qp[i] = ++N;
        pq[N] = i;
        keys[i] = key;
        swim(N);
    }

    public int peekIndex() {
        return pq[1];
    }

    public K peek() {
        return keys[pq[1]];
    }

    public int poll() {
        int head = pq[1];
        swap(1, N--);
        sink(1);
        qp[head] = -1;
        keys[head] = null;
        pq[N+1] = -1;
        return head;
    }

    public K keyOf(int i) {
        return keys[i];
    }

    public void change(int i, K key) {
        keys[i] = key;
        swim(qp[i]);
        sink(qp[i]);
    }

    public void decreaseKey(int i, K key) {
        keys[i] = key;
        swim(qp[i]);
    }

    public void increaseKey(int i, K key)
    {
        keys[i] = key;
        sink(qp[i]);
    }

    public void remove(int i) {
        int index = qp[i];
        swap(index, N--);
        swim(index);
        sink(index);
        keys[i] = null;
        qp[i] = -1;
    }

    // ----- Private methods:

    private boolean order(int i, int j) {
        return sign * keys[pq[i]].compareTo(keys[pq[j]]) >= 0;
    }

    private void swap(int i, int j) {
        int swap = pq[i];
        pq[i] = pq[j];
        pq[j] = swap;
        qp[pq[i]] = i;
        qp[pq[j]] = j;
    }

    private void swim(int k) {
        while (k > 1 && !order(k / 2, k)) {
            swap(k / 2, k);
            k = k / 2;
        }
    }

    private void sink(int k) {
        while (2 * k <= N) {
            int j = 2 * k;
            if (j < N && !order(j, j + 1))
                j++;
            if (order(k, j))
                break;
            swap(k, j);
            k = j;
        }
    }


    public static void main(String[] args) {
        // insert a bunch of strings
        String[] strings = { "it", "was", "the", "best", "of", "times", "it", "was", "the", "worst" };

        IndexPQ<String> pq = new IndexPQ<String>(strings.length, -1);
        for (int i = 0; i < strings.length; i++) {
            pq.add(i, strings[i]);
        }

        System.out.println("#Elemente: " + pq.size());

        // delete and print each key
        while (!pq.isEmpty()) {
            int i = pq.poll();
            System.out.println(i + " " + strings[i]);
        }
    }

}
