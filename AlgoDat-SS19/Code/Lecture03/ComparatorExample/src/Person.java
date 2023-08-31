import java.util.ArrayList;

public class Person {
    protected String name;
    protected int age;
    protected double height;

    public Person(String name, int age, double height) {
        this.name = name;
        this.age = age;
        this.height = height;
    }

    public String toString() {
        return "(" + name + ", " + age + "y, " + height + "cm)";
    }

    public static void main(String[] args) {
        ArrayList<Person> personen = new ArrayList<>();
        personen.add(new Person("Peter",80, 175.8));
        personen.add(new Person("Paul", 81, 178.7));
        personen.add(new Person("Mary", 82, 177.2));

        personen.sort(new SortByAge());
        System.out.println("Sorted by Age:\n" + personen);

        personen.sort(new SortByName());
        System.out.println("Sorted by Name:\n" + personen);

        personen.sort(new SortByHeight());
        System.out.println("Sorted by Height:\n" + personen);

        personen.sort(new SortByHeight().reversed());
        System.out.println("Descending by Height:\n" + personen);
    }
}
