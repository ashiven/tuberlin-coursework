public class SumWithAHoleCorrected {

    public static void main(String[] args) {
        int N = 10;
        // calculate the sum 1/1 + 1/2 + ... + 1/N
        double sum = 0;
        for (int n = 1; n <= N; n++) {
            sum += 1.0/n;
        }
        System.out.println("Die Summe ist: " + sum);
    }
}
