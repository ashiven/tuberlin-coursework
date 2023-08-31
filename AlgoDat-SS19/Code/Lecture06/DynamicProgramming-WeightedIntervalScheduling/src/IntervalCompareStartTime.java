import java.util.Comparator;

public class IntervalCompareStartTime implements Comparator<WeightedInterval> {
    @Override
    public int compare(WeightedInterval i1, WeightedInterval i2) {
        return Double.compare(i1.start, i2.start);
    }
}
