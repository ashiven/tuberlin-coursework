public class readNumberNaiv
{
    public static void getInteger()
    {
        String str = javax.swing.JOptionPane.showInputDialog("Zahl eingeben: ");
        int number = Integer.parseInt(str);
        System.out.println("Die Zahl " + number + " war lecker!");
    }

    public static void main(String[] args)
    {
        getInteger();
    }
}
