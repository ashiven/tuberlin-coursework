import java.util.Comparator;

public class IntervalCompareFinishTime implements Comparator<WeightedInterval> {
    @Override
    public int compare(WeightedInterval i1, WeightedInterval i2) {
        return Double.compare(i1.finish, i2.finish);
    }
}
