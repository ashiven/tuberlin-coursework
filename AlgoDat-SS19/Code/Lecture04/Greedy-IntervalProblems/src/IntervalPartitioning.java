import java.util.PriorityQueue;
import java.util.Queue;
import java.util.Stack;

public abstract class IntervalPartitioning {

    public static Iterable<Resource> intervalPartitioning(Iterable<Interval> intervals) {
        PriorityQueue<Interval> pq = new PriorityQueue<>(new IntervalCompareStartTime());
        for (Interval iv : intervals)
            pq.add(iv);

        PriorityQueue<Resource> resources = new PriorityQueue<>();
        while (!pq.isEmpty()) {
            Interval iv = pq.poll();
            Resource res = resources.peek();   // null at first iteration
            if (res != null && iv.start() >= res.getFinish()) {
                res.intervals.add(iv);
                resources.poll();                // remove res
                res.setFinish(iv.finish());      // update finish time
                resources.add(res);              // and re-add
            } else
                resources.add(new Resource(iv));
        }

        return resources;
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

        Iterable<Resource> resources = intervalPartitioning(intervals);

        for (Resource res : resources) {
            Queue<Interval> queue = res.intervals;
            for (Interval iv : queue)
                System.out.print(iv.start() + "-" + iv.finish() + "   ");
            System.out.println();
        }

    }

}
