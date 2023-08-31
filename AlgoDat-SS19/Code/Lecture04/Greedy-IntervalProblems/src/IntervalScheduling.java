import java.util.LinkedList;
import java.util.PriorityQueue;
import java.util.Queue;
import java.util.Stack;

public abstract class IntervalScheduling {
    public static Iterable<Interval> intervalScheduling(Iterable<Interval> intervals) {
        PriorityQueue<Interval> pq = new PriorityQueue<>(new IntervalCompareFinishTime());
        for (Interval i : intervals)
            pq.add(i);

        Queue<Interval> queue = new LinkedList<>();
        double finishTime = 0;
        while (!pq.isEmpty()) {
            Interval iv = pq.poll();
            if (iv.start() >= finishTime) {
                queue.add(iv);
                finishTime = iv.finish();
            }
        }
        return queue;
    }

    public static void main(String[] args) {
        double[] start = {9.5, 9.5, 9.5, 11, 11, 13, 13, 14, 15, 15};
        double[] finish = {10.5, 12.5, 10.5, 12.5, 14, 14.5, 14.5, 16.5, 16.5, 16.5};
/*    Queue<Interval> intervals = new LinkedList<Interval>();
    for (int i = 0; i < start.length; i++)
      intervals.enqueue(new Interval(i, start[i], finish[i])); */
        Stack<Interval> intervals = new Stack<>();
        for (int i = 0; i < start.length; i++)
            intervals.push(new Interval(start[i], finish[i]));

        Iterable<Interval> schedule = intervalScheduling(intervals);

        for (Interval iv : schedule)
            System.out.print(iv.start() + "-" + iv.finish() + "   ");
        System.out.println();
    }
}
