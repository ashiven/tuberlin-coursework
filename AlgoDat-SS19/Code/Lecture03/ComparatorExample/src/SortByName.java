import java.util.Comparator;

public class SortByName implements Comparator<Person> {
    public int compare(Person person1, Person person2) {
        return person1.name.compareTo(person2.name);
    }
}
