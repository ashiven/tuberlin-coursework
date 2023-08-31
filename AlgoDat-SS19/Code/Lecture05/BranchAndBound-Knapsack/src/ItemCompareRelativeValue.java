import java.util.Comparator;

public class ItemCompareRelativeValue implements Comparator<Item> {
    @Override public int compare(Item item1, Item item2)
    {
        return Double.compare(item1.value/item1.weight, item2.value/item2.weight);
    }
}
