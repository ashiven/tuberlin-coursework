import java.util.Comparator;

public class SortByAge implements Comparator<Person> {
    public int compare(Person person1, Person person2) {
        return Integer.compare(person1.age, person2.age);
        // auch möglich:
        // return ((Integer)person1.age).compareTo(person2.age);
        // auch möglich
        // return (person1.age < person2.age) ? -1 : (person1.age == person2.age) ? 0 : 1;
    }
}
