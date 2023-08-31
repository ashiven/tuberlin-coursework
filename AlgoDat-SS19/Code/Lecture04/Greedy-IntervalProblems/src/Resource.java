import java.util.LinkedList;
import java.util.Queue;

public class Resource implements Comparable<Resource> {
    private double f;
    public Queue<Interval> intervals;

    public Resource(Interval iv) {
        f = iv.finish();
        intervals = new LinkedList<>();
        intervals.add(iv);
    }

    public double getFinish() {
        return f;
    }

    public void setFinish(double f) {
        this.f = f;
    }

    @Override
    public int compareTo(Resource that) {
        return Double.compare(this.f, that.f);
    }
}
