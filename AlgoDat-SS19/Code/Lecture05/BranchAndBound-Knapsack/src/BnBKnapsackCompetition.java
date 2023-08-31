import java.io.FileInputStream;
import java.util.Random;
import java.util.Scanner;

public class BnBKnapsackCompetition {

    public static Item[] randomItems(int n) {
        Random random = new Random();
        Item[] items = new Item[n];
        for (int i = 0; i < n; i++) {
            items[i] = new Item(10 + random.nextInt(90), 10 + random.nextInt(90));
        }
        return items;
    }

    public static void main(String[] args) throws java.io.FileNotFoundException
    {
        //System.setIn(new FileInputStream(args[0]));
        System.setIn(new FileInputStream("itemlistKolesar1967.txt"));
        Scanner in = new Scanner(System.in);

        int nItems = in.nextInt();
        double capacity = in.nextDouble();
        Item[] items = new Item[nItems];
        for (int k = 0; k < nItems; k++) {
            items[k] = new Item(in.nextDouble(), in.nextDouble());
        }

        Knapsack optKnapsack;
        KnapsackPacker knapsackPacker;

        knapsackPacker = new BranchAndBoundKnapsack(items, capacity);
        optKnapsack = knapsackPacker.branchAndBound();
        System.out.print("*** Optimal ");
        optKnapsack.print();

        knapsackPacker = new BnBKnapsackStack(items, capacity);
        optKnapsack = knapsackPacker.branchAndBound();
        System.out.print("*** Optimal BnB Stack ");
        optKnapsack.print();

        knapsackPacker = new BnBKnapsackQueue(items, capacity);
        optKnapsack = knapsackPacker.branchAndBound();
        System.out.print("*** Optimal BnB Queue ");
        optKnapsack.print();

        knapsackPacker = new BnBKnapsackPQ(items, capacity);
        optKnapsack = knapsackPacker.branchAndBound();
        System.out.print("*** Optimal BnB PQ");
        optKnapsack.print();

        for (int n = 100; n < 10000; n *= 2) {
            System.out.println("\n** n = " + n);
            items = randomItems(n);
            capacity = 25 * n;

            if (n < 5000) {
                knapsackPacker = new BranchAndBoundKnapsack(items, capacity);
                knapsackPacker.branchAndBoundPerformance();
                System.out.println("BnB Classic: " + knapsackPacker.performanceReport());
            }

            knapsackPacker = new BnBKnapsackStack(items, capacity);
            knapsackPacker.branchAndBoundPerformance();
            System.out.println("BnB Stack:   " + knapsackPacker.performanceReport());

            if (n < 500) {
                knapsackPacker = new BnBKnapsackQueue(items, capacity);
                knapsackPacker.branchAndBoundPerformance();
                System.out.println("BnB Queue    " + knapsackPacker.performanceReport());
            }

            knapsackPacker = new BnBKnapsackPQ(items, capacity);
            knapsackPacker.branchAndBoundPerformance();
            System.out.println("BnB PQ       " + knapsackPacker.performanceReport());
        }
    }
}
