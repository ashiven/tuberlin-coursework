import java.util.Comparator;

public class SortByHeight implements Comparator<Person> {
    public int compare(Person person1, Person person2) {
        return Double.compare(person1.height, person2.height);
        // auch möglich:
        // return ((Double)person1.height).compareTo(person2.height);
    }
}
