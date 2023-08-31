import java.util.LinkedList;
import java.util.Queue;

public class KnapsackBottomUpSpaceEfficient
{
  public int W;
  public int K;
  public int[] weight;
  public double[] value;
  private double[][] M;

  public KnapsackBottomUpSpaceEfficient(int[] weight, double[] value, int W) {
    this.W = W;
    this.K = weight.length - 1;
    this.weight = weight;
    this.value = value;
    M = new double[2][W+1];
    for (int w = 0; w <= W; w++) {
      M[0][w] = 0.0;
      for (int k = 1; k <= K; k++)
        if (weight[k] > w)
          M[k%2][w] = M[(k-1)%2][w];
        else
          M[k%2][w] = Math.max( value[k] + M[(k-1)%2][w-weight[k]], M[(k-1)%2][w] );
    }
  }

  public double opt(int K, int W)
  {
    return M[K%2][W];
  }

  public static void main(String[] args)
  {
    double[] value = {0, 2, 3, 1, 5, 7, 3, 6};
    int[] weight =   {0, 3, 4, 2, 4, 7, 3, 5};
    int maxWeight = 14;

    KnapsackBottomUpSpaceEfficient knapsack = new KnapsackBottomUpSpaceEfficient(weight, value, maxWeight);
    double optValue = knapsack.opt(knapsack.K, knapsack.W);
    System.out.println("Optimal value: " + optValue);

    // a-posteriori reconstruction of the solution is not possible in the space efficient version
  }
}
