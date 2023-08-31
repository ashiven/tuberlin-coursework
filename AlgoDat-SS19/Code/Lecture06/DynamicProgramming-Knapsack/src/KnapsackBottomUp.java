import java.util.LinkedList;
import java.util.Queue;

public class KnapsackBottomUp {
    public int W;
    public int K;
    public int[] weight;
    public double[] value;
    private double[][] M;
    private Queue<Integer> inventory = new LinkedList<>();

    public KnapsackBottomUp(int[] weight, double[] value, int W) {
        this.W = W;
        this.K = weight.length - 1;
        this.weight = weight;
        this.value = value;
        M = new double[K + 1][W + 1];
        for (int w = 0; w <= W; w++) {
            M[0][w] = 0.0;
            for (int k = 1; k <= K; k++) {
                if (weight[k] > w) {
                    M[k][w] = M[k - 1][w];
                } else {
                    M[k][w] = Math.max(value[k] + M[k - 1][w - weight[k]], M[k - 1][w]);
                }
            }
        }
    }

    public double opt(int K, int W) {
        return M[K][W];
    }

    public void findSolution(int k, int w) {
        if (k == 0)
            return;
        else if (weight[k] > w) {
            findSolution(k - 1, w);
        } else if (value[k] + M[k - 1][w - weight[k]] > M[k - 1][w]) {
            findSolution(k - 1, w - weight[k]);
            inventory.add(k);
        } else {
            findSolution(k - 1, w);
        }
    }

    public static void main(String[] args) {
        double[] value = {0, 2, 3, 1, 5, 7, 3, 6};
        int[] weight = {0, 3, 4, 2, 4, 7, 3, 5};
        int maxWeight = 14;

        KnapsackBottomUp knapsack = new KnapsackBottomUp(weight, value, maxWeight);
        double optValue = knapsack.opt(knapsack.K, knapsack.W);
        System.out.println("Optimal value: " + optValue);

        knapsack.findSolution(knapsack.K, knapsack.W);

        System.out.println("Optimal load: ");
        for (int k : knapsack.inventory) {
            System.out.println(knapsack.weight[k] + " - " + knapsack.value[k]);
        }
    }
}
