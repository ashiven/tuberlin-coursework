import java.util.Arrays;
import java.util.Collections;

// This is a wrapper for the different implementations.

public abstract class KnapsackPacker {
    protected Item[] items;
    protected double capacity;
    protected Knapsack knapsack;
    protected Knapsack optKnapsack;
    // to measure performance:
    protected long loopruns = 0;
    protected int duration;

    public KnapsackPacker(Item[] items, double capacity) {
        this.items = items;  // Side effect: changing input object!
        Arrays.sort(items, Collections.reverseOrder(new ItemCompareRelativeValue()));
        this.capacity = capacity;
    }

    public Knapsack initialSolution() {
        Knapsack initialKnapsack = new Knapsack(capacity);
        for (Item item : items) {
            if (item.weight < initialKnapsack.residualCapacity) {
                initialKnapsack.addItem(item);
            }
        }
        return initialKnapsack;
    }

    public double bound(Knapsack knapsack, int startIndex) {
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

    public Knapsack branchAndBoundPerformance() {
        loopruns = 0;
        long start = System.nanoTime();
        optKnapsack = branchAndBound();
        duration = Math.round((System.nanoTime() - start) / 1000000);
        return optKnapsack;
    }

    public String performanceReport() {
        return String.format("%8d iterations in %8.3f s: %s", loopruns, duration/1000.0, optKnapsack);
    }

    // to be implemented by subclasses:
    abstract Knapsack branchAndBound();
}
