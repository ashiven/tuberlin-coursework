// Sedgewick & Wayne, S. 345

public class PriorityQueue<E extends Comparable<E>> {
    private E[] pq;
    private int N;
    private int sign;  // +1 MaxPQ, -1 MinPQ

    public PriorityQueue(int capacity, int sign) {
        pq = (E[]) new Comparable[capacity + 1];
        this.sign = sign;
    }

    public PriorityQueue(int capacity) {
        this(capacity, 1);
    }

    public int size() {
        return N;
    }

    public boolean isEmpty() {
        return N == 0;
    }

    public void add(E e) {
        pq[++N] = e;
        swim(N);
    }

    public E poll() {
        E head = pq[1];
        swap(1, N);
        pq[N--] = null;
        sink(1);
        return head;
    }

    private void swap(int i, int j) {
        E e = pq[i];
        pq[i] = pq[j];
        pq[j] = e;
    }

    private boolean order(int i, int j) {
        return sign * pq[i].compareTo(pq[j]) >= 0;
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
        int[] testArray = {4, 2, -17, 5, 23, 45, 0, 34, -7, 2, 0, 34};
        int M = 4;

        PriorityQueue<Integer> pq = new PriorityQueue<>(M + 1, -1);
        for (int i : testArray) {
            pq.add(i);
            if (pq.size() > M)
                pq.poll();
        }
        while (pq.size() > 0) {
            int k = pq.poll();
            System.out.println("Element: " + k);
        }
    }
}
