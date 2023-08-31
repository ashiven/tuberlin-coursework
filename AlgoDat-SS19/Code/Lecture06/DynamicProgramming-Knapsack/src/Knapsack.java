import java.util.LinkedList;
import java.util.Queue;

public class Knapsack {

    public int W;
    public int K;
    public int[] weight;
    public double[] value;
    private double[][] M;
    private Queue<Integer> inventory = new LinkedList<>();

    public Knapsack(int[] weight, double[] value, int W) {
        this.W = W;
        this.K = weight.length - 1;
        this.weight = weight;
        this.value = value;
        M = new double[K + 1][W + 1];
        for (int w = 0; w <= W; w++) {
            M[0][w] = 0.0;
            for (int k = 1; k <= K; k++) {
                M[k][w] = -1.0;
            }
        }
    }

    public double opt(int k, int w) {
        if (M[k][w] < 0) {
            if (weight[k] > w) {
                M[k][w] = opt(k - 1, w);
            } else {
                M[k][w] = Math.max(value[k] + opt(k - 1, w - weight[k]), opt(k - 1, w));
            }
        }
        return M[k][w];
    }

    public void knapsackInventory(int k, int w) {
        if (k == 0)
            return;
        else if (weight[k] > w) {
            knapsackInventory(k - 1, w);
        } else if (value[k] + M[k - 1][w - weight[k]] > M[k - 1][w]) {
            knapsackInventory(k - 1, w - weight[k]);
            inventory.add(k);
        } else {
            knapsackInventory(k - 1, w);
        }
    }

    public static void main(String[] args) {
        double[] value = {0, 2, 3, 1, 5, 7, 3, 6};
        int[] weight = {0, 3, 4, 2, 4, 7, 3, 5};
        int maxWeight = 14;

        Knapsack knapsack = new Knapsack(weight, value, maxWeight);
        double optValue = knapsack.opt(knapsack.K, knapsack.W);
        System.out.println("Optimal value: " + optValue);

        knapsack.knapsackInventory(knapsack.K, knapsack.W);
        System.out.println("Optimal load: ");
        for (int k : knapsack.inventory) {
            System.out.println(knapsack.weight[k] + " - " + knapsack.value[k]);
        }
    }
}
