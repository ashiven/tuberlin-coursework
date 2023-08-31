import java.util.PriorityQueue;

public class BnBKnapsackPQ extends KnapsackPacker {

    public BnBKnapsackPQ(Item[] items, double capacity) {
        super(items, capacity);
    }

    @Override
    public Knapsack branchAndBound() {
        PriorityQueue<PSolBound> queue = new PriorityQueue<>();
        queue.add(new PSolBound(new Knapsack(capacity), items, 0));
        while (!queue.isEmpty()) {
            loopruns++;
            PSolBound psol = queue.poll();
            if (psol.level == items.length) {
                return psol.knapsack;
            } else {
                queue.add(new PSolBound(psol.knapsack, items, psol.level + 1));
                Item newItem = items[psol.level];
                if (newItem.weight <= psol.knapsack.residualCapacity) {
                    Knapsack knapsack = new Knapsack(psol.knapsack);
                    knapsack.addItem(newItem);
                    queue.add(new PSolBound(knapsack, items, psol.level + 1));
                }
            }
        }
        return null;
    }
}
