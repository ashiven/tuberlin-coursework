import java.util.LinkedList;
import java.util.PriorityQueue;
import java.util.Queue;

public class WeightedIntervalScheduling {
    LinkedList<WeightedInterval> intervals;
    private double[] M;

    public WeightedIntervalScheduling(LinkedList<WeightedInterval> intervals) {
        LinkedList<WeightedInterval> intervalsByFinish = new LinkedList(intervals);
        intervalsByFinish.sort(new IntervalCompareFinishTime());
        int K = intervals.size() + 1;
        M = new double[K];
        this.intervals = new LinkedList<>(intervals);
        // The implementation of calculating p(k) is a bit more complicated here
        // in order to obtain the desired running time of O(K log K)
        this.intervals.sort(new IntervalCompareStartTime());
        int pk = 0;
        for (WeightedInterval iv : this.intervals) {
            while (intervalsByFinish.get(pk).finish <= iv.start) {
                pk++;
            }
            iv.setP(pk);
        }
        this.intervals.sort(new IntervalCompareFinishTime());
    }

    public double opt(int K) {
        M[0] = 0;
        for (int k = 1; k <= K; k++) {
            WeightedInterval iv = intervals.get(k-1);
            M[k] = Math.max(iv.weight + M[iv.getP()], M[k - 1]);
        }
        return M[K];
    }

    public static void main(String[] args) {
        double[] start = {9.5, 9.5, 9.5, 11, 11, 13, 13, 14, 15, 15};
        double[] finish = {10.5, 12.5, 10.5, 12.5, 14, 14.5, 14.5, 16.5, 16.5, 16.5};
        int[] weight = {3, 5, 8, 4, 6, 2, 5, 6, 5, 3};
        LinkedList<WeightedInterval> intervals = new LinkedList<>();
        for (int i = 0; i < start.length; i++) {
            intervals.add(new WeightedInterval(start[i], finish[i], weight[i]));
        }

        WeightedIntervalScheduling scheduler = new WeightedIntervalScheduling(intervals);
        System.out.println("Optimal weight: " + scheduler.opt(start.length));
/*    for (WeightedInterval iv : schedule)
      System.out.println(iv.start() + "-" + iv.finish() + "  with weight " + iv.weight());
  }*/
    }
}
