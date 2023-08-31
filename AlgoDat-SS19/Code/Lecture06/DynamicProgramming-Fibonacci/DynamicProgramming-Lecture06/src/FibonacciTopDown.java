public class FibonacciTopDown {
    private static long[] F;

    public static long fibonacchi(int n) {
        F = new long[n + 1];
        F[0] = 0;
        F[1] = 1;
        for (int k = 2; k <= n; k++)
            F[k] = -1;
        return fibo(n);
    }

    public static long fibo(int n) {
        if (F[n] < 0)
            F[n] = fibo(n - 1) + fibo(n - 2);
        return F[n];
    }

    public static void main(String[] args) {
        int n = 45;
        long Fn = fibonacchi(n);
        System.out.println("F(" + n + ") = " + Fn);
    }
}