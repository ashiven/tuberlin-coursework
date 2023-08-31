public class FibonacciBottomUpSpaceEfficient {
    private static long[] F;

    public static long fibonacci(int n) {
        F = new long[2];
        F[0] = 0;
        F[1] = 1;
        for (int k = 2; k <= n; k++) {
            F[k % 2] = F[(k - 1) % 2] + F[(k - 2) % 2];
        }
        return F[n % 2];
    }

    public static void main(String[] args) {
        int n = 45;
        long Fn = fibonacci(n);
        System.out.println("F(" + n + ") = " + Fn);
    }
}