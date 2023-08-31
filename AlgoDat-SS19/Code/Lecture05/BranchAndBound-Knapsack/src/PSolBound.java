public class PSolBound implements Comparable<PSolBound> {
    public Knapsack knapsack;
    public int level;
    private double bound;

    public PSolBound(Knapsack knapsack, Item[] items, int level) {
        this.knapsack = knapsack;
        this.bound = bound(knapsack, items, level);
        this.level = level;
    }

    public double bound(Knapsack knapsack, Item[] items, int startIndex) {
        double residualCapacity = knapsack.residualCapacity;
        double addedValue = 0;
        for (int k = startIndex; k < items.length; k++) {
            double weight = items[k].weight;
            if (weight <= residualCapacity) {
                addedValue += items[k].value;
                residualCapacity -= weight;
            } else {
                addedValue += items[k].value * residualCapacity / weight;
                break;
            }
        }
        return knapsack.value() + addedValue;
    }

    @Override
    public int compareTo(PSolBound that) {
        return -Double.compare(this.bound, that.bound);
    }
}
