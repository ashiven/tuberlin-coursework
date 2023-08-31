public class FibonacciBottomUp {
    private static long[] F;

    public static long fibonacci(int n) {
        F = new long[n + 1];
        F[0] = 0;
        F[1] = 1;
        for (int k = 2; k <= n; k++) {
            F[k] = F[k - 1] + F[k - 2];
        }
        return F[n];
    }

    public static void main(String[] args) {
        int n = 45;
        long Fn = fibonacci(n);
        System.out.println("F(" + n + ") = " + Fn);
    }
}