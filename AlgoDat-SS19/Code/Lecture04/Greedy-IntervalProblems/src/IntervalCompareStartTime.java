import java.util.Comparator;

public class IntervalCompareStartTime implements Comparator<Interval> {
    @Override
    public int compare(Interval i1, Interval i2) {
        return Double.compare(i1.start(), i2.start());
    }
}
