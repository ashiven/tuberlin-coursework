public class readNumber
{
    public static void getInteger()
    {
        int number = 0;
        String str = "";
        while (true) {
            try {
                str = javax.swing.JOptionPane.showInputDialog("Zahl eingeben: ");
                number = Integer.parseInt(str);
                break;
            } catch (NumberFormatException e) {
                System.err.println("'" + str + "' schmeckt mir nicht.");
            }
        }
        System.out.println("Die Zahl " + number + " war lecker!");
    }

    public static void main(String[] args)
    {
        getInteger();
    }
}
    
