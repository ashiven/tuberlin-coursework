import java.util.Comparator;

public class IntervalCompareFinishTime implements Comparator<Interval> {
    @Override
    public int compare(Interval i1, Interval i2) {
        return Double.compare(i1.finish(), i2.finish());
    }
}
