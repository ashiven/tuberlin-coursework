import java.util.LinkedList;

public class Permutations {
    private int N;
    private int[] a;

    public Permutations(int N) {
        this.N = N;
        a = new int[N];
    }

    public void backtracking() { backtracking(0); }

    public void backtracking(int k) {
        if (k == N)
            printSolution();
        else {
            Iterable<Integer> candidates = candidateList(k);
            for (Integer c : candidates) {
                a[k] = c;
                backtracking(k + 1);
            }
        }
    }

    public Iterable<Integer> candidateList(int k) {
        LinkedList<Integer> c = new LinkedList<>();
        boolean[] used = new boolean[N];

        for (int i = 0; i < k; i++)
            used[a[i]] = true;

        for (int i = 0; i < N; i++)
            if (!used[i])
                c.add(i);

        return c;
    }

    public void printSolution() {
        for (int i : a)
            System.out.print(i + " ");
        System.out.println();
    }

    public static void main(String[] args) {
        Permutations permutations = new Permutations(5);
        permutations.backtracking();
    }
}
