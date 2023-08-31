public class FibonacciRekursiv {
    public static long nCalls;

    public static long fibonacci(int n) {
        nCalls++;
        if (n < 2) {
            return n;
        } else {
            return fibonacci(n - 1) + fibonacci(n - 2);
        }
    }

    public static void main(String[] args) {
        int n = 45;
        long Fn = fibonacci(n);
        System.out.println("F(" + n + ") = " + Fn + " calculated with " + nCalls + " recursive calls.");
    }
}
