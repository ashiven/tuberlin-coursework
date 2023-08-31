public class FibonacciClosedForm {
    public static long fibonacci(int n) {
        double phi = (Math.sqrt(5) + 1) / 2.0;
        return Math.round((Math.pow(phi, n) - (-Math.pow(phi, -n))) / Math.sqrt(5));
    }

    public static void main(String[] args) {
        int n = 45;
        long Fn = fibonacci(n);
        System.out.println("F(" + n + ") = " + Fn);
    }
}
