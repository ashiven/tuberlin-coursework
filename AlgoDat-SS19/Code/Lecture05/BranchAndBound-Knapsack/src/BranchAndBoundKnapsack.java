public class BranchAndBoundKnapsack extends KnapsackPacker {

    public BranchAndBoundKnapsack(Item[] items, double capacity) {
        super(items, capacity);
    }

    public Knapsack branchAndBound() {
        Knapsack initKnapsack = initialSolution();
        optKnapsack = initKnapsack;
        knapsack = new Knapsack(capacity);
        pack(initKnapsack.value(), 0);
        return optKnapsack;
    }

    public double pack(double lowerBound, int level) {
        loopruns++;
        if (level == items.length) {
            if (knapsack.value() > optKnapsack.value()) {
                optKnapsack = new Knapsack(knapsack);                // copy constructor!!
            }
            return knapsack.value();
        }
        Item newItem = items[level];                                 // include item
        if (newItem.weight <= knapsack.residualCapacity) {           // if it fits
            knapsack.addItem(newItem);
            if (bound(knapsack, level + 1) > lowerBound) {
                double value = pack(lowerBound, level + 1);
                if (value > lowerBound) {
                    lowerBound = value;
                }
            }
            knapsack.removeItem();
        }
        if (bound(knapsack, level + 1) > lowerBound) {       // exclude item
            double value = pack(lowerBound, level + 1);
            if (value > lowerBound) {
                lowerBound = value;
            }
        }
        return lowerBound;
    }
}
